// Run bubblewrap build with automated stdin responses
const { spawn } = require('child_process');
const path = require('path');

const bubblewrap = path.join(process.env.APPDATA || '', 'npm', 'bubblewrap.cmd');
const targetDir = path.join(__dirname, 'output', 'twa-project');

console.log('Running bubblewrap build...');
console.log('Target:', targetDir);

const child = spawn('npx', ['@bubblewrap/cli', 'build'], {
  cwd: targetDir,
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
});

let output = '';
child.stdout.on('data', (d) => { output += d.toString(); process.stdout.write(d); });
child.stderr.on('data', (d) => { output += d.toString(); process.stderr.write(d); });

// Auto-answer "y" to any prompts (SDK install, terms, etc.)
setTimeout(() => child.stdin.write('y\n'), 2000);
setTimeout(() => child.stdin.write('y\n'), 4000);
setTimeout(() => child.stdin.write('y\n'), 6000);
setTimeout(() => child.stdin.write('y\n'), 8000);
setTimeout(() => child.stdin.write('y\n'), 10000);

child.on('close', (code) => {
  console.log('\nBubblewrap exited with code:', code);
  process.exit(code);
});
