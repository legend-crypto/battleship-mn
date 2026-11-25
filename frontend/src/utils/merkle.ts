import { BOARD_SIZE, ShipPlacement } from '@battleship/shared';

export interface CellLeafData {
  cellIndex: number;
  isOccupied: boolean;
  shipId: number; // 0 for empty, 1..5 for ships
  salt: string;
}

export interface MerkleProof {
  pathHashes: string[];
  pathIndices: number;
}

export interface BoardMerkleTreeResult {
  root: string;
  leaves: CellLeafData[];
  hashedLeaves: string[];
  treeLevels: string[][];
}

// Browser-compatible SHA-256 hex digest
async function sha256Hex(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashCellLeaf(leaf: CellLeafData): Promise<string> {
  return sha256Hex(`${leaf.cellIndex}:${leaf.isOccupied ? 1 : 0}:${leaf.shipId}:${leaf.salt}`);
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
  return `0x${Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Builds a 100-leaf Merkle Tree for a 10x10 fleet placement.
 * Computes cell leaves (indices 0..99), assigns secret salts, and calculates the 32-byte Merkle root (`board_commitment`).
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
    const saltArray = new Uint8Array(16);
    crypto.getRandomValues(saltArray);
    const salt = Array.from(saltArray).map((b) => b.toString(16).padStart(2, '0')).join('');

    const leaf: CellLeafData = {
      cellIndex: i,
      isOccupied,
      shipId,
      salt
    };

    leaves.push(leaf);
    leafHashes.push(await hashCellLeaf(leaf));
  }

  // Pad leaves up to 128 (next power of 2 >= 100 cells) for 7-level Merkle tree (2^7 = 128)
  const paddedHashes = [...leafHashes];
  while (paddedHashes.length < 128) {
    const padHash = await sha256Hex(`pad_${paddedHashes.length}`);
    paddedHashes.push(padHash);
  }

  let currentLevel = paddedHashes;
  const treeLevels: string[][] = [currentLevel];

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const parentHash = await sha256Hex(currentLevel[i] + currentLevel[i + 1]);
      nextLevel.push(parentHash);
    }
    treeLevels.push(nextLevel);
    currentLevel = nextLevel;
  }

  const root = `0x${currentLevel[0]}`;

  return {
    root,
    leaves,
    hashedLeaves: leafHashes,
    treeLevels
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
  let pathIndices = 0;
  let currIdx = cellIndex;

  for (let level = 0; level < treeLevels.length - 1; level++) {
    const isRight = currIdx % 2 === 1;
    const siblingIdx = isRight ? currIdx - 1 : currIdx + 1;
    pathHashes.push(treeLevels[level][siblingIdx]);
    if (isRight) {
      pathIndices |= 1 << level;
    }
    currIdx = Math.floor(currIdx / 2);
  }

  return {
    pathHashes,
    pathIndices
  };
}

/**
 * Verifies a cell leaf + Merkle inclusion/exclusion path against an expected 0x-prefixed root.
 */
export async function verifyCellMerkleProof(
  leaf: CellLeafData,
  proof: MerkleProof,
  expectedRoot: string
): Promise<boolean> {
  if (proof.pathHashes.length !== 7) return false;
  let currHash = await hashCellLeaf(leaf);

  for (let i = 0; i < proof.pathHashes.length; i++) {
    const siblingHash = proof.pathHashes[i];
    const isRight = (proof.pathIndices & (1 << i)) !== 0;
    currHash = isRight
      ? await sha256Hex(siblingHash + currHash)
      : await sha256Hex(currHash + siblingHash);
  }

  return `0x${currHash}` === expectedRoot.toLowerCase();
}
