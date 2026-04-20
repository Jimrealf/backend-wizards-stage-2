# Intelligence Query Engine

HNG 14 Backend Wizards Stage 2. An upgrade to Stage 1's profile API: advanced filtering, sorting, pagination, and a rule-based natural language search endpoint.

## Live

- API base: `https://backend-wizards-stage-2-dcy2.vercel.app`
- Health: `GET /` returns `{"status":"ok"}`

## Local setup

```bash
npm install
cp .env.example .env   # set DATABASE_URL
npm run seed           # idempotent; loads 2026 profiles
npm run dev
npm test
```

## Endpoints

### `POST /api/profiles`
Create a profile from a name. Calls Genderize, Agify, and Nationalize in parallel, picks the top-probability country, and persists. Duplicate name returns the existing row with `200`.

### `GET /api/profiles/:id`
Returns the profile or `404`.

### `DELETE /api/profiles/:id`
Removes the profile. Returns `204`, or `404` if missing.

### `GET /api/profiles`
List with filtering, sorting, and pagination. All params are optional and combinable.

Filters: `gender`, `age_group`, `country_id`, `min_age`, `max_age`, `min_gender_probability`, `min_country_probability`.

Sorting: `sort_by` (`age` | `created_at` | `gender_probability`), `order` (`asc` | `desc`). Default: `created_at desc`. A stable secondary sort on `id ASC` prevents pagination drift on ties.

Pagination: `page` (default `1`), `limit` (default `10`, clamped to `50`).

Response:
```json
{ "status": "success", "page": 1, "limit": 10, "total": 2026, "data": [ ... ] }
```

### `GET /api/profiles/search?q=...`
Natural language search. Parses `q` with rules, then runs the same pipeline as `GET /api/profiles` so pagination and sorting params apply.

- `q` missing or empty -> `400 Invalid query parameters`
- `q` parses to no filters -> `422 Unable to interpret query`

## Natural language parsing

Rule-based only. No LLMs. Implementation in `src/search/parser.ts`.

### Pipeline

1. **Normalize.** Lowercase, replace non-alphanumeric with spaces, collapse whitespace.
2. **Tokenize** into a `Set<string>` for keyword lookups.
3. **Extract filters** independently. Each extractor may contribute a filter; order doesn't matter.
4. **Return** the accumulated filter object (may be `{}`, which the route turns into `422`).

### Keyword sets

| Filter | Matches any of |
|---|---|
| `gender = male` | `male`, `males`, `man`, `men`, `boy`, `boys` |
| `gender = female` | `female`, `females`, `woman`, `women`, `girl`, `girls`, `lady`, `ladies` |
| `age_group = child` | `child`, `children`, `kid`, `kids` |
| `age_group = teenager` | `teen`, `teens`, `teenager`, `teenagers` |
| `age_group = adult` | `adult`, `adults` |
| `age_group = senior` | `senior`, `seniors`, `elderly`, `pensioner`, `pensioners` |
| `young` (not a stored group) | sets `min_age = 16`, `max_age = 24` |

### Numeric bounds

Three patterns extract age bounds. They combine by intersection, so `young people above 20` yields `min_age=20, max_age=24`.

| Pattern | Effect |
|---|---|
| `between N and M` | `min_age = max(min_age, min(N,M))`, `max_age = min(max_age, max(N,M))` |
| `above N`, `over N`, `older than N`, `greater than N` | raises `min_age` |
| `below N`, `under N`, `younger than N`, `less than N` | lowers `max_age` |

### Country detection

Regex: `\b(?:from|in)\s+([a-z][a-z\s]*?)(?=\s+(?:above|over|older|greater|below|under|younger|less|between)\b|\s*$)`.

The captured phrase is looked up in `src/search/countries.ts`, which maps ~90 country names and common aliases (`nigeria`, `united states`, `usa`, `uk`, `south africa`, etc.) to ISO-2 codes. If the name doesn't match, the country filter is dropped but other filters still apply.

The lookahead anchors the country phrase against the age-bound keywords so `men in nigeria above 30` captures `nigeria` cleanly, not `nigeria above 30`.

### Gender conflict resolution

If both male-family and female-family terms appear in one query, gender is **not** applied. This matches the spec example `"male and female teenagers above 17"` -> `age_group=teenager` + `min_age=17` (no gender).

### Example mappings

| Query | Filters |
|---|---|
| `young males` | `gender=male`, `min_age=16`, `max_age=24` |
| `females above 30` | `gender=female`, `min_age=30` |
| `people from angola` | `country_id=AO` |
| `adult males from kenya` | `gender=male`, `age_group=adult`, `country_id=KE` |
| `male and female teenagers above 17` | `age_group=teenager`, `min_age=17` |
| `seniors from nigeria above 80` | `age_group=senior`, `country_id=NG`, `min_age=80` |
| `men between 30 and 40` | `gender=male`, `min_age=30`, `max_age=40` |

## Limitations

The parser is deliberately narrow. Things it **does not** handle:

- **Negation.** `not from nigeria`, `non-nigerian`, `excluding women` are parsed as if the negation weren't there. `not male` still sets `gender=male`.
- **Disjunction across filters.** `adults OR seniors`, `male or female under 30`. Keyword hits are union-within-family and otherwise additive; there's no way to express "A or B" across different filter types.
- **Multiple countries.** `from nigeria or kenya` captures only the first match. `from nigeria and ghana` likewise.
- **Ordinal/relative ages.** `in their 30s`, `thirty-something`, `above thirty` (spelled-out numbers). Only digit-form bounds work.
- **Comparators other than age.** `high confidence`, `very likely male`. The parser never touches `min_gender_probability` or `min_country_probability` — those must be passed as explicit query params on `GET /api/profiles`.
- **Sort/pagination in natural language.** `top 5 nigerians by age` — only filters come from `q`; `sort_by`, `order`, `page`, `limit` must be passed as separate params.
- **Nicknames and demonyms inconsistently.** `americans`, `brits`, `kenyans` don't resolve. Only "from/in X" with a canonical country name or listed alias works.
- **Punctuation-sensitive phrases.** `men, women, and children from nigeria` normalizes punctuation to spaces, so the gender-conflict rule drops gender. This is a feature, not a bug: ambiguous gender -> no gender filter.
- **Typos and plural/singular outside the listed sets.** `ladys`, `childs`, `teeneger` — no fuzzy matching.
- **Context-dependent terms.** `young at heart`, `old school`. `old` as a standalone word is not a keyword (only `older than`, `above`, `senior`, etc.).
- **Age ranges in the country clause.** `nigerians above 30` works via the `above N` pattern but `nigerians aged 30 to 40` does not (`aged` isn't a keyword and the country extractor expects `from|in`).
- **Case/accents in country names.** `côte d'ivoire` is stored that way but the normalizer strips the apostrophe. The lookup table accounts for common forms; obscure forms may miss.

For anything outside these rules, callers should use `GET /api/profiles` with explicit filter params.

## Implementation notes

- TypeScript + Express 5, deployed as a single Vercel Serverless Function (`api/index.ts`).
- PostgreSQL via `postgres.js` against Neon (pgbouncer pooler; `prepare: false`).
- Filter values are normalized to match indexed columns (`gender` lowercased, `country_id` uppercased) so queries use B-tree indexes instead of `LOWER(col)` scans.
- `count()` and the paginated data query run in parallel via `Promise.all`.
- Seeding is idempotent: `UNIQUE(name)` + `ON CONFLICT DO NOTHING`.
- Errors follow `{ "status": "error", "message": "..." }` with appropriate HTTP codes (`400` for missing/empty/malformed body, `422` for invalid parameter types, `404` for missing resources, `502` for upstream failures).
