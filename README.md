# VERA stdlib dataset v1

**Draft release — licensing for newly authored material is pending.** Upstream MIT notices are preserved in `licenses/`; they do not constitute a blanket license for all dataset material. No additional license grant is made by this draft.

A small, verified code-generation seed dataset translating genuine TypeScript functions and their standard-library uses into VERA. It contains 20 functions and 60 English-prompt/chat examples, not 60 independent programs.

## Contents and splits

| Split | Functions | Examples |
| --- | ---: | ---: |
| Train | 12 | 36 |
| Validation | 1 | 3 |
| Test | 7 | 21 |

Each function has two complete-source examples and one function-body example. Existing connected-family split assignments are locked and preserved from the original combined corpus. Keep variants and shared helpers together; do not randomly resplit examples. Related functions in the older sections dataset share these assignments, so combining corpora requires retaining the original family boundaries.

- `training.jsonl`, `validation.jsonl`, `test.jsonl`: chat-format split exports; train on `messages` only.
- `records.json`: authoritative metadata, provenance, native test cases and API/signature evidence.
- `dataset.jsonl`: complete programs, body context, encoded tests and historical verification results. Its inherited schema name is `vera-sections-v1`.
- `programs/`, `tests/`: 20 VERA sources and 20 executable fixture files.
- `splits.json`: immutable unit/group/split assignments.
- `licenses/`: upstream MIT copyright and permission notices.
- `build-report.json`, `signature-audit.json`, `construction-report.json`, `stdlib-coverage.json`: historical verification and analysis.
- `isolation-summary.json`: public summary of the dataset separation, without private machine paths or backup logs.
- `release-manifest.json`: SHA-256 and size inventory; identifies byte-preserved, sanitized and generated files.

## Sources and attribution

| Project | Functions | Pinned commit | Notice |
| --- | ---: | --- | --- |
| [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) | 12 | `030ebb558a5820b444a8f836ed5cdd46c9b4bd7a` | `licenses/llama.cpp-LICENSE` |
| [TheAlgorithms/TypeScript](https://github.com/TheAlgorithms/TypeScript) | 6 | `19b4ced86c99815f142d4a46a028f55487b8038a` | `licenses/TheAlgorithms-TypeScript-LICENSE` |
| [toss/es-toolkit](https://github.com/toss/es-toolkit) | 2 | `24e7a7b8cb8035fae1ea2e7b507aab96698a38b9` | `licenses/es-toolkit-LICENSE` |

Every record preserves upstream repository, source path, commit, source hash/span, actual TypeScript declaration/checker evidence, and conditional API mappings. Provenance `licensePath` is relative to the upstream project, not this repository. Function lists and domains are in `records.json`.

## Construction and verification

Actual TypeScript contracts were inspected with the AST/checker rather than inferred from successful probes. Upstream dependency closures were executed as behavioral oracles. Final translations comprise 10 cloud-assisted (`cloud-deepseek-flash`) and 10 source-reviewed (`source-reviewed-stdlib-translation`) records. The method label alone does not establish an exact cloud model version.

All 20 whole programs and 20 reconstructed body tasks passed host VERA compiler/VM checks over 1,219 cases: 278 curated/repair-visible and 941 disjoint seeded independent cases. Independent cases were not supplied to the teacher during construction, but are included publicly here. Original upstream test suites were **not** executed. Historical translation backup references are not bundled evidence.

The historical lexical inventory found 17 of 121 namespace-callable APIs present. Lexical presence is not runtime call coverage, and this is not comprehensive stdlib coverage. There is no claim of device, UI rendering, SDK, network or exhaustive semantic verification.

## Usage

Read a split using the Python standard library:

```python
import json

with open("training.jsonl", encoding="utf-8") as source:
    examples = [json.loads(line) for line in source if line.strip()]
training_messages = [example["messages"] for example in examples]
```

Only `messages` are training inputs. `metadata` contains expected results, source declarations and verification information; do not concatenate it into prompts. Body examples request statements without enclosing braces; a signature-prefill inference pipeline must adapt this format explicitly, not treat the body target as a complete function or JSON response.

Executable test values use tagged arrays: `["n", number]`, `["s", string]`, `["b", boolean]`, and `["a", encoded_elements]`. Record-level curated/independent cases instead contain native JSON values.

The VERA compiler/runtime and verifier are not bundled. The construction checkout is configured against [deal-studio-ohos](https://github.com/egavrin/deal-studio-ohos), but this draft does not promise that its public HEAD contains the exact verification tooling. Report hashes identify historical source snapshots, not files necessarily present here. `stdlib-coverage.json` references external compiler/catalogue inputs for that historical analysis.

## Limitations and release status

Finite cases are not a proof of equivalence. Text functions generally restrict inputs to BMP without surrogate code points and shared space/tab/CR/LF whitespace; the glob function has a separate Unicode-scalar domain. Numeric functions have explicit bounds; `range` uses an explicit three-argument overload and `dedentImpl` is the internal helper, not the full public API. See each record's domain before use.

This tiny, uneven corpus is useful for experimentation and regression checks, not a generalization benchmark. The published validation/test answers are public. Upstream licenses and attribution must be retained. Licensing for newly authored prompts, translations, fixtures and metadata must be decided before treating this draft as an openly licensed dataset.
