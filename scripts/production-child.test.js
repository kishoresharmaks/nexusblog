const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');
const { monitorChildProcess } = require('./production-child');

test('unexpected child exit fails the service, including exit code 0', () => {
  const child = new EventEmitter();
  const failures = [];
  monitorChildProcess(child, 'API', (...args) => failures.push(args), () => false);

  child.emit('close', 0, null);
  child.emit('error', new Error('later error event'));

  assert.equal(failures.length, 1);
  assert.equal(failures[0][0], 'API');
  assert.match(failures[0][1].message, /code=0/);
});

test('intentional shutdown does not treat child exit as a service failure', () => {
  const child = new EventEmitter();
  let stopping = true;
  let failures = 0;
  monitorChildProcess(child, 'WEB', () => failures++, () => stopping);

  child.emit('close', 0, null);
  stopping = false;

  assert.equal(failures, 0);
});
