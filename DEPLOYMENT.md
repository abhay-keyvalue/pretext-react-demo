# GitHub Pages Deployment Guide

## Automatic Deployment (Recommended)

Your repository is now configured with GitHub Actions for automatic deployment. Every push to the `main` branch will automatically build and deploy your site.

### Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/abhay-keyvalue/pretext-react-demo
2. Click on **Settings** (top navigation)
3. Click on **Pages** (left sidebar under "Code and automation")
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
5. Save the settings

The GitHub Actions workflow will automatically deploy your site when you push changes to the main branch.

### View Deployment Status

- Go to the **Actions** tab in your repository
- You should see a workflow run called "Deploy to GitHub Pages"
- Once it completes (green checkmark), your site will be live at:
  - **https://abhay-keyvalue.github.io/pretext-react-demo/**

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
npm run deploy
```

This will:
1. Build the production version
2. Deploy to the `gh-pages` branch
3. Make it available at the GitHub Pages URL

## Troubleshooting

### If the site shows a 404 error:

1. Check that GitHub Pages is enabled in Settings → Pages
2. Make sure the source is set to "GitHub Actions"
3. Check the Actions tab for any failed deployments
4. Ensure the workflow has completed successfully

### If the site loads but shows blank page:

1. Check browser console for errors
2. Verify the `base` path in `vite.config.ts` matches your repository name
3. Clear your browser cache

### If images or assets don't load:

- Make sure all asset paths are relative (not absolute)
- The `base` path in `vite.config.ts` should be `/pretext-react-demo/`

## First Deployment

After pushing the changes:

1. Wait 1-2 minutes for GitHub Actions to complete
2. Check the Actions tab for deployment status
3. Once complete, visit: https://abhay-keyvalue.github.io/pretext-react-demo/

## Future Updates

Simply push to the main branch, and GitHub Actions will automatically rebuild and deploy your site!

```bash
git add .
git commit -m "Your update message"
git push
```

Your live demo link is already in the README.md file! 🎉
