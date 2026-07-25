#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { verificationResult } from './deploy-state.js';

const DOMAIN = 'storegardensju.se';
const BRANCH = 'gh-pages';
const POLL_INTERVAL_MS = 5_000;
const TIMEOUT_MS = 10 * 60_000;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
  });

  if (result.error) {
    throw new Error(`${command} kunde inte startas: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const detail = options.capture
      ? (result.stderr || result.stdout || '').trim()
      : '';
    throw new Error(`${command} misslyckades${detail ? `: ${detail}` : ''}`);
  }

  return options.capture ? result.stdout.trim() : '';
}

function repositoryName() {
  const remote = run('git', ['config', '--get', 'remote.origin.url'], {
    capture: true,
  });
  const match = remote.match(/github\.com[/:]([^/]+)\/(.+?)(?:\.git)?$/);

  if (!match) {
    throw new Error(`Kunde inte läsa GitHub-repo från origin: ${remote}`);
  }

  return `${match[1]}/${match[2]}`;
}

function remoteCommit() {
  const output = run(
    'git',
    ['ls-remote', '--heads', 'origin', BRANCH],
    { capture: true },
  );
  const commit = output.split(/\s+/)[0];

  if (!/^[0-9a-f]{40}$/.test(commit)) {
    throw new Error(`Kunde inte läsa senaste commit på ${BRANCH}`);
  }

  return commit;
}

function pagesBuilds(repo) {
  const output = run(
    'gh',
    ['api', `repos/${repo}/pages/builds?per_page=20`],
    { capture: true },
  );
  return JSON.parse(output);
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function isLive(commit) {
  const expected = JSON.parse(readFileSync('dist/build.json', 'utf8'));
  const url = `https://${DOMAIN}/build.json?deploy=${commit.slice(0, 12)}&t=${Date.now()}`;
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-cache' },
  });

  if (!response.ok) {
    return false;
  }

  const actual = await response.json();
  return actual.version === expected.version
    && actual.buildNumber === expected.buildNumber;
}

async function verify(repo, commit) {
  const deadline = Date.now() + TIMEOUT_MS;
  let lastStatus = '';
  let liveWaitLogged = false;

  console.log(`⏳ Väntar på GitHub Pages (${commit.slice(0, 7)})...`);

  while (Date.now() < deadline) {
    try {
      if (verificationResult(await isLive(commit), lastStatus) === 'live') {
        console.log(`✅ Deployment live: https://${DOMAIN}/`);
        return;
      }
    } catch {
      // A transient website request failure is retried until the timeout.
    }

    let build;

    try {
      build = pagesBuilds(repo).find(item => item.commit === commit);
    } catch (error) {
      if (lastStatus !== 'api-unavailable') {
        console.log(`   GitHub API tillfälligt otillgängligt: ${error.message}`);
        lastStatus = 'api-unavailable';
      }
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    const status = build?.status || 'queued';
    if (status !== lastStatus) {
      console.log(`   GitHub Pages: ${status}`);
      lastStatus = status;
    }

    if (verificationResult(false, status) === 'failed') {
      const message = build?.error?.message || 'Page build failed';
      throw new Error(`GitHub Pages ${status}: ${message}`);
    }

    if (status === 'built') {
      if (!liveWaitLogged) {
        console.log('   Bygget är klart, väntar på att liveversionen uppdateras...');
        liveWaitLogged = true;
      }
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    `Deploymenten blev inte verifierad inom ${TIMEOUT_MS / 60_000} minuter`,
  );
}

async function main() {
  const repo = repositoryName();

  run('gh', ['auth', 'status'], { capture: true });

  if (!process.argv.includes('--verify-only')) {
    const sourceCommit = run('git', ['rev-parse', '--short', 'HEAD'], {
      capture: true,
    });

    console.log(`🚀 Publicerar ${sourceCommit} till GitHub Pages...`);
    run('gh-pages', [
      '-d',
      'dist',
      '--nojekyll',
      '--cname',
      DOMAIN,
      '--message',
      `Deploy ${sourceCommit}`,
    ]);
  }

  await verify(repo, remoteCommit());
}

main().catch(error => {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
});
