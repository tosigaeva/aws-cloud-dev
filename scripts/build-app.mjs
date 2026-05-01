import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const appDir = resolve(process.cwd(), process.env.APP_DIR ?? '.');
const packageJsonPath = resolve(appDir, 'package.json');

if (!existsSync(packageJsonPath)) {
  throw new Error(
    `No package.json found in APP_DIR: ${appDir}. Copy this setup into your React Shop fork or set APP_DIR to the app location.`,
  );
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

execSync(`${npmCommand} run build`, {
  cwd: appDir,
  stdio: 'inherit',
  env: process.env,
});
