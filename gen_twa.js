// gen_twa.js — Generate TWA project using Bubblewrap Core API (cross-platform)
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Find @bubblewrap/core via @bubblewrap/cli
const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
const corePaths = [
  path.join(globalRoot, '@bubblewrap', 'cli', 'node_modules', '@bubblewrap', 'core'),
  path.join(globalRoot, '@bubblewrap', 'core'),
];

let core = null;
for (const p of corePaths) {
  try {
    core = require(p);
    break;
  } catch (_) {}
}
if (!core) {
  // Try APP_DATA on Windows
  const appdata = process.env.APPDATA || '';
  const altPath = path.join(appdata, 'npm', 'node_modules', '@bubblewrap', 'cli', 'node_modules', '@bubblewrap', 'core');
  try { core = require(altPath); } catch (_) {}
}
if (!core) {
  console.error('Cannot find @bubblewrap/core. globalRoot:', globalRoot);
  process.exit(1);
}

const { TwaManifest, TwaGenerator } = core;
const targetDir = path.join(__dirname, 'output', 'twa-project');

async function main() {
  const manifestUrl = 'http://localhost:8080/manifest.json';
  console.log('Fetching manifest from:', manifestUrl);
  
  const twaManifest = await TwaManifest.fromWebManifest(manifestUrl);
  
  console.log('Package ID:', twaManifest.packageId);
  console.log('Name:', twaManifest.name);
  
  twaManifest.packageId = 'app.guangyu.light';
  twaManifest.name = '光予';
  twaManifest.launcherName = '光予';
  twaManifest.appVersionCode = 1;
  twaManifest.appVersionName = '1.0.0';
  
  console.log('\nGenerating project...');
  const twaGenerator = new TwaGenerator();
  await twaGenerator.createTwaProject(targetDir, twaManifest);
  console.log('Project generated at:', targetDir);
  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
