import { describe, expect, it } from 'vitest';
import { generateRandomBoard } from '@battleship/shared';
import {
  buildBoardMerkleTree,
  generateCellMerkleProof,
  generateMatchIdBytes32,
  hashCellLeaf,
  verifyCellMerkleProof,
} from '../merkle';

describe('Compact persistentHash Merkle Engine (frontend)', () => {
  it('generates distinct 32-byte 0x-prefixed match IDs', () => {
    const a = generateMatchIdBytes32();
    const b = generateMatchIdBytes32();
    expect(a).toMatch(/^0x[0-9a-f]{64}$/);
    expect(b).toMatch(/^0x[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });

  it('builds a 100-cell board tree and verifies valid cell proofs via pathDirections', async () => {
    const board = generateRandomBoard();
    const tree = await buildBoardMerkleTree(board.ships);

    expect(tree.root).toMatch(/^0x[0-9a-f]{64}$/);
    expect(tree.leaves).toHaveLength(100);
    expect(tree.leaves.filter((l) => l.isOccupied)).toHaveLength(17);

    const occupiedLeaf = tree.leaves.find((l) => l.isOccupied)!;
    const emptyLeaf = tree.leaves.find((l) => !l.isOccupied)!;

    const occProof = generateCellMerkleProof(occupiedLeaf.cellIndex, tree.treeLevels);
    const empProof = generateCellMerkleProof(emptyLeaf.cellIndex, tree.treeLevels);

    expect(occProof.pathHashes).toHaveLength(7);
    expect(occProof.pathDirections).toHaveLength(7);
    expect(await verifyCellMerkleProof(occupiedLeaf, occProof, tree.root)).toBe(true);
    expect(await verifyCellMerkleProof(emptyLeaf, empProof, tree.root)).toBe(true);
  });

  it('rejects forged leaf status, wrong index proof, and tampered sibling hashes', async () => {
    const board = generateRandomBoard();
    const tree = await buildBoardMerkleTree(board.ships);
    const emptyLeaf = tree.leaves.find((l) => !l.isOccupied)!;
    const proof = generateCellMerkleProof(emptyLeaf.cellIndex, tree.treeLevels);

    // Forged occupation claim
    expect(
      await verifyCellMerkleProof({ ...emptyLeaf, isOccupied: true, shipId: 1 }, proof, tree.root)
    ).toBe(false);

    // Wrong cell proof
    const wrongIdx = (emptyLeaf.cellIndex + 1) % 100;
    const wrongProof = generateCellMerkleProof(wrongIdx, tree.treeLevels);
    expect(await verifyCellMerkleProof(emptyLeaf, wrongProof, tree.root)).toBe(false);

    // Tampered sibling hash
    const tampered = {
      ...proof,
      pathHashes: ['f'.repeat(64), ...proof.pathHashes.slice(1)],
    };
    expect(await verifyCellMerkleProof(emptyLeaf, tampered, tree.root)).toBe(false);

    // Leaf hashes are distinct for different cells
    expect(await hashCellLeaf(tree.leaves[0])).not.toBe(await hashCellLeaf(tree.leaves[1]));
  });
});
