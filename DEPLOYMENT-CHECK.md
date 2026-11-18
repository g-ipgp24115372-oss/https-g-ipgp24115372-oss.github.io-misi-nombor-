# Deployment inspection — 18 November 2026

## Findings before changes

- Inspected all project files and top-level asset folders. No Git repository or
  existing build/deployment configuration was present.
- Runtime: one HTML entry page, seven JavaScript files and four CSS files.
  Native browser modules, DOM rendering, CSS/Web Animations, Audio, HTML video,
  pointer and keyboard input. No framework, bundler or dependency installation.
- Media: 186 PNGs, 56 MP3s, five MP4s and three GIFs in the runtime folders.
  Additional local JPG/PDF/DOCX/ZIP reference material is outside deployment.
- Paths are relative. Spaces and Chinese folder names are supported and retained.
  No absolute localhost URLs, external services, router/history dependencies,
  service worker, remote fonts, backend or environment variables were found in
  the runtime source. Font stack: Trebuchet MS, sans-serif.
- State uses browser localStorage. No player accounts or server persistence.

## Preparation

Added only deployment/support files: build/check script, Pages workflow,
Git ignore rules, media-safe Git attributes, README and this report.
Original game source and assets were not edited, removed or redesigned.

Build command: `node scripts/build-pages.mjs` (Node.js 24).
Output: `dist/`. No npm install step.
Check-only command: `node scripts/build-pages.mjs --check`.

The packaging step retains all supplied media inside the runtime folders,
including reference/demo artwork, so the original folder layout stays intact.
It excludes the local `Rujukan/`, `tmp/` and project brief from deployment.

## Verification performed

- JavaScript syntax validation passed for all seven runtime modules.
- 258 unique file references checked against exact on-disk filename case,
  including image metadata, CSS backgrounds, module/style imports, audio,
  teaching videos and enumerated number/species/food variants.
- Packaged 262 original runtime files, plus generated `.nojekyll`.
  Size: 290.9 MiB. Largest file: `Homepage/finish/back.gif`, 9.1 MiB.
- Compared every packaged runtime file's SHA-256 against its source: identical.
- Served output at `/dist/`, a non-root URL analogous to a Pages repository URL.
  All output files returned HTTP 200, including Unicode/space paths. A redundant
  source ZIP archive was subsequently excluded from Git and the output; the
  original archive remains untouched in the source folder.
- Opened the packaged game in a browser: map rendered, each of the four tutorials
  played and reported a duration (12.309, 16.938, 25.152 and 16.042 seconds),
  and Mula opened each corresponding mission. No browser console errors were
  observed during these checks. Existing profile/progress was preserved.

## Remaining verification

No GitHub repository was created, uploaded or deployed during preparation.
The GitHub Actions workflow therefore has not run on GitHub yet. No public URL
is claimed to be live. Repository access/settings and the actual public deployment
must be checked after upload using the README instructions.

This pass checked deployment packaging and level entry/video playback; it did
not replay all rounds and every drag/drop interaction. Runtime code is unchanged.
Use the README's online acceptance checklist after the first deployment.
