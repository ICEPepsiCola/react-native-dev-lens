#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

// Read package.json version
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = pkg.version;

// Read tauri.conf.json
const tauriConfigPath = 'src-tauri/tauri.conf.json';
const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));

// Update version
tauriConfig.version = version;

// Write back
fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + '\n');

console.log(`✓ Updated Tauri version to ${version}`);

// Git add and commit
try {
  execSync(`git add ${tauriConfigPath}`, { stdio: 'inherit' });
  execSync(`git commit -m "chore: sync tauri version to ${version}"`, { stdio: 'inherit' });
  console.log('✓ Committed Tauri version update');
} catch (error) {
  // Ignore if nothing to commit
  console.log('✓ No changes to commit');
}
