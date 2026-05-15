// gen_twa.js — Generate TWA project using Bubblewrap Core API
process.env.NODE_PATH = 'D:\\cry\\桌面\\cf\\${APPDATA}\\npm\\node_modules\\@bubblewrap\\cli\\node_modules';
require('module').Module._initPaths();

const path = require('path');
const core = require('@bubblewrap/core');
const { TwaManifest, TwaGenerator } = core;

const targetDir = path.join(__dirname, 'output', 'twa-project');

async function main() {
  const manifestUrl = 'http://localhost:8080/manifest.json';
  console.log('Fetching manifest from:', manifestUrl);
  
  const twaManifest = await TwaManifest.fromWebManifest(manifestUrl);
  
  console.log('Package ID:', twaManifest.packageId);
  console.log('Name:', twaManifest.name);
  console.log('themeColor:', twaManifest.themeColor);
  console.log('backgroundColor:', twaManifest.backgroundColor);
  
  // Customize
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
  console.error(err.stack);
  process.exit(1);
});
