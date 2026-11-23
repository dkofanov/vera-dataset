# VERA datasets

Draft multi-collection release. Licensing for newly authored material remains pending; upstream notices are preserved per collection. No blanket license grant is made.

| Collection | Records | Train examples | Validation | Test |
| --- | ---: | ---: | ---: | ---: |
| [vera-sections-v1](collections/vera-sections-v1/) | 88 | 161 | 40 | 19 |
| [vera-stdlib-v1](collections/vera-stdlib-v1/) | 20 | 36 | 3 | 21 |
| [vera-stdlib-v2](collections/vera-stdlib-v2/) | 110 | 92 | 8 | 10 |
| [vera-stdlib-illustrative-v1](collections/vera-stdlib-illustrative-v1/) | 111 | 111 | 0 | 0 |

**Total: 329 active records, 501 examples, 21,275 passing source-collection behavioral cases.** Counts include variants and repeated parent cases, not independent tasks. Original collection splits are unchanged. The earlier root-level stdlib-v1 files now live in `collections/vera-stdlib-v1/`.

## Scope and exclusions

Membership comes only from each collection's active `records.json`. Quarantine, rejected candidates, stale/unreferenced artifacts, archives and raw teacher logs are excluded. Some teacher responses mixed accepted and rejected candidates, so accepted-record teacher metadata retains hashes rather than including those logs. Historical aggregate reports are omitted because they can include excluded candidates. Programs, tests and training targets are preserved; public metadata changes are inventoried in `release-manifest.json`. Original local datasets are untouched.

## Training and evaluation

The first three collections export chat `messages` in `training.jsonl`, `validation.jsonl` and `test.jsonl`. Use only messages, not test-bearing metadata. V1 function-body targets are not complete functions.

The illustrative collection exports `training-prefill.jsonl`: mask prompt and `assistantPrefix` tokens, supervise only `completion`, and append EOS. It is training-only augmentation of 38 existing parent tasks, not 111 new independent tasks. Parent/group/permutation links are retained.

**Do not concatenate these splits into a joint benchmark.** There are known source-symbol overlaps crossing collection train/holdout boundaries (including angle conversion, first-character casing and perfect-square tasks). `catalogue.json` records the known links. Joint use needs provenance/family/parent-aware deduplication and a separate evaluation policy; no such joint split is claimed here.

## Verification and limits

All four source collection checkers passed before collection. Packaging validates active membership, source/test hashes, exports and split assignments. Finite tests are not equivalence proofs; authored references are not independent external implementations. No new model training, device rendering, network or SDK verification is claimed. Runtime, generator and compiler are external, not bundled. Run `node validate.js` for offline release-integrity checks; it does not execute VERA.

See collection READMEs for domain restrictions, origins and training contracts. Upstream-derived and VERA-native authored material must not be conflated. Public holdout answers and expected results are included. See `catalogue.json` for exact counts and `release-manifest.json` for SHA-256 checksums.
