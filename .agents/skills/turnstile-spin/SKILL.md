---
name: turnstile-spin
description: End-to-end Cloudflare Turnstile bot verification configuration and validation guide for forms and API routes.
---

# Cloudflare Turnstile Bot Protection Guide

This project integrates Cloudflare Turnstile bot protection for authentication, inquiry forms, and academy trial applications.

## Configured Parameters
- **Public Site Key**: `0x4AAAAAAEUXTyqZ1EGIr5ag`
- **Backend Secret Key**: Stored exclusively in server environment variable `TURNSTILE_SECRET_KEY` / `TURNSTILE_SECRET` (never committed to Git).
- **Backend Endpoint**: `/.netlify/functions/verify-turnstile` (routed from `/api/verify-turnstile` via `netlify.toml`).

## Protected Form Endpoints & Actions
1. **Player Authentication / Dossier Login**: `portal.html` & `portal/index.html` → `data-action="login"`
2. **Academy Trials Application**: `recruit/index.html` → `data-action="trial_application"`
3. **Contact & Sponsorship Inquiries**: `contact/index.html` → `data-action="contact"`

## Frontend Snippet Pattern
```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<div class="cf-turnstile" data-sitekey="0x4AAAAAAEUXTyqZ1EGIr5ag" data-action="<action>" data-theme="dark"></div>
```

## Backend Verification Pattern
```javascript
const formData = new URLSearchParams();
formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
formData.append('response', token);
if (clientIp) formData.append('remoteip', clientIp);

const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: formData,
  signal: AbortSignal.timeout(10_000)
});
const result = await res.json();
// Check result.success === true, result.action, and allowed hostname
```
