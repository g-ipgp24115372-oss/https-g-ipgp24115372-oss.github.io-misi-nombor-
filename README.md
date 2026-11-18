# Misi Nombor: Pengembaraan di Hutan

A Malay-language early numeracy game with four missions, supplied illustrations,
audio feedback, teaching videos, and browser-saved progress.

## Technology and project structure

This is a buildless static website: HTML, CSS and native JavaScript ES modules.
There is no React, Vite, npm dependency installation, backend, database, API key,
external CDN, environment variable, or custom web font. The font uses the device's
Trebuchet MS with a sans-serif fallback. A static HTTPS host is sufficient.

| Location | Purpose |
| --- | --- |
| `index.html`, `app.js`, `style.css` | Entry page, login/profile/map/progress/achievement |
| `assets.js` | Image dimensions and crop metadata |
| `level1.js` | Mana nombor? |
| `level2.js`, `level2.css` | Jom kira haiwan! |
| `level3.js`, `level3.css` | Berapa buah-buahan? |
| `final.js`, `final.css` | Jamuan rimba! |
| `teaching-video.js` | Shared native video player |
| `Homepage/`, `character/`, `l1/`, `l2/`, `l3/`, `final/`, `tick.png` | Original image/audio assets, including supplied reference art |
| `Teaching Video/` | Four MP4 tutorials |
| `scripts/build-pages.mjs` | Checks paths/casing/JS syntax and copies runtime files |
| `.github/workflows/deploy-pages.yml` | GitHub Pages build/deployment |
| `Rujukan/`, `tmp/`, project brief | Local reference material, excluded from Git and deployment |

## Build and preview

Install Node.js 24 LTS for the packaging command. No `npm install` is needed.

```powershell
node scripts/build-pages.mjs --check
node scripts/build-pages.mjs
```

The deployment output folder is **`dist/`**. This is a packaging step, not a
framework compilation. It does not edit the game source. Use a fresh output
folder for each build: if `dist/` already exists, move it aside first. GitHub
Actions builds from a fresh checkout automatically.

For local preview, serve the project or `dist/` with a static web server, e.g.
`python -m http.server 8766 --bind 127.0.0.1 --directory dist` if Python is installed.
Open `http://127.0.0.1:8766/`. Do not double-click `index.html`: browsers restrict
JavaScript modules on `file://` URLs.

## Publish to a public GitHub repository

1. Sign in to GitHub and create a **public**, empty repository named
   `misi-nombor`. Do not initialise it with a README or licence.
2. Recommended on Windows: install/open **GitHub Desktop**, choose
   **File → Add local repository**, select this project folder, and use its
   **create a repository here** option if asked. Keep this project folder as the
   repository root; `index.html` and `.github/` must be directly inside it.
3. Review the changes, commit them with a message such as `Prepare game for GitHub Pages`,
   then use **Repository → Repository settings → Remote** to set the primary
   remote to `https://github.com/YOUR-USERNAME/misi-nombor.git` and push. If you
   prefer Desktop's **Publish repository** button instead, skip creating the
   repository on GitHub in step 1, name it `misi-nombor`, and uncheck **Keep this code private**.
4. Ensure the uploaded default branch is named **main**. The included workflow
   listens to pushes on `main`. Rename your branch or adjust that one workflow line.
5. On GitHub, open **Settings → Pages → Build and deployment → Source**, select
   **GitHub Actions**. Do not select a `/docs` folder or add a Jekyll workflow.
6. Open **Actions → Deploy game to GitHub Pages → Run workflow → main**. This is
   useful if the first push happened before Pages was enabled. Wait for the build
   and deployment jobs to succeed.
7. Open the published URL shown in the deployment or Settings → Pages:
   `https://YOUR-USERNAME.github.io/misi-nombor/` (replace username and repository name).
8. Future commits pushed to `main` automatically validate, package and republish.

Alternative upload using Git in PowerShell, from this project folder:

```powershell
git init -b main
git add .
git status
git commit -m "Prepare game for GitHub Pages"
git remote add origin https://github.com/YOUR-USERNAME/misi-nombor.git
git push -u origin main
```

Use the commands only when creating a new repository, and replace the placeholder.
`dist/`, local references, temporary files and the project brief are ignored.
Upload the actual folders/files, including `.github/`, not a ZIP file. GitHub
Desktop or Git is recommended over the browser uploader to preserve the folder
structure and avoid hundreds of manual uploads. Media files are regular Git files;
Git LFS is not needed for the current assets.

## Paths, persistence and media

All runtime paths are relative, so any repository name works without setting a
base URL. Navigation changes the page DOM, not the URL: no SPA rewrite, router
base, `404.html` workaround or backend is required. Preserve spaces, Unicode,
capitalisation and all asset folder names exactly. Browsers encode these URLs.
The build checks case-sensitive file references even on Windows, including
randomised numbers 1–10, species, foods and the four teaching videos.

Names, character selection, completed missions and music settings live in
`localStorage` under `misi-nombor-v1`. They stay on that browser/device and do not
sync. The public site starts with its own progress; localhost progress is not
transferred. All visitors can play without an account. Audio/video uses normal
browser playback permissions; use the player or sound buttons if playback is
blocked. Tutorials have controls and do not autoplay.

## Online acceptance check

After the first successful deployment, use a fresh browser profile to check:

- Login validation, both avatars, profile changes and map movement.
- Each tutorial loads and plays in its start panel; Mula and Peta stop playback.
- Complete all three rounds in each mission, including wrong answers/retries,
  counting each animal once, food selection and drag/drop into baskets.
- Final mission rejects wrong food types and resets incorrect quantities.
- Semula, Seterusnya, progressive unlocking, final trophy/name/avatar and music.
- Reload the public page and confirm progress persists on the same browser.
- Check browser Network/Console for 404s, wrong MIME types or script errors.

If a workflow fails, inspect the first failing step in Actions. For missing assets,
restore the exact filename/case and push again. If changes seem absent, use Ctrl+F5.
If Pages is unavailable, confirm the repository is public and Source is GitHub Actions.

Official references:
[GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
[publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

The original supplied artwork/audio/video remains subject to its existing rights;
this deployment configuration does not assign a new licence to those assets.
