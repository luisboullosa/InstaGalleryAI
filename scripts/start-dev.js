#!/usr/bin/env node
// Start Next dev while ensuring a server-side localStorage shim is injected
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const shimPath = path.resolve(__dirname, 'server-localstorage-shim.js');
// Load .env.local if present to supply development secrets (not committed)
try {
	require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (e) {}

const env = { ...process.env };
if (!env.INSTAGRAM_ACCESS_TOKEN) {
	console.warn('Warning: INSTAGRAM_ACCESS_TOKEN not set in environment. Set it in .env.local for local development.');
}
const existingNodeOptions = env.NODE_OPTIONS ? `${env.NODE_OPTIONS} ` : '';
env.NODE_OPTIONS = `${existingNodeOptions}--require=${shimPath}`.trim();

const localStorageFilePath = path.resolve(process.cwd(), '.next', 'localstorage');
fs.mkdirSync(path.dirname(localStorageFilePath), { recursive: true });

const nextBin = path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
const nodeArgs = ['--localstorage-file', localStorageFilePath, nextBin, ...args];
const child = spawn(process.execPath, nodeArgs, {
	stdio: 'inherit',
	shell: false,
	env,
});

child.on('exit', (code) => process.exit(code));
