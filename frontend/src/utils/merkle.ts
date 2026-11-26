import { BOARD_SIZE, ShipPlacement } from '@battleship/shared';
import {
  CompactTypeBytes,
  CompactTypeVector,
  convertBigintToBytes,
  persistentHash,
} from '@midnight-ntwrk/compact-runtime';

export interface CellLeafData {
  cellIndex: number;
  isOccupied: boolean;
  shipId: number; // 0 for empty, 1..5 for ships
  salt: string;   // 64 hex chars (32 bytes)
}

export interface MerkleProof {
  pathHashes: string[];
  pathDirections: boolean[]; // true if current node is right child (aligns with Compact Vector<7, Boolean>)
  pathIndices: number;
}

export interface BoardMerkleTreeResult {
  root: string;
  leaves: CellLeafData[];
  hashedLeaves: string[];
  treeLevels: string[][];
}

// Match compiled contracts/managed/battleship/contract/index.js descriptors byte-for-byte
const BYTES32_TYPE = new CompactTypeBytes(32);
const VECTOR2_BYTES32_TYPE = new CompactTypeVector(2, BYTES32_TYPE);
const VECTOR5_BYTES32_TYPE = new CompactTypeVector(5, BYTES32_TYPE);

function padAsciiBytes32(label: string): Uint8Array {
  const out = new Uint8Array(32);
  const encoded = new TextEncoder().encode(label);
  out.set(encoded.subarray(0, 32), 0);
  return out;
}

const LEAF_DOMAIN_TAG = padAsciiBytes32('battleship:leaf:v1');

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes32(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const padded = clean.padStart(64, '0').slice(0, 64);
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(padded.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return out;
}

function hashPairCompact(left: Uint8Array, right: Uint8Array): Uint8Array {
  return persistentHash(VECTOR2_BYTES32_TYPE, [left, right]);
}

/**
 * Hashes a CellLeaf using Midnight Compact's exact `persistentHash` framing (`battleship:leaf:v1`).
 */
export async function hashCellLeaf(leaf: CellLeafData): Promise<string> {
  const occupied = leaf.isOccupied ? 1n : 0n;
  const digest = persistentHash(VECTOR5_BYTES32_TYPE, [
    LEAF_DOMAIN_TAG,
    convertBigintToBytes(32, BigInt(leaf.cellIndex), 'merkle.ts:cellIndex'),
    convertBigintToBytes(32, occupied, 'merkle.ts:occupied'),
    convertBigintToBytes(32, BigInt(leaf.shipId), 'merkle.ts:shipId'),
    hexToBytes32(leaf.salt),
  ]);
  return bytesToHex(digest);
}

// Map ShipType names to Uint8 ShipId numbers (1..5)
export function getShipId(type: string): number {
  switch (type) {
    case 'Carrier':
      return 1;
    case 'Battleship':
      return 2;
    case 'Cruiser':
      return 3;
    case 'Submarine':
      return 4;
    case 'Destroyer':
      return 5;
    default:
      return 0;
  }
}

/**
 * Generates a cryptographically random 32-byte 0x-prefixed match identifier.
 */
export function generateMatchIdBytes32(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${bytesToHex(bytes)}`;
}

/**
 * Builds a 100-leaf Merkle Tree using Midnight Compact's `persistentHash` circuit math.
 */
export async function buildBoardMerkleTree(ships: ShipPlacement[]): Promise<BoardMerkleTreeResult> {
  const occupiedMap = new Map<number, number>();

  for (const ship of ships) {
    const sId = getShipId(ship.type);
    for (const cell of ship.occupiedCells) {
      const idx = cell.y * BOARD_SIZE + cell.x;
      occupiedMap.set(idx, sId);
    }
  }

  const leaves: CellLeafData[] = [];
  const leafHashes: string[] = [];

  for (let i = 0; i < 100; i++) {
    const shipId = occupiedMap.get(i) || 0;
    const isOccupied = shipId > 0;
    const saltArray = new Uint8Array(32);
    crypto.getRandomValues(saltArray);
    const salt = bytesToHex(saltArray);

    const leaf: CellLeafData = {
      cellIndex: i,
      isOccupied,
      shipId,
      salt,
    };

    leaves.push(leaf);
    leafHashes.push(await hashCellLeaf(leaf));
  }

  // Pad leaves up to 128 (2^7) for 7-level Compact Merkle verification
  const paddedHashes = [...leafHashes];
  while (paddedHashes.length < 128) {
    const padTag = padAsciiBytes32(`battleship:pad:${paddedHashes.length}`);
    const padHash = bytesToHex(hashPairCompact(padTag, new Uint8Array(32)));
    paddedHashes.push(padHash);
  }

  let currentLevel = paddedHashes;
  const treeLevels: string[][] = [currentLevel];

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const parentBytes = hashPairCompact(
        hexToBytes32(currentLevel[i]),
        hexToBytes32(currentLevel[i + 1])
      );
      nextLevel.push(bytesToHex(parentBytes));
    }
    treeLevels.push(nextLevel);
    currentLevel = nextLevel;
  }

  return {
    root: `0x${currentLevel[0]}`,
    leaves,
    hashedLeaves: leafHashes,
    treeLevels,
  };
}

/**
 * Generates a Merkle path proof for a specific cell index (0..99).
 */
export function generateCellMerkleProof(
  cellIndex: number,
  treeLevels: string[][]
): MerkleProof {
  const pathHashes: string[] = [];
  const pathDirections: boolean[] = [];
  let pathIndices = 0;
  let currIdx = cellIndex;

  for (let level = 0; level < treeLevels.length - 1; level++) {
    const isRight = currIdx % 2 === 1;
    const siblingIdx = isRight ? currIdx - 1 : currIdx + 1;
    pathHashes.push(treeLevels[level][siblingIdx]);
    pathDirections.push(isRight);
    if (isRight) {
      pathIndices |= 1 << level;
    }
    currIdx = Math.floor(currIdx / 2);
  }

  return {
    pathHashes,
    pathDirections,
    pathIndices,
  };
}

/**
 * Verifies a cell leaf + Merkle inclusion/exclusion path using Compact's `persistentHash`.
 */
export async function verifyCellMerkleProof(
  leaf: CellLeafData,
  proof: MerkleProof,
  expectedRoot: string
): Promise<boolean> {
  if (proof.pathHashes.length !== 7 || proof.pathDirections.length !== 7) return false;
  let currBytes = hexToBytes32(await hashCellLeaf(leaf));

  for (let i = 0; i < proof.pathHashes.length; i++) {
    const siblingBytes = hexToBytes32(proof.pathHashes[i]);
    const isRight = proof.pathDirections[i];
    currBytes = isRight
      ? hashPairCompact(siblingBytes, currBytes)
      : hashPairCompact(currBytes, siblingBytes);
  }

  return `0x${bytesToHex(currBytes)}` === expectedRoot.toLowerCase();
}
