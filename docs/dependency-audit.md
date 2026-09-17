# Dependency audit (2026-09-17)

Environment: Node 22.20.0, npm 10.9.3. Results use the committed lockfile and `npm ci`.

| Scope | Before (low / moderate / high / critical) | After (low / moderate / high / critical) |
| --- | --- | --- |
| `npm audit --omit=dev` | 69 (15 / 18 / 32 / 4) | 27 (9 / 7 / 11 / 0) |
| `npm audit` | 70 (15 / 19 / 32 / 4) | 27 (9 / 7 / 11 / 0) |

`--omit=dev` follows the manifest's dependency classification. `react-scripts` is declared as a production dependency, so its build, test and development server packages are included in that result. The counts do not mean that every reported package runs in the browser. The one additional finding in the original full audit came from a development-only dependency path; after the lockfile update both commands report the same 27 findings.

## Fixed within existing dependency ranges

`npm audit fix --package-lock-only` updated compatible resolutions without `--force`. Application dependencies stayed on their existing major versions. Notable paths for the four original critical findings:

| Package | Dependency path | Locked version before → after |
| --- | --- | --- |
| `@babel/traverse` | `styled-components` → `@babel/traverse`; also Babel packages under `react-scripts` | 7.22.5 → 7.29.8 |
| `form-data` | `react-scripts` → `jest` → `jest-environment-jsdom` → `jsdom` → `form-data` | 3.0.1 → 3.0.5 |
| `shell-quote` | `react-scripts` → `react-dev-utils` → `shell-quote`; also through `webpack-dev-server` → `launch-editor` | 1.8.1 → 1.10.0 |
| `websocket-driver` | `react-scripts` → `webpack-dev-server` → `sockjs` → `websocket-driver` | 0.7.4 → 0.7.5 |

The separate `axios` path already used `form-data` 4.0.6 and did not cause the critical report. The lockfile refresh also moved `react-router-dom` within version 6 and refreshed many transitive packages. CRA's Jest configuration requires `jest-watch-typeahead` to resolve from the project root; the same 1.1.0 version is now an explicit development dependency after the lockfile refresh placed it under `react-scripts` and tests failed to start. A clean install and tests confirmed this placement.

## Deferred

The remaining 27 audit entries are 9 low, 7 moderate and 11 high, with no critical entries. The two direct reported packages are `react-router-dom` (moderate) and `react-scripts` (high). The audit's available fix for React Router requires version 7.18.4, a major upgrade from 6. CRA 5.0.1's remaining transitive findings include `svgo`/`nth-check`, `postcss`, `serialize-javascript`, `sockjs`, `webpack-dev-server` and Workbox; audit proposes replacing `react-scripts` with 0.0.0 for several paths. Neither is a compatible patch or minor migration for this project. Their resolution needs a separate routing or build-tool migration and regression review.

The reported severity describes package advisories, not measured exploitability in this app. In particular, `react-scripts` is used to build and test the app and to run a local development server. Keep this distinction in mind when reviewing the `--omit=dev` count.
