import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';

const root=new URL('..',import.meta.url).pathname;
const filename='googlec5a82ac63469f274.html';
const expected='google-site-verification: googlec5a82ac63469f274.html';

test('Google Search Console verification file is exact and published',()=>{
  const source=join(root,filename);
  assert.equal(existsSync(source),true,`missing ${filename}`);
  assert.equal(readFileSync(source,'utf8'),expected);
  const build=spawnSync(process.execPath,['build.cjs'],{cwd:root,encoding:'utf8'});
  assert.equal(build.status,0,build.stderr||build.stdout);
  const published=join(root,'public',filename);
  assert.equal(existsSync(published),true,`build did not publish ${filename}`);
  assert.equal(readFileSync(published,'utf8'),expected);
});
