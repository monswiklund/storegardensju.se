#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import cmsContent from '../src/data/cmsContent.generated.js';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const buildInfo = {
  version: packageJson.version,
  buildTime: new Date().toISOString(),
  buildNumber: Date.now(),
  // Which published CMS content this build contains (null = built without an export). The CMS
  // dashboard compares cmsContentRevision with its own latest publish to tell editors whether
  // their change is on the site yet.
  cmsContentRevision: cmsContent?.revision ?? null,
  cmsExportedAt: cmsContent?.exportedAt ?? null,
  cmsPageCount: cmsContent ? Object.keys(cmsContent.pages).length : 0,
  cmsEventCount: cmsContent?.events.length ?? 0,
  cmsCoursePassCount: cmsContent?.coursePasses.length ?? 0,
};

writeFileSync('public/build.json', `${JSON.stringify(buildInfo, null, 2)}\n`);
console.log(`✅ Buildinformation genererad för v${buildInfo.version}`);
