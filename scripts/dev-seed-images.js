#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const samplePath = path.resolve(repoRoot, 'src', 'lib', 'placeholder-images.sample.json');
const outPath = path.resolve(repoRoot, 'src', 'lib', 'placeholder-images.json');

function copySample() {
  if (!fs.existsSync(samplePath)) {
    console.error('Sample file not found:', samplePath);
    process.exit(1);
  }
  fs.copyFileSync(samplePath, outPath);
  console.log('Copied sample to', outPath);
}

function writeEmpty() {
  const empty = { placeholderImages: [] };
  fs.writeFileSync(outPath, JSON.stringify(empty, null, 2), 'utf8');
  console.log('Wrote empty placeholder dataset to', outPath);
}

// If sample exists, copy it; otherwise write an empty dataset.
if (fs.existsSync(samplePath)) copySample(); else writeEmpty();
