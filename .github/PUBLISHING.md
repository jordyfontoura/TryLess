# 📦 Publishing Guide

This guide explains how to publish new versions of `tryless` to npm using GitHub Actions.

## 🔑 Setup (One-time)

### 1. Generate NPM Token

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Click on your profile → **Access Tokens**
3. Click **Generate New Token** → **Classic Token**
4. Select **Automation** type
5. Copy the generated token

### 2. Add NPM Token to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: paste your npm token
6. Click **Add secret**

## 🚀 Publishing a New Version

### Step 1: Update Version

In the `package/package.json` file, update the version number:

```json
{
  "name": "tryless",
  "version": "1.4.4", // Update this
  ...
}
```

Follow [Semantic Versioning](https://semver.org/):
- **Patch** (1.4.3 → 1.4.4): Bug fixes
- **Minor** (1.4.3 → 1.5.0): New features (backward compatible)
- **Major** (1.4.3 → 2.0.0): Breaking changes

### Step 2: Commit Changes

```bash
git add package/package.json
git commit -m "chore: bump version to 1.4.4"
git push origin dev
```

### Step 3: Create and Push Tag

```bash
# Create annotated tag
git tag -a v1.4.4 -m "Release v1.4.4"

# Push tag to GitHub
git push origin v1.4.4
```

### Step 4: Wait for Workflow

The GitHub Action will automatically:
1. ✅ Run linter
2. ✅ Run tests
3. ✅ Build the package
4. ✅ Copy README.md from root to package directory
5. ✅ Publish to npm
6. ✅ Create GitHub Release

You can monitor the progress at:
`https://github.com/jordyfontoura/tryless/actions`

## 🔄 Workflows

### Publish Workflow (`publish.yml`)

**Triggered by:** Creating a tag starting with `v` (e.g., `v1.4.4`)

**What it does:**
- Runs on Ubuntu latest
- Tests the package on Node 18
- Builds and publishes to npm
- Creates a GitHub Release

### CI Workflow (`ci.yml`)

**Triggered by:** Push to `main`/`dev` branches or Pull Requests

**What it does:**
- Tests on multiple Node versions (18, 20, 22)
- Runs linter and tests
- Ensures the package builds correctly

## 🐛 Troubleshooting

### Publish Failed: "You cannot publish over the previously published versions"

**Solution:** The version already exists on npm. Update the version number in `package.json` and create a new tag.

### Publish Failed: "npm ERR! code E401"

**Solution:** The `NPM_TOKEN` is invalid or expired.
1. Generate a new token on npmjs.com
2. Update the secret on GitHub

### Build Failed

**Solution:** 
1. Run locally first: `pnpm --filter tryless test && pnpm --filter tryless build`
2. Fix any errors
3. Commit and push fixes
4. Create tag again

### Wrong Package Published

**Solution:** You can unpublish within 72 hours:
```bash
cd package
npm unpublish tryless@1.4.4
```

Then fix the issue and publish again.

## ✅ Checklist Before Publishing

- [ ] All tests pass locally: `pnpm --filter tryless test`
- [ ] Build succeeds: `pnpm --filter tryless build`
- [ ] Version updated in `package/package.json`
- [ ] CHANGELOG updated (if exists)
- [ ] README updated (if needed)
- [ ] Committed all changes
- [ ] Created and pushed tag with correct version

## 📝 Example Release Process

```bash
# 1. Make your changes and commit them
git add .
git commit -m "feat: add new helper function"

# 2. Update version in package/package.json
# (manually edit the file)

# 3. Commit version bump
git add package/package.json
git commit -m "chore: bump version to 1.5.0"

# 4. Push to remote
git push origin dev

# 5. Create and push tag
git tag -a v1.5.0 -m "Release v1.5.0: Add new helper function"
git push origin v1.5.0

# 6. Watch the magic happen! 🎉
# Visit: https://github.com/jordyfontoura/tryless/actions
```

## 🎯 Best Practices

1. **Always test locally first** before creating a tag
2. **Use semantic versioning** consistently
3. **Write clear tag messages** describing what changed
4. **Don't delete published versions** - increment instead
5. **Monitor the workflow** to catch issues early
6. **Update documentation** when adding new features
7. **Edit README.md in the root**, not in `package/` (it's auto-copied)

## 🔗 Useful Links

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)

