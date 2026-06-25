# Agent Rules

## Auto-Commit Rule
If you have made any file changes or modifications during your turn, you MUST run `git add .` and `git commit -m '<brief description of changes>'` using the `run_command` tool before concluding your output. Always execute the commit command so the changes are saved to the repository history.

## Continuous Documentation Rule
If you add a new endpoint, environment variable, or major feature, you must automatically update the README.md or CHANGELOG.md to reflect these changes.

## Mandatory Error Handling Standard
Whenever you write a network request, database query, or file operation, you must wrap it in a `try/catch` block and log the error using the project's standard logger (rather than silently ignoring it or just printing to the console).
