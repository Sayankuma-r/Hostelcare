# Contributing to HostelCare

Thank you for helping improve HostelCare. Keep changes focused, preserve role boundaries, and verify both the API and the UI for user-facing workflows.

## Local setup

Follow the [README setup instructions](./README.md#running-locally). Copy the example environment files to local `.env` files and never commit real credentials.

Run the relevant checks from the repository root:

```powershell
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
```

For changes that affect both services, run all three commands before opening a pull request.

## Branch workflow

Use `main` for reviewed, stable work and `develop` as the shared integration branch. Create a short-lived branch from `develop` for each task; merge it back through a pull request after review.

Suggested branch names:

- `feature/authentication`
- `feature/student-dashboard`
- `feature/complaint-management`
- `feature/admin-dashboard`
- `feature/staff-dashboard`
- `fix/notification-read-state`
- `docs/api-setup`

The current local checkout may not have a `develop` branch or a GitHub remote yet. Create those in the hosted repository before using this workflow; do not push work to a remote until its owner and URL are confirmed.

## Commits and pull requests

Use concise, descriptive commit subjects. Conventional Commit prefixes are recommended:

- `feat: add complaint feedback`
- `fix: scope notifications to the current user`
- `test: cover complaint ownership checks`
- `docs: explain local environment setup`

Open a pull request from the task branch to `develop`. Link the related issue or JIRA ticket when available. Pull requests should:

1. Explain the behavior or documentation change and why it is needed.
2. List the tests/build commands run and their results.
3. Include screenshots for visual changes, with personal data removed.
4. Update the README or API documentation when setup or behavior changes.
5. Confirm that `.env`, tokens, credentials, private user data, and generated build output are not included.
6. Describe any migration, deployment, or configuration steps reviewers need to know.

For a hosted GitHub repository, protect `main` and require pull requests and passing checks before merging. These settings must be configured by a repository administrator; they are not applied by this local project.

## API and security changes

- Keep authentication and role checks in the backend; frontend route guards are not a substitute.
- Scope student and staff data access to the authenticated user and add regression tests for access boundaries.
- Validate request data at the API boundary and return actionable error responses.
- Update the Postman collection when adding or changing an endpoint.
- Add new environment-variable names to the appropriate `.env.example` file with safe, non-secret values.
