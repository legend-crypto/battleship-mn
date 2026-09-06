import { BOARD_SIZE, ShipPlacement, SHIP_SIZES } from '@battleship/shared';

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

// Simple browser-compatible SHA-256 string hashing function
async function sha256Hex(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
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
 * Builds a 100-leaf Merkle Tree for a 10x10 fleet placement.
 * Computes cell leaves (indices 0..99), assigns secret salts, and calculates the 32-byte Merkle root (`board_commitment`).
 */
export async function buildBoardMerkleTree(ships: ShipPlacement[]): Promise<BoardMerkleTreeResult> {
  const occupiedMap = new Map<number, number>();

  // Map occupied cells
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
    // Generate 128-bit random secret salt per cell
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
    const hash = await sha256Hex(`${i}:${isOccupied ? 1 : 0}:${shipId}:${salt}`);
    leafHashes.push(hash);
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
