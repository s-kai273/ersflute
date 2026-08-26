---
name: create-github-pull-request
description: Create a reviewed draft GitHub pull request for the erflute repository from the current non-default branch, using only committed changes and generating the body from the repository's live pull request template. Use when the user explicitly asks to preview, open, or create a PR for the branch currently checked out. Do not use for committing working-tree changes, publishing a different branch, modifying an existing PR, or creating issues.
---

# Create GitHub Pull Request

Create one draft pull request from the current branch for `erflute/erflute`. Preview the exact pull request and obtain approval before pushing or creating it.

## Workflow

1. Resolve the repository from the local `origin` remote and require it to identify `erflute/erflute`. If it is missing, ambiguous, or points elsewhere, stop and ask the user to identify the intended repository.
2. Determine the current branch and the remote default branch. Refuse to create a pull request from a detached HEAD or from the default branch. Use the remote default branch as the base; do not assume that it is named `main`.
3. Fetch current remote refs without pruning, rebasing, merging, or modifying tracked files. Inspect:
   - `git status --short --branch`;
   - the commits and diff between the remote base branch and `HEAD`;
   - whether the current branch has a remote counterpart and whether the histories have diverged.
   Stop if there are no committed changes for the pull request. Never stage, commit, stash, discard, or include working-tree changes. If uncommitted changes exist, list them as a warning in the preview.
4. Confirm before previewing that a pull request can be created through either the connected GitHub app or an installed and authenticated `gh` CLI. Stop before pushing if neither path is available.
5. Search GitHub for an open pull request with the same repository and head branch. If one exists, return its number and URL without creating another. If only a closed or merged pull request exists for the branch, show it and require explicit confirmation before preparing a new pull request.
6. Read `.github/pull_request_template.md` from the current commit. Treat its current visible headings, order, and Markdown structure as the only source of truth; do not use a copied or hard-coded template. Remove instructional HTML comments from the proposed body, but preserve the visible section order and checklist structure.
7. Derive a concise English title and body from the complete committed diff and commit history:
   - Summarize the purpose and reason for the pull request in one or two lines where the template requests a summary.
   - List each meaningful completed change with a checked Markdown checkbox where the template provides a change checklist.
   - Infer an issue number from a branch name such as `feat/134_description`, then verify that the issue exists in `erflute/erflute`. Use `Closes #134` only after verification. Ask the user when the number is missing, ambiguous, or invalid; use `None` only after the user confirms that there is no related issue.
   - State in the notes that tests were not run as part of this pull request creation workflow. Never imply that checks passed when they were not run.
   - Include only information supported by the diff, commit history, repository, or user. Do not expose credentials, tokens, private data, or unrelated conversation content.
8. Present an exact preview containing the repository, base branch, head branch, draft status, title, complete Markdown body, push action, uncommitted-change warning, and the fact that validation will not be run. Ask for explicit approval of this complete preview. A prior request to create a pull request is not approval of unseen content. If any proposed field changes, show the revised preview and obtain approval again.
9. After approval, push the checked-out branch with upstream tracking. Use a normal push only; never force-push. If the remote branch has diverged or the push is rejected, stop and report the state without merging, rebasing, or retrying destructively.
10. Create the draft pull request through the connected GitHub app, preserving the approved repository, base, head, title, and body exactly. Use authenticated `gh pr create --draft` with a temporary body file only when the connector is unavailable or cannot represent the request cleanly.
11. Return the pull request number and URL together with the base and head branches. If creation reports an ambiguous failure, search again for a pull request with the same head before retrying; never create a duplicate blindly.

## Content Rules

- Keep the title outcome-oriented and representative of the entire diff.
- Keep the body concise while completing every visible section required by the current template.
- Preserve real Markdown newlines. When using `gh`, pass the approved body through a temporary file rather than escaped inline text.
- Do not run tests, lint, type checking, builds, or formatters in this workflow. Report this accurately in the pull request notes and preview.

## Safety Boundaries

- Do not create a ready-for-review pull request; always create a draft.
- Do not push or create the pull request before approval of the exact preview.
- Do not stage, commit, stash, edit, or discard local files.
- Do not change branches, rewrite history, force-push, merge, or rebase.
- Do not silently use a different repository, base branch, or head branch.
- Do not update, close, label, assign, or comment on existing pull requests or issues.
