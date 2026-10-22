# rexchao1.github.io (redesign branch)

Rex Chao's personal site, rebuilt from scratch on the `redesign` branch. The live
site deploys from `main`; nothing here goes live until `redesign` is merged.

- The plan, decisions and step state live in `docs/plan.md`. Read it before any work.
- Raw project screenshots live outside the repo in `../shots/<project>/`, each with a `notes.md`.
- Never publish private data: no real patient, grade, customer or restaurant data in any image or copy.
- Git: work on `redesign`. Commit when a step lands. Ask before pushing or merging to `main`; a push to `main` deploys the live site (see "Deploy" in docs/plan.md).


## Checks

- While building: `npm run build`.
- Before reviewing code changes: `npm run check`, which only type-checks and builds.
- UI changes: look at the changed screen in the browser. Docs and copy: review the diff.

## Checks are light

This is the current checks policy, including when older project notes call for a full run per milestone or version.

- While building a version, run the project's compile or type-check command. Write acceptance tests now and run them at the test stage. Do not repeat a builder's successful check.
- Before version review, or when finishing a standalone fix, run the smallest tests that cover the changed behavior. Look at the changed screens when there are UI changes. For docs and copy, review the diff.
- After a failure, fix it and rerun only the failing tests. Broaden the check only if the failure shows a wider problem.
- Full suites run only when the user explicitly asks or an existing release gate requires them. Entering the test stage, autopilot and version review do not request a full suite.
- Reviews, breaker passes and CI are on request or required by an existing release gate. Keep project-specific safety checks. Never weaken a test to make it pass.
- Report what ran, what passed or failed, and what was not checked. Mark milestones built after compilation; mark acceptance checks done only from recorded passing tests.
