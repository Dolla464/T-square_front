# خطوات النشر المطلوبة يدوياً

---

## الخطوة 1 — إضافة SSH Keys على السيرفر

افتح terminal على جهازك المحلي ونفذ:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/tsquare_deploy
```

ده هيعمل ملفين:
- `~/.ssh/tsquare_deploy` ← المفتاح الخاص (Private Key) — هيتحط في GitHub
- `~/.ssh/tsquare_deploy.pub` ← المفتاح العام (Public Key) — هيتحط في السيرفر

---

## الخطوة 2 — إضافة المفتاح العام في السيرفر (aaPanel)

اتصل بالسيرفر:

```bash
ssh root@IP_السيرفر
```

ثم:

```bash
cat >> ~/.ssh/authorized_keys << 'EOF'
[الصق هنا محتوى ملف tsquare_deploy.pub]
EOF
chmod 600 ~/.ssh/authorized_keys
```

---

## الخطوة 3 — إضافة GitHub Secrets

روح على الـ repo في GitHub:
**Settings → Secrets and variables → Actions → New repository secret**

أضف الـ 5 secrets دول:

| الاسم | القيمة |
|---|---|
| `VITE_API_URL` | `https://api.tsquarecenter.com/api` |
| `SSH_HOST` | IP السيرفر (مثال: `123.456.78.90`) |
| `SSH_USERNAME` | `root` |
| `SSH_PRIVATE_KEY` | محتوى ملف `~/.ssh/tsquare_deploy` كاملاً (يبدأ بـ `-----BEGIN OPENSSH PRIVATE KEY-----`) |
| `SSH_PORT` | `22` |

---

## الخطوة 4 — إعداد Nginx في aaPanel

1. افتح aaPanel
2. روح على **Website** ← اختار `tsquarecenter.com`
3. اضغط **Config** أو **Nginx Config**
4. جوه الـ `server { }` block، أضف:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

5. اضغط **Save** ثم **Reload Nginx**

> هذا الإعداد ضروري لأن React Router يعمل client-side، وبدونه أي رابط مباشر غير الـ home page سيرجع 404.

---

## الخطوة 5 — التأكد من مسار الموقع في aaPanel

تأكد أن الـ Document Root للموقع `tsquarecenter.com` هو:

```
/www/wwwroot/tsquarecenter.com
```

GitHub Actions هيرفع ملفات الـ `dist/` لهذا المسار مباشرةً.

---

## كيف يعمل الـ CI/CD بعد الإعداد

```
push to main
     ↓
quality-check job
  ├── npm install
  ├── npm run lint
  └── npm run build (مع VITE_API_URL من Secrets)
     ↓
deploy job
  └── رفع dist/ للسيرفر عبر SCP
     ↓
lighthouse job
  └── فحص أداء https://tsquarecenter.com
```

---

## الخطوة 6 — أول push للتجربة

بعد ما تخلص الخطوات فوق، ادفع أي تغيير صغير على الـ `main` branch:

```bash
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin main
```

ثم راقب الـ Actions من: **GitHub repo → Actions tab**

---

## في حالة وجود مشكلة في الاتصال SSH

تأكد من:
- [ ] Port 22 مفتوح في الـ Firewall على السيرفر
- [ ] `authorized_keys` فيه المفتاح الصح
- [ ] صلاحيات الملف: `chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`
