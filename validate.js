'use strict'
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const assert = require('node:assert/strict')
const root = __dirname
const sha = value => crypto.createHash('sha256').update(value).digest('hex')
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const lines = file => fs.readFileSync(path.join(root, file), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
const manifest = read('release-manifest.json')
const files = new Set()
function inventory(dir, prefix = '') {
  for (const name of fs.readdirSync(dir)) {
    if (!prefix && name === '.git') continue
    const relative = prefix + name, full = path.join(dir, name), stat = fs.lstatSync(full)
    assert.ok(!stat.isSymbolicLink(), 'Symlink: ' + relative)
    if (stat.isDirectory()) inventory(full, relative + '/')
    else if (relative !== 'release-manifest.json') files.add(relative)
  }
}
inventory(root)
assert.deepEqual([...files].sort(), manifest.files.map(f => f.path).sort())
assert.equal(new Set(manifest.files.map(f => f.path)).size, manifest.files.length)
for (const entry of manifest.files) {
  assert.ok(!path.isAbsolute(entry.path) && !entry.path.split('/').some(x => ['..', 'quarantine', 'teacher'].includes(x)))
  assert.ok(!/rejected|\.tar\.gz$/.test(entry.path))
  const bytes = fs.readFileSync(path.join(root, entry.path))
  assert.equal(bytes.length, entry.bytes, entry.path)
  assert.equal(sha(bytes), entry.sha256, entry.path)
  if (entry.treatment === 'copied') assert.equal(entry.sha256, entry.sourceSha256, entry.path)
}
const catalogue = read('catalogue.json')
let recordsTotal = 0, examplesTotal = 0, casesTotal = 0
const splitTotals = {train: 0, validation: 0, test: 0}
for (const collection of catalogue.collections) {
  const prefix = collection.path + '/', records = read(prefix + 'records.json'), ids = new Set(records.map(r => r.id))
  assert.equal(records.length, ids.size)
  assert.equal(records.length, collection.records)
  const illustrative = collection.name === 'vera-stdlib-illustrative-v1'
  const modern = collection.name === 'vera-stdlib-v2'
  const splits = illustrative ? null : read(prefix + 'splits.json')
  if (splits) assert.deepEqual(Object.keys(splits.units).sort(), [...ids].sort())
  const expectedArtifacts = new Set(), groups = new Map()
  let cases = 0
  for (const record of records) {
    assert.ok(!record.quarantine && record.verification?.passed !== false)
    for (const key of modern ? ['program', 'tests', 'evidence', 'transformation'] : ['program', 'tests']) {
      const rel = record[key]
      assert.ok(typeof rel === 'string' && !path.isAbsolute(rel) && !rel.split('/').includes('..'))
      assert.ok(files.has(prefix + rel), 'Missing artifact ' + rel)
      expectedArtifacts.add(rel)
    }
    const program = fs.readFileSync(path.join(root, prefix, record.program), 'utf8')
    assert.equal(sha(program), record.programSha256 || record.sourceSha256 || sha(program))
    const tests = read(prefix + record.tests), testCases = tests.tests || tests.cases
    assert.ok(testCases.length > 0)
    cases += testCases.length
    const assignment = illustrative ? record : splits.units[record.id]
    assert.ok(['train', 'validation', 'test'].includes(assignment.split))
    if (groups.has(assignment.group)) assert.equal(groups.get(assignment.group), assignment.split)
    groups.set(assignment.group, assignment.split)
    if (illustrative) {
      assert.equal(record.split, 'train'); assert.equal(record.independentTask, false)
      assert.ok(!record.teacher.request && !record.teacher.response)
      const parentPrefix = 'vera-stdlib-v2:'
      assert.ok(record.parent.startsWith(parentPrefix))
      const parent = read('collections/vera-stdlib-v2/records.json').find(r => r.id === record.parent.slice(parentPrefix.length))
      assert.ok(parent && parent.split === 'train')
    }
  }
  for (const file of files) {
    if (!file.startsWith(prefix)) continue
    const relative = file.slice(prefix.length)
    if (/^(programs|tests|evidence|transformations)\//.test(relative)) assert.ok(expectedArtifacts.has(relative), 'Unreferenced artifact: ' + file)
  }
  if (!illustrative) {
    const rows = lines(prefix + 'dataset.jsonl')
    assert.deepEqual(rows.map(r => r.id), records.map(r => r.id))
    if (!modern) for (const row of rows) {
      const record = records.find(r => r.id === row.id)
      assert.equal(row.program, fs.readFileSync(path.join(root, prefix, record.program), 'utf8'))
      assert.equal(sha(row.program), row.programSha256)
      assert.deepEqual(row.tests, read(prefix + record.tests).tests)
      assert.equal(sha(JSON.stringify(row.tests)), row.testsSha256)
      assert.ok(row.verification.passed)
    }
  }
  const exports = illustrative ? [['train', 'training-prefill.jsonl']] : [['train', 'training.jsonl'], ['validation', 'validation.jsonl'], ['test', 'test.jsonl']]
  const covered = new Set(), exampleIds = new Set()
  let exampleCount = 0
  for (const [split, file] of exports) {
    const examples = lines(prefix + file)
    assert.equal(examples.length, collection.examplesBySplit[split])
    splitTotals[split] += examples.length
    exampleCount += examples.length
    for (const example of examples) {
      const record = records.find(r => r.id === example.metadata.unit_id)
      assert.ok(record)
      covered.add(record.id)
      const id = example.metadata.example_id || record.id
      assert.ok(!exampleIds.has(id)); exampleIds.add(id)
      assert.equal(example.metadata.split, split)
      if (splits) assert.equal(splits.units[record.id].split, split)
      if (illustrative) {
        assert.equal(example.assistantPrefix, record.assistantPrefix)
        assert.equal(example.completion, record.completion)
        assert.equal(example.messages[2].content, example.assistantPrefix + example.completion)
      } else {
        const program = fs.readFileSync(path.join(root, prefix, record.program), 'utf8')
        if (example.metadata.section_kind === 'function_body') {
          const row = lines(prefix + 'dataset.jsonl').find(row => row.id === record.id)
          assert.equal(example.messages[2].content, row.body)
        } else assert.equal(example.messages[2].content, program)
      }
    }
  }
  assert.equal(covered.size, ids.size)
  assert.equal(cases, collection.testCases)
  assert.equal(exampleCount, collection.examples)
  if (modern) assert.ok(read(prefix + 'evidence-index.json').every(e => ids.has(e.id) && e.accepted === true))
  recordsTotal += records.length; examplesTotal += exampleCount; casesTotal += cases
}
assert.equal(recordsTotal, catalogue.totals.records)
assert.equal(examplesTotal, catalogue.totals.examples)
assert.equal(casesTotal, catalogue.totals.testCases)
assert.deepEqual(splitTotals, catalogue.totals.examplesBySplit)
console.log(JSON.stringify({result: 'passed', records: recordsTotal, examples: examplesTotal, testCases: casesTotal, splits: splitTotals, files: files.size, runtimeVerification: 'not executed by this integrity validator'}, null, 2))
