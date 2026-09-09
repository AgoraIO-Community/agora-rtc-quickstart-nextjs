import fs from 'node:fs';
import path from 'node:path';
import {
  isSupportedNodeVersion,
  supportedNodeDescription,
} from './node-support.mjs';
import {
  detectPackageManager,
  resolvePackageManagerSupport,
} from './package-manager-support.mjs';

const projectRoot = process.cwd();

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!isSupportedNodeVersion(process.versions.node)) {
  fail(`${supportedNodeDescription} is required. Current version: ${process.versions.node}`);
}

for (const requiredFile of ['package.json', 'pnpm-lock.yaml', 'env.local.example']) {
  if (!fs.existsSync(path.join(projectRoot, requiredFile))) {
    fail(`Missing required file: ${requiredFile}`);
  }
}

let packageManagerSupport;
try {
  const packageManifest = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
  );
  packageManagerSupport = resolvePackageManagerSupport(packageManifest.packageManager);
} catch (error) {
  fail(`Invalid package manager contract: ${error.message}`);
}

if (!detectPackageManager(process.env.npm_config_user_agent, packageManagerSupport.requirement)) {
  fail(
    `${packageManagerSupport.requirement.spec} or npm from a supported Node.js installation is required. Run: ${packageManagerSupport.fallbackCommands.doctor}`,
  );
}

const envPath = path.join(projectRoot, '.env.local');
if (!fs.existsSync(envPath)) {
  fail('Missing .env.local. Copy env.local.example to .env.local and add Agora credentials.');
}

const envContents = fs.readFileSync(envPath, 'utf8');
for (const key of ['NEXT_PUBLIC_AGORA_APP_ID', 'NEXT_AGORA_APP_CERTIFICATE']) {
  if (!new RegExp(`^${key}=.+$`, 'm').test(envContents)) {
    fail(`.env.local is missing a non-empty ${key} value.`);
  }
}

console.log('Doctor checks passed.');
