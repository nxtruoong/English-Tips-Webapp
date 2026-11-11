// Start the Vite dev server unless one is already answering on the dev port.
// Used by the VS Code F5 pre-launch task, which waits for the "Local:" line.
import { spawn } from 'node:child_process';

const url = 'http://127.0.0.1:5173/';

async function running() {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch {
    return false;
  }
}

if (await running()) {
  console.log(`Dev server already running.\n  ➜  Local:   ${url}`);
} else {
  const child = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });
  child.on('exit', code => process.exit(code ?? 0));
}
