import Debug from 'debug';
import path from 'path';
import process from 'process';
import getCallerFile from 'get-caller-file';

import pkg from '../../package.json';

/**
 * Debug msgs with label.
 * @param {string} label debug sub label
 * @param {any[]} msgs debug messages
 */
function debug(...msgs) {
  const callFilePath = getCallerFile();

  const prefix = pkg.name;
  const labelx = path.relative(process.cwd(), callFilePath);

  return new Debug(`${prefix}:${labelx}`)(...msgs);
}

export default debug;
