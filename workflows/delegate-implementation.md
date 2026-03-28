# Workflow: Delegate Implementation

Use only when the user explicitly asks for delegation or parallel work.

1. Split the implementation into disjoint write scopes.
2. Assign each slice to a `worker` agent with clear ownership.
3. Include verification requirements in the worker brief.
4. Avoid waiting unless the main thread is blocked.
5. Review, integrate, and verify each returned slice before closing the task.
