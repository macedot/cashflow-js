#!/usr/bin/env node
import { spawn } from 'child_process';
let d = '';
process.stdin.on('data', c => (d += c));
process.stdin.on('end', () => {
  console.error('end, d=' + d.length);
  const f = JSON.parse(d).tool_input?.file_path;
  console.error('file:' + f);
  const p = spawn('./node_modules/.bin/prettier', ['--write', f], { stdio: 'ignore' });
  p.on('close', () => {
    console.error('done');
    process.exit(0);
  });
});
