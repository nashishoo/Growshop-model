---
description: Deploy static sites to GitHub Pages using GitHub Actions
author: aviz85 (adapted)
tags: [deployment, github-pages, actions, ci-cd]
---

# GitHub Pages Deploy (Workflow Approach)

This skill describes the modern "Best Practice" for deploying static sites (like React/Vite apps) to GitHub Pages using GitHub Actions, avoiding manual branch management.

## 1. Prerequisites
- A GitHub repository.
- A build script in `package.json` (e.g., `npm run build`) that outputs to a `dist` or `build` folder.
- **IMPORTANT**: If using a router (React Router), ensure your code handles client-side routing on static hosts (e.g. using HashRouter or a 404 hack).
- **IMPORTANT**: If the site is not at the root domain (username.github.io), configure the `base` path in your bundler (Vite: `base: '/repo-name/'`).

## 2. Enable GitHub Pages (vía CLI)
Tell GitHub to look for a GitHub Actions workflow instead of a branch.

```bash
# Get repo details if needed, or just substitute manually
# gh api repos/:owner/:repo/pages -X POST -f build_type=workflow

# Example:
gh api repos/nashishoo/MyRepo/pages -X POST -f build_type=workflow
```

## 3. Configure Workflow (`.github/workflows/deploy.yml`)
Create this file in your repository.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: './frontend/package-lock.json' # Adjust if needed

      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend # Adjust folder

      - name: Build
        run: npm run build
        working-directory: ./frontend # Adjust folder
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }} # Inject secrets if needed

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './frontend/dist' # Adjust folder

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 4. Verification
After pushing this file:
1. Go to the "Actions" tab in your GitHub repo.
2. Watch the "Deploy to GitHub Pages" workflow run.
3. Once green, your site is live at `https://<user>.github.io/<repo>/`.
