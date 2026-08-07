const test = require('node:test');
const assert = require('node:assert/strict');
const { taipeiDateString, taipeiDateSeed } = require('./date');

test('台灣午夜前後使用正確日期', () => {
  assert.equal(taipeiDateString(new Date('2026-08-06T15:59:59Z')), '2026-08-06');
  assert.equal(taipeiDateString(new Date('2026-08-06T16:00:00Z')), '2026-08-07');
});

test('同一天的每日種子固定，跨日會改變', () => {
  assert.equal(taipeiDateSeed(new Date('2026-08-07T01:00:00Z')), taipeiDateSeed(new Date('2026-08-07T12:00:00Z')));
  assert.notEqual(taipeiDateSeed(new Date('2026-08-07T12:00:00Z')), taipeiDateSeed(new Date('2026-08-07T16:00:00Z')));
});
