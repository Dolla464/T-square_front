# Frontend CI/CD — Deployment Checklist

---

## Production directory

```text
/www/wwwroot/tsquarecenter.com
```

This directory contains the frontend **source repository** and Node build tooling. The production server performs the Vite production build using the server-side `.env.production` file.

```text
The production server performs the Vite production build.
```

Do not copy GitHub secrets into `.env` or `.env.production` on the server. Environment configuration remains server-side.

---

## GitHub Secrets

Add these in **Settings → Secrets and variables → Actions → New repository secret**.

Document names only — never commit secret values.

| Name | Purpose |
|---|---|
| `SSH_HOST` | Production server host/IP for SSH deploy |
| `SSH_USERNAME` | SSH user (for example `root`) |
| `SSH_PRIVATE_KEY` | Private deploy key (full key contents) |
| `SSH_PORT` | SSH port (for example `22`) |

`VITE_API_URL` is **not** injected during GitHub Actions in this workflow. Production build reads server-side environment files.

---

## Branch behavior

| Event | quality-check | deploy | lighthouse |
|---|---|---|---|
| push to `main` | yes | yes | yes |
| push to `develop` | yes | no | no |
| pull_request to `main` or `develop` | yes | no | no |

Only **push to `main`** deploys to production.

---

## CI/CD flow

### Quality checks (all supported triggers)

```text
checkout
→ setup Node 22
→ npm ci
→ npm run lint            (non-blocking)
→ npx vitest run          (non-blocking)
→ npm audit --audit-level=high   (non-blocking)
```

Non-blocking policy:

- Lint failures emit a GitHub warning and do not fail the job.
- Test failures emit a GitHub warning and do not fail the job.
- npm audit high-severity findings emit a GitHub warning and do not fail the job.

The quality job does **not** run `npm run build` and does **not** upload artifacts.

### Production deployment (`main` push only)

```text
push to main
     ↓
quality-check
     ↓
SSH to aaPanel
     ↓
cd /www/wwwroot/tsquarecenter.com
git fetch origin
git reset --hard origin/main
npm ci
npm run build
     ↓
curl verify https://tsquarecenter.com/
     ↓
Lighthouse on https://tsquarecenter.com
```

There is **no** artifact upload/download and **no** SCP-based `dist/` deployment.

---

## One-time server setup

### 1. SSH deploy key on the server

Generate a key locally:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/tsquare_deploy
```

Add the public key to the server:

```bash
ssh root@YOUR_SERVER_IP
cat >> ~/.ssh/authorized_keys << 'EOF'
[paste tsquare_deploy.pub contents here]
EOF
chmod 600 ~/.ssh/authorized_keys
```

Add the private key to GitHub secret `SSH_PRIVATE_KEY`.

### 2. Clone the frontend repo on the server

Ensure the production directory is a git checkout of the frontend repository:

```bash
cd /www/wwwroot
git clone <frontend-repo-url> tsquarecenter.com
```

Ensure `.env.production` exists on the server with the correct production API URL.

### 3. Nginx SPA fallback (one-time manual setup)

In aaPanel, for site `tsquarecenter.com`, ensure Nginx includes:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Save and reload Nginx once during initial setup. The GitHub Actions deploy job does **not** reload Nginx on each deploy.

---

## First pipeline run

After secrets and server setup are complete, push to `main`:

```bash
git push origin main
```

Monitor: **GitHub repo → Actions tab**

---

## SSH troubleshooting

- [ ] Port 22 is open in the server firewall
- [ ] `authorized_keys` contains the correct public key
- [ ] Permissions: `chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`
- [ ] Production directory is a valid git repo with `origin` pointing to GitHub
- [ ] Server Node.js version supports the project (Node 22 recommended)
