# Repository guidance

## Project overview

This service generates LaTeX CV documents from JSON. It uses TypeScript, Fastify,
Zod for request validation, and Nunjucks for rendering. It currently returns
LaTeX source; it does not expose a PDF-generation endpoint.

## Repository map

- `src/server.ts`: CV schema, inline LaTeX template, escaping filter, HTTP routes,
  and server startup.
- `test/request.json`: sample CV request.
- `test/generate-latex.bat`: Windows smoke test against a running local server.
- `test/generated-resume.tex`: tracked sample output overwritten by the smoke test.
- `Dockerfile`: Node image with TeX Live and latexmk; builds and runs the service.
- `compose.yaml`: development container with source syncing and dependency rebuilds.
- `README.md`: API documentation, currently written in Ukrainian.

## Development commands

Run commands from the repository root.

- `npm ci`: install dependencies from `package-lock.json`.
- `npm run dev`: start the server with `tsx` watch mode.
- `npm run build`: compile TypeScript into `dist/`.
- `npm start`: run the compiled `dist/server.js`; build first.
- `docker compose up --build --watch`: run the container development workflow.
- `cmd /c test\generate-latex.bat`: run the Windows smoke test after starting
  the server on port 3000.

The server binds to `0.0.0.0` and reads `PORT`, defaulting to `3000`. The smoke
test and Compose port mapping use port 3000.

## API behavior to preserve

- `GET /health` returns `{ "status": "ok" }`.
- `POST /generate-latex` accepts a JSON CV and returns
  `application/x-tex; charset=utf-8` with
  `Content-Disposition: attachment; filename="cv.tex"`.
- `name` must be a nonempty string. Top-level contact and summary fields are
  optional; skills, experience, and education default to empty arrays.
- Experience entries require `company` and `role`; education entries require
  `institution` and `degree`. Experience achievements default to an empty array.
- Invalid CV data returns HTTP 400 with `error: "Invalid CV payload"` and
  flattened Zod validation details.

Keep the schema, template, examples, and documentation consistent when changing
the payload contract.

## Implementation conventions

- Follow the existing two-space indentation, single quotes, and semicolons.
- Use ESM imports and preserve the strict NodeNext TypeScript configuration.
- Infer CV types from the Zod schema instead of maintaining duplicate interfaces.
- Keep request bodies untrusted until validated with Zod.
- Render user-controlled text through the custom `latex` filter. Nunjucks HTML
  autoescaping is deliberately disabled because HTML entities are inappropriate
  for LaTeX.
- When modifying escaping, check backslashes, braces, `#`, `$`, `%`, `&`, `_`,
  `^`, and `~`, including whether replacement order escapes generated commands.
- Preserve UTF-8 text and the existing language of documentation being edited.
- Update `package-lock.json` alongside dependency changes.

## Validation and change hygiene

- For TypeScript changes, run `npm run build`.
- `npm test` is a placeholder that always exits with an error; there is no
  configured automated test suite or lint command.
- For route or rendering changes, run the service and check health, a valid
  request, invalid input, and any affected optional sections or special characters.
  Inspect response status, headers, and generated LaTeX as appropriate.
- The batch smoke test only checks HTTP success and writes the response. It does
  not compile LaTeX or assert document contents.
- For template changes affecting compilation, compile representative output with
  an available TeX toolchain, or state that compilation was not verified.
- Review `git diff` and `git status` before finishing. Do not include generated
  `dist/` files or incidental smoke-test output changes. `dist/` is not currently
  ignored, and the sample `.tex` output is tracked.
- Report which checks ran and any relevant limitations. Keep changes focused on
  the requested task.
