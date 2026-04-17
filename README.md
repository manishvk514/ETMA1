# Everything Media — website

A 5-file static site. No build step. No framework. Drop on any host.

## Files

```
everything-media/
├── index.html      the site
├── style.css       the design system
├── script.js       the motion + form
├── vercel.json     hosting config (for Vercel)
└── README.md       this file
```

---

## How to deploy — the easy way (Vercel, 10 minutes)

### Once only

1. Go to **vercel.com** and sign up with your email or GitHub.
2. Click **Add New → Project**.
3. Choose **"Deploy without Git"** or just **drag the `everything-media` folder** into the browser window on vercel.com/new.
4. Name it `everything-media`. Leave everything else as default.
5. Click **Deploy**.
6. You get a live URL in ~30 seconds. Something like `everything-media.vercel.app`.

That's the site. Live. Worldwide.

### Connecting your domain (e.g. `everythingmedia.studio`)

1. In Vercel, open your project → **Settings → Domains**.
2. Type your domain `everythingmedia.studio` and click **Add**.
3. Vercel will show you 1–2 DNS records to add. Common case:
   - **A record**: `@` pointing to `76.76.21.21`
   - **CNAME record**: `www` pointing to `cname.vercel-dns.com`
4. Log into wherever you bought the domain (GoDaddy, Namecheap, Hostinger, Cloudflare, etc).
5. Open the **DNS settings** for the domain and add those two records exactly as Vercel shows them.
6. Save. Wait 10 minutes – 24 hours. Vercel will auto-verify and your domain goes live with HTTPS automatically.

That's it. No other step.

---

## How to update the site later

### Option A — re-upload (simplest)

1. Edit the file you want to change (e.g. replace an image URL in `index.html`).
2. Zip the folder or just drag it into your Vercel project → **Deployments → Upload**.
3. Vercel re-deploys in 30 seconds.

### Option B — use Claude Code (recommended for ongoing changes)

If you want to edit this site by chatting instead of opening files:

1. Install **Node.js** from https://nodejs.org (pick the LTS version, click install).
2. Install **Claude Code** by opening the Terminal (Mac: Cmd+Space → "Terminal") and pasting:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
3. Navigate to the folder:
   ```
   cd path/to/everything-media
   ```
4. Run:
   ```
   claude
   ```
5. Sign in with your Claude account. Now you can type things like "change the hero line to X" or "add a case study for JioStar" and it edits the files for you.
6. To preview locally, open a second terminal in the same folder and run:
   ```
   npx serve
   ```
   It gives you a URL like `http://localhost:3000` — open it in a browser.

---

## What the form currently does

By default, the form opens the visitor's email client pre-filled with their message, addressed to `hello@everythingmedia.studio`. Works immediately, no backend needed.

### Upgrading to a real backend (when you're ready)

Use **Formspree** (free tier) or **Resend**. Both take ~5 minutes:

**Formspree path:**
1. Sign up at formspree.io.
2. Create a new form. Copy its endpoint (looks like `https://formspree.io/f/xabcd1234`).
3. In `index.html`, find `<form id="contact-form"` and add: `action="https://formspree.io/f/xabcd1234" method="POST"`.
4. In `script.js`, find the `submitForm` function and replace its body with:
   ```js
   const res = await fetch(form.action, {
       method: 'POST',
       headers: { 'Accept': 'application/json' },
       body: new FormData(form)
   });
   return { ok: res.ok };
   ```
5. Done. Inquiries arrive in your Formspree dashboard + forwarded to your email.

---

## Replacing the placeholder images

All hero stills and work images are currently from Unsplash as placeholders. To swap them:

**Hero stills** — in `index.html`, find the `.hero-still` divs and replace the `background-image: url(...)` values with your own image URLs or local paths.

**Work grid** — find each `<img src="..."` in the `#work` section and replace with your own. Dimensions to use:
- Full-width tiles: 2400×1030 (21:9 ratio)
- Half/third tiles: 1600×900 (16:9 ratio)

If you want to host images locally, create an `images/` folder in the project and reference them as `images/jiostar-01.jpg`.

---

## Fonts

Loaded from Google Fonts — no license fee, no setup. Serif is **Instrument Serif**. Mono is **JetBrains Mono**.

If you later want the premium **PP Editorial New** (by Pangram Pangram — better serif), it's a paid license; the swap is one line in `style.css`.

---

## Browser support

Chrome, Safari, Firefox, Edge — all current versions.

---

## Credits

Built by Manish Verma Kumawat with Claude (Anthropic). 2026.
