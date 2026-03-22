#!/usr/bin/env node

/**
 * Hello Bitcoin Script
 *
 * Prints a Bitcoin greeting using the HelloBitcoin module.
 *
 * Usage:
 *   node scripts/hello-bitcoin.js [name]
 *
 * Examples:
 *   node scripts/hello-bitcoin.js
 *   node scripts/hello-bitcoin.js "Satoshi"
 *   npm run hello-bitcoin
 *   npm run hello-bitcoin -- "Satoshi"
 */

const HelloBitcoin = require('../src/hello-bitcoin');

const name = process.argv[2] || 'World';
const hello = new HelloBitcoin(name);

console.log(hello.greet());
