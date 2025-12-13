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

### Testing library

- Avoid selecting elements by passing `id` values to `getByLabelText`.  
  Tests should rely on user-facing attributes (roles, labels, text) rather than internal implementation details.
- Maintain a clear Given–When–Then structure in unit tests.  
  Do not include multiple `user` interactions in one test case.  
  The `When` step should be a single, concise action whenever possible.
- Avoid using DOM navigation helpers such as `closest`.  
  These approaches rely on implementation details and do not align with Testing Library’s user-centric philosophy.  
  Use `closest` only as a last resort when no user-facing selectors or accessible queries are available.
