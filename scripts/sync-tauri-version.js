#!/usr/bin/env node

import fs from 'fs'

// Get version type from command line argument (patch, minor, major)
const versionType = process.argv[2]

if (!versionType || !['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Error: Valid version type is required (patch, minor, major)')
  console.error('Usage: node sync-tauri-version.js <patch|minor|major>')
  process.exit(1)
}

// Read current version from package.json
const pkgPath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const currentVersion = pkg.version

// Parse version
const [major, minor, patch] = currentVersion.split('.').map(Number)

// Calculate new version
let newVersion
if (versionType === 'major') {
  newVersion = `${major + 1}.0.0`
} else if (versionType === 'minor') {
  newVersion = `${major}.${minor + 1}.0`
} else if (versionType === 'patch') {
  newVersion = `${major}.${minor}.${patch + 1}`
}

// Update package.json
pkg.version = newVersion
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

// Update tauri.conf.json
const tauriConfigPath = 'src-tauri/tauri.conf.json'
const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'))
tauriConfig.version = newVersion
fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + '\n')

console.log(`✓ Version bumped: ${currentVersion} → ${newVersion}`)
console.log(`  - package.json: ${newVersion}`)
console.log(`  - tauri.conf.json: ${newVersion}`)
