const test = require('node:test');
const assert = require('node:assert/strict');
const { databaseNameFromUri } = require('../src/config/database');

test('reads an explicitly configured MongoDB database name without exposing the URI', () => {
  assert.equal(databaseNameFromUri('mongodb+srv://user:password@cluster.example.mongodb.net/attendx?retryWrites=true'), 'attendx');
});

test('identifies a MongoDB URI that relies on the default database', () => {
  assert.equal(databaseNameFromUri('mongodb://localhost:27017'), null);
  assert.equal(databaseNameFromUri('mongodb://localhost:27017/?retryWrites=true'), null);
});
