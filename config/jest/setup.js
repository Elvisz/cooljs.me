'use strict';

const raf = require('raf');

if (process.env.NODE_ENV === 'test') {
  raf.polyfill(global);
}
