'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = fs.realpathSync(process.cwd());
const NODE_ENV = process.env.NODE_ENV || 'development';

const resolveApp = relativePath => path.resolve(ROOT, relativePath);
const endWithSlash = path => path.endsWith('/') ? path : `${path}/`;
const endWithoutSlash = path => !path.endsWith('/') ? path : path.substr(path, path.length - 1);

module.exports = {
  resolveApp,
  endWithSlash,
  endWithoutSlash,
  isProd: NODE_ENV === 'production',
  isDev: NODE_ENV === 'development',
  isInt: NODE_ENV === 'integration',
};
