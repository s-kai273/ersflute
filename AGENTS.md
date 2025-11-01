# AGENTS.md

## General

- Write all code in English, including tests.
- Fix all ESLint syntax errors and warnings before completing any task.

## Component Directory Structure

Place each component in its own directory.
A typical structure should look like:

```
component_name/
  index.tsx       // Component implementation
  types.ts        // Component-specific type definitions
  // other files (e.g., hooks, styles, tests)
```

## Tests

- Write unit tests in the same directory as the target file, using the filename format {targetFile}.test.(ts|tsx).
