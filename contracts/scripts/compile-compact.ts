import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function compileCompactContract() {
  const contractsDir = path.resolve(__dirname, '..');
  const compactFilePath = path.join(contractsDir, 'compact', 'battleship.compact');
  const outDir = path.join(contractsDir, 'managed', 'battleship');
  const skipZk = process.env.COMPACT_SKIP_ZK === 'true';
  const flags = skipZk ? '--skip-zk' : '';

  console.log('\n====================================================================');
  console.log('⚡ MIDNIGHT COMPACT CONTRACT COMPILER (Toolchain v0.36.1)');
  console.log('====================================================================');
  console.log(`Source: ${compactFilePath}`);
  console.log(`Output: ${outDir}`);
  console.log(`Mode:   ${skipZk ? 'Fast Check (--skip-zk)' : 'Full ZK Compilation (Prover/Verifier Keys)'}`);

  if (!fs.existsSync(compactFilePath)) {
    console.error(`❌ Compact contract file not found at ${compactFilePath}`);
    process.exit(1);
  }

  // 1. Prefer native `compact` CLI if installed on PATH
  try {
    execSync('compact --version', { stdio: 'ignore' });
    console.log('Detected native `compact` CLI on PATH. Compiling...\n');
    const cmd = `compact compile ${flags} "${compactFilePath}" "${outDir}"`.replace(/\s+/g, ' ');
    execSync(cmd, { stdio: 'inherit' });
    console.log('\n✅ COMPACT CONTRACT COMPILATION SUCCESSFUL');
    return;
  } catch {
    // Fall through to Docker compilation
  }

  // 2. Compile inside Alpine Docker with cached midnight_compact_cache volume
  try {
    execSync('docker info --format "{{.ServerVersion}}"', { stdio: 'ignore' });
  } catch {
    console.error('❌ COMPILATION FAILED: Neither native `compact` CLI nor a running Docker daemon was found.');
    console.error('   Start Docker Desktop or install Midnight Compact CLI (`compact update 0.36.1`).');
    process.exit(1);
  }

  console.log('Compiling via Docker (`compact-v0.5.3` / compiler `0.36.1`)...\n');
  const dockerCmd = [
    'docker run --rm',
    '-v midnight_compact_cache:/root/.compact',
    `-v "${contractsDir}:/work"`,
    'alpine:latest',
    'sh -c "apk add --no-cache bash curl xz ca-certificates gcompat libstdc++ >/dev/null &&',
    'curl -fsSL https://github.com/midnightntwrk/compact/releases/download/compact-v0.5.3/compact-x86_64-unknown-linux-musl.tar.xz',
    '| tar -xJ -C /usr/local/bin --strip-components=1 &&',
    'compact update 0.36.1 >/dev/null &&',
    `compact compile ${flags} /work/compact/battleship.compact /work/managed/battleship"`.replace(/\s+/g, ' '),
  ].join(' ');

  try {
    execSync(dockerCmd, { stdio: 'inherit' });
    console.log('\n✅ COMPACT CONTRACT COMPILATION SUCCESSFUL');
    console.log(`Generated TypeScript + ZKIR + ZK key artifacts at: ${outDir}`);
  } catch (error: any) {
    console.error('\n❌ COMPACT COMPILATION FAILED:', error?.message || error);
    process.exit(1);
  }
}

compileCompactContract();
