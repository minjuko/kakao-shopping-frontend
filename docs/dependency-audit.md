# Dependency audit (2026-10-18)

Environment: Node 22.20.0, npm 10.9.3. Results use the committed lockfile and `npm ci`.

| Scope | Before (low / moderate / high / critical) | After (low / moderate / high / critical) |
| --- | --- | --- |
| `npm audit --omit=dev` | 106 (3 / 37 / 64 / 2) | 0 |
| `npm audit` | 107 (3 / 37 / 65 / 2) | 100 (3 / 35 / 62 / 0) |

`--omit=dev` follows the manifest's dependency classification. The 2026-10-18 compatible lockfile update removed all findings from the production dependency graph. The remaining findings are in development and build tooling and do not mean that every reported package runs in the browser.

## Fixed within existing dependency ranges

`npm audit fix` updated compatible resolutions without `--force`. Application dependencies stayed on their existing major versions. The update removed the two current critical findings and all production-scope findings. Historical examples of updated paths include:

| Package | Dependency path | Locked version before → after |
| --- | --- | --- |
| `@babel/traverse` | `styled-components` → `@babel/traverse`; also Babel packages under `react-scripts` | 7.22.5 → 7.29.8 |
| `form-data` | `react-scripts` → `jest` → `jest-environment-jsdom` → `jsdom` → `form-data` | 3.0.1 → 3.0.5 |
| `shell-quote` | `react-scripts` → `react-dev-utils` → `shell-quote`; also through `webpack-dev-server` → `launch-editor` | 1.8.1 → 1.10.0 |
| `websocket-driver` | `react-scripts` → `webpack-dev-server` → `sockjs` → `websocket-driver` | 0.7.4 → 0.7.5 |

The separate `axios` path already used `form-data` 4.0.6 and did not cause the critical report. The lockfile refresh also moved `react-router-dom` within version 6 and refreshed many transitive packages. CRA's Jest configuration requires `jest-watch-typeahead` to resolve from the project root; the same 1.1.0 version is now an explicit development dependency after the lockfile refresh placed it under `react-scripts` and tests failed to start. A clean install and tests confirmed this placement.

## Deferred

The remaining 100 full-audit entries are 3 low, 35 moderate and 62 high, with no critical entries. They are confined to development and build tooling. The audit's available fixes require breaking changes such as React Router 7, Tailwind CSS 4, `jest-watch-typeahead` 3, or an invalid `react-scripts` 0.0.0 replacement. These are not compatible patch updates for this preserved educational project and require a separate routing or build-tool migration with regression review.

The reported severity describes package advisories, not measured exploitability in this app. In particular, `react-scripts` is used to build and test the app and to run a local development server. Keep this distinction in mind when reviewing the `--omit=dev` count.
