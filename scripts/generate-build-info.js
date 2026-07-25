#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const buildInfo = {
  version: packageJson.version,
  buildTime: new Date().toISOString(),
  buildNumber: Date.now(),
};

writeFileSync('public/build.json', `${JSON.stringify(buildInfo, null, 2)}\n`);
console.log(`✅ Buildinformation genererad för v${buildInfo.version}`);
