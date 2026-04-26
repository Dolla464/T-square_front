# Developer Workflow Quick Guide (Git + Vercel + Laravel)

This guide is a practical daily checklist for working safely on your branch, pulling updates from the repo, restoring mistakes, deploying previews on Vercel, and running Laravel locally.

---

# 1) Start Working on Your Branch (Every Session)

Open terminal inside project folder:

```
git status
```

Make sure you're on your branch:

```
git branch
```

If not:

```
git checkout MohamedSalama/feature/my-updates
```

---

# 2) Pull Latest Updates from Repo Before Coding

Always do this before starting work:

```
git pull origin main
```

Then merge main into your branch:

```
git merge main
```

Resolve conflicts if they appear.

---

# 3) Save Your Work (Commit Properly)

Check modified files:

```
git status
```

Add changes:

```
git add .
```

Commit changes:

```
git commit -m "intgration api with login , navbar , register , forgetpassword , courses , categories , payment and fix some touches in ui "
```

Example:

```
git commit -m "fix contact mobile spacing issue"
```

---

# 4) Push Your Branch to GitHub

```
git push origin MohamedSalama/feature/my-updates
```

---

# 5) Restore If Something Breaks

Undo unstaged changes:

```
git restore .
```

Undo staged file:

```
git restore --staged filename
```

Undo last commit (keep code):

```
git reset --soft HEAD~1
```

Undo last commit completely:

```
git reset --hard HEAD~1
```

Restore specific file from repo:

```
git checkout main filename
```

---

# 6) If Repo Updated While You Were Working

Save changes first:

```
git add .
```

```
git commit -m "save progress"
```

Then:

```
git pull origin main
```

Resolve conflicts if needed.

---

# 7) Temporary Deploy Using Vercel CLI

Login once:

```
vercel login
```

Deploy preview:

```
vercel
```

Deploy production preview link:

```
vercel --prod
```

Link project if needed:

```
vercel link
```

---

# 8) Run Laravel Project Locally

Install dependencies first time only:

```
composer install
```

Create env file if missing:

```
cp .env.example .env
```

Generate app key:

```
php artisan key:generate
```

Run server:

```
php artisan serve
```

Server runs at:

```
http://127.0.0.1:8000
```

---

# 9) Clear Laravel Cache (When Errors Appear)

```
php artisan config:clear
```

```
php artisan cache:clear
```

```
php artisan route:clear
```

```
php artisan view:clear
```

---

# 10) Run Database Migration

```
php artisan migrate
```

Refresh database completely:

```
php artisan migrate:fresh
```

Run seeders:

```
php artisan db:seed
```

---

# 11) Daily Safe Workflow Order (Recommended)

Every time before coding:

1. git checkout your-branch
2. git pull origin main
3. git merge main

After finishing feature:

4. git add .
5. git commit -m "message"
6. git push origin your-branch

If preview needed:

7. vercel

If backend testing needed:

8. php artisan serve

---

# 12) Emergency Recovery Strategy (When Things Get Messy)

Return project to last clean commit:

```
git reset --hard HEAD
```

Return to latest GitHub version:

```
git fetch origin
```

```
git reset --hard origin/main
```

Use car
