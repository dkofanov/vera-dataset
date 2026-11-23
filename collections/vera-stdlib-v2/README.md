# VERA stdlib v2 — natural language → standalone VERA

Training inputs contain a natural-language contract and a VERA signature, never
TypeScript or API-substitution instructions. Each answer is a complete executable
source file. One pair is exported per task; no paraphrase inflation or cloud calls.
This directory is separate from `vera-sections-v1` and `vera-stdlib-v1`.

## Current expansion

- **110 tasks:** 13 pinned upstream-derived functions and 97 explicitly authored
  VERA-native tasks (24 coverage seeds + 73 scenarios). Origins must not be conflated.
- **894 curated + 7,040 disjoint seeded cases = 7,934 passing cases.**
- **92 train / 8 validation / 10 test** pairs across 78 curated families
  (65 train / 5 validation / 8 test). Family labels are not a claim of 78
  independently harvested applications.
- All **14 math APIs and 11 string APIs occur in training**. These counts measure
  lexical API use, including helpers, not executed branches or semantic coverage.
- No graphics, time, SDK or general UI coverage is claimed. Those require different
  verification environments. Holdouts are larger than the original pilot but
  remain a small authored/source-reviewed evaluation, not a representative benchmark.
- Every prompt and record includes reviewed input roles, an output role, and a
  mutation policy. **31 persisted argument-swap witnesses** demonstrate that
  designated role-confusion mutants produce different results. Pure-renaming
  augmentations: **zero**.

## Two evidence tracks

### Pinned upstream translations

`tools/vera-dataset/stdlib-v2-candidates.js` selects known real functions, not an
exhaustive crawler. The builder checks the pinned Git revision and file contents,
indexes checker-resolved builtin operations, exact symbols, JSDoc and available
upstream test source, then applies deterministic TS→VERA rules. Curated behavioral
specifications describe actual implementations, not just their names or vague docs.
Expected outputs come from the original bundled upstream functions in a worker.
Original test suites are **indexed, not executed**.

The expansions add numeric palindrome, computational perfect-cube and perfect-square
checks. `Number.isInteger` uses a finite-number compatibility helper, never a
coercing conversion.
Array generics are explicitly specialized to `number[]`; inputs stay immutable and
outputs must be fresh, including independent backing storage. Arrow blocks are
lifted to named declarations. Normalized source and adaptations are recorded.
First-character casing retains an explicit BMP/no-surrogates restriction because
TS UTF-16 slicing is not implemented generally. Negative `take` counts retain the
upstream end-relative behavior. Unsupported candidates remain in the rejection
report rather than being approximated.

### Authored VERA-native tasks

`tools/vera-dataset/stdlib-v2-native.js` and `stdlib-v2-scenarios.js` contain written
contracts, standalone VERA answers and separately executable JavaScript reference
functions. Scenario references have a persisted self-contained support prelude;
its implementations of Unicode trim, decimal parsing and deterministic state are
reviewed against the written semantics. References are authored by the same pipeline,
not external independently developed implementations. Records have
`origin: authored-vera-native`; they **do not claim upstream TypeScript provenance**
or deterministic translation. Evidence includes the reference source/hash and the
reviewed native-runtime path/hash. These are deliberately small native use cases,
not additional harvested functions or independent real-world applications.

They cover trig offsets/headings, roots/powers, pagination/grouping, rounding,
bounds/distance, deterministic xorshift state and bucket selection, Unicode text
windows/counting/casing, literal predicates/replacement/splitting, Unicode trimming
and typed decimal input. Contracts explicitly document VERA semantics:

- String library positions count Unicode code points, not `.length()` UTF-16 units.
- Replacement is all-occurrences/literal, with empty search leaving text unchanged.
- Empty-separator splitting yields Unicode code points.
- Native trim includes U+0085 and excludes U+FEFF.
- Typed decimal parsing removes ECMAScript whitespace even internally, accepts one
  decimal comma when no dot exists, and rejects exponents and invalid suffixes.
- Random functions are deterministic state/bucket operations, not entropy sources.

References execute in workers and never call the candidate VERA implementation.
Curated boundary inputs and 64 separate seeded inputs per task are compared exactly
against the real VERA compiler/VM. Negative-zero expected outputs have an explicit
path list (including signs inside returned arrays) because JSON numbers otherwise
lose their sign. Seeded generation uses the high bits of a deterministic PRNG to
avoid correlated low-bit choices when constructing multiple arguments. Finite tests do not prove
correctness; host math/casing behavior still depends on the runtime implementation.

## Files

- `records.json`, `dataset.jsonl`: active records, provenance, contracts and source.
- `training.jsonl`, `validation.jsonl`, `test.jsonl`: chat-format NL→VERA pairs.
- `programs/`, `tests/`: standalone answers and public verification vectors, not
  included in prompts.
- `evidence/`, `evidence-index.json`: indexed source or explicit authored references.
- `transformations/`: translation manifests or labeled native-authored manifests.
- `stdlib-coverage.json`: current compiler API inventory and use **by split**.
- `scenario-report.json`: API-to-family diversity, role completeness and swap-witness
  counts. Identifiers vary naturally by scenario; renamed clones are not new tasks.
- `build-report.json`: origins, counts, acceptance and rejection reasons.
- `splits.json`: connected family/shared-declaration assignments.
- `licenses/`: licenses for upstream-derived material only; native records do not
  inherit an upstream project's license.

## Splits and overlap

Related implementation families, identical helper declarations and exact
symbol-canonicalized alpha-clones stay together. Canonicalization uses bound symbols,
not regex renaming. It catches whole-program renamings, not every equivalent algorithm.
The original angle-conversion family stays in validation; first-character casing
stays in test. Additional complete scenario families are explicitly held out:
first replacement, match positions, reserve batching and field filtering in validation;
ordered replacement, match decoration, delimiter extraction, exponential scenarios
and random pipelines/sequences in test. Remaining families train. Different native tasks teach the held-out
APIs without copying those held-out implementations. API overlap across splits is
intentional: evaluations should test new tasks, not only unseen API names.

**Separate directories do not mean disjoint provenance.** Exact older-dataset
source-symbol overlaps are recorded for upstream records. The list is not a full
clone detector, and native use cases may resemble older tasks. Do not merge these
datasets across evaluation boundaries without joint family/provenance deduplication.

## Rebuild and verify

```bash
export VERA_TYPESCRIPT_PATH=/path/to/typescript.js
node tools/vera-dataset/build-stdlib-v2.js
node tools/vera-dataset/check-stdlib-v2.js
node tools/vera-dataset/check-stdlib-v2-native.js
node tools/vera-dataset/transform-stdlib-check.js
```

Building needs esbuild at `<external-esbuild>` and pinned
checkouts under `<external-upstream-checkouts>`; `VERA_UPSTREAM_ROOT` overrides the
checkout parent. Checkers need artifacts/runtime, not upstream repositories.
The builder writes only this dataset. Rebuilds are deterministic. Active membership
is authoritative in `records.json`; stale files are not automatically active.
No compiler, runtime, grammar or older dataset changes are required.

## Scenario expansion and limits

The 73 added scenarios vary output roles as well as API combinations: code-point
windows by count versus end index, prefix/suffix insertion/removal, bounded display
text, region-only and ordered replacement, first/last match indices, field selection,
cleaning/filtering/measurement, paths/extensions, fallback parsing and scaling,
rounding/capacity/pagination, geometry, and array filtering/mapping/aggregation.
Related result variants (for example a filtered array and its count) share a family.
Meaningful names such as `token`/`mask` and `placeholder`/`value` replace arbitrary
renaming. Curated tests include index/count differences, exact boundaries, Unicode,
valid values equal to fallback, empty existing fields versus absent fields, and
same-typed argument roles. Swap witnesses are checked both structurally and by
replaying the persisted reference. They are additional checks, not training examples.

This expansion intentionally strengthens authored compositions much more than
upstream harvesting. It does **not** meet the longer-term goal of having most tasks
come from real applications. Nor does passing verification show a training benefit;
that requires training/ablation against a fixed family-isolated evaluation set.
Coverage reports expose the remaining imbalance: some APIs still have few training
families even though every math/string API has a training example.


## Collected release notice

Only active-record artifacts are included here. Historical aggregate build/audit reports, raw teacher logs, quarantine, rejected candidates and stale files are not distributed. See `release-summary.json` and the root catalogue for current counts. Original reproduction commands refer to external tooling and are not standalone commands in this repository. Previously mentioned omitted files are historical construction references, not included dependencies. Newly authored material remains license-pending.
