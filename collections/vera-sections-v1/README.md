# VERA sections v1 — curated seed dataset

This is a small code-generation and compiler-regression dataset, not a broad
VERA benchmark. Read the current counts in `build-report.json` and `splits.json`;
257 historical training rows were prompt variants, not 257 independent programs.

## Files

- `records.json`: authoritative list of **active** records and source references.
- `dataset.jsonl`: built full-program records, tests and verification results.
- `training.jsonl`: **training split only**, chat-format examples.
- `validation.jsonl`, `test.jsonl`: held-out chat-format examples.
- `splits.json`: deterministic unit-to-family/split assignments.
- `programs/`, `tests/`: source and test evidence. Files for quarantined records
  intentionally remain here; directory file counts are not active record counts.
- `quarantine/records.json`: excluded records, including prior signature failures.
- `quality-repair-report.json`: duplicate exclusions and concrete failing inputs
  discovered by strengthening the old differential suites.
- `build-report.json`: full-program and body-task verification counts.
- Other reports describe upstream project tests, signatures and constructions.
  Upstream project-test reports are historical evidence, not a fresh test run.

## Quality corrections

Body extraction selects the function named by the signature, not the first
function in a file. Body-only prompts contain the behavior, header, imports and
helper declarations. Their reconstructed sources are independently compiled and
executed on the complete record test suite. This fixes the exponential-search,
heap-sort and binomial-coefficient helper-body mix-ups, and preserves the context
needed by multi-function records such as binary search. The percentile signature
uses `p`, matching its implementation and avoiding name shadowing.

Prompts explicitly state the adapted API and required arguments; they no longer
refer to an unspecified upstream library or invisible tests. Record-only classes
are accurately described as record/factory/getter/copy tasks, **not** complete
stack or queue implementations.

Post-translation, function-specific differential inputs vary parameters
independently, include nontrivial outcomes and exercise semantic edge cases:
unequal LCS inputs, non-subsets, out-of-range clamping, fractional rounding,
nonempty ranges, HTML entities, regex metacharacters, accented/non-Latin strings,
astral Unicode and longer hash inputs. References come from clean checkouts at
the commits in each record. No teacher calls are made by the repair/check tools.
Incorrect or non-executable translations are excluded, **not** relabeled as
correct or silently narrowed to ASCII. Failed cases are retained as evidence.

Two duplicate implementations were excluded. Splits use connected components
of curated implementation families and shared top-level declarations, keeping
prompt variants, helper code and composed modules on the same side of the split.
The small, uneven family-level holdouts are only a preliminary evaluation set.
Do not randomly split the exported rows again.

## Regeneration and checks

Set `VERA_TYPESCRIPT_PATH` to a compatible TypeScript installation, then run from
the repository root:

```bash
node tools/vera-dataset/build.js
node tools/vera-dataset/export-training.js
node tools/vera-dataset/check.js
node tools/vera-dataset/audit-signatures.js
node tools/vera-dataset/analyze-constructions.js
node tools/vera-dataset/summarize.js
```

`build.js` refuses duplicate programs, stale quality reviews, empty or obviously
vacuous generated test suites, known underspecified prompt templates, and any
failed full-program or reconstructed-body test. `check.js` reruns execution and
checks hashes, labels, split isolation, deterministic assignment and simple
incorrect-implementation mutants.

The repeatable v1 migration is `tools/vera-dataset/repair.js`. In addition to
TypeScript it needs esbuild (`VERA_ESBUILD`) and clean pinned upstream checkouts
under `VERA_UPSTREAM_ROOT` (default `<external-upstream-checkouts>`, directories
`TheAlgorithms-TypeScript` and `es-toolkit`). It updates active records, tests
and quarantine evidence; run build/export/check afterward. It does not
reintroduce quarantined translations automatically. To repair an excluded
implementation, retain its strengthened tests, fix the program and specification,
rerun upstream comparison, and explicitly review it before reinstating it.

## Limits

Passing finite test vectors is not a proof. Older manually authored functions
have lighter coverage than the curated differential functions. There is no
claim of exhaustive Unicode, numeric-boundary or algorithmic coverage. The
signature audit still reports unreviewed generic/untyped upstream contracts.
Class records are mostly boilerplate, and only three composed modules remain.
The dataset is useful as a seed and regression suite; expand it only after
adding domain-specific tests and self-contained specifications.

License and provenance obligations remain those of the individual upstream
sources; see each record and `licenses/`.


## Collected release notice

Only active-record artifacts are included here. Historical aggregate build/audit reports, raw teacher logs, quarantine, rejected candidates and stale files are not distributed. See `release-summary.json` and the root catalogue for current counts. Original reproduction commands refer to external tooling and are not standalone commands in this repository. Previously mentioned omitted files are historical construction references, not included dependencies. Newly authored material remains license-pending.
