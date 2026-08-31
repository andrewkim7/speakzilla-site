# speakzilla.app — marketing site

Static landing page for the SpeakZilla mobile app, plus the privacy policy the
app stores require at a public URL.

Deliberately plain HTML with no build step: Cloudflare Pages serves this
directory as-is, so there is nothing to break and nothing to keep updated
alongside the app. The app itself lives in `speakzilla-mobile`.

- `index.html`  — landing page
- `privacy.html` — privacy policy (converted from the mobile repo's PRIVACY.md)
- `support.html` — support page. Apple requires a support URL for the store
  listing, and an email address alone does not satisfy it.
- `assets/`      — mascot and coach portraits, shared with the app

## Before publishing

`privacy.html` still contains highlighted `[PLACEHOLDERS]` — legal entity name,
address, contact email and the effective date. They render in yellow so they
cannot be missed. Fill them in before pointing the stores at this URL, and have
the policy reviewed for your jurisdiction.

## Deploy

Cloudflare Pages → Create project → connect this repo →
build command: *none*, output directory: `/`.
Then add `speakzilla.app` as a custom domain.
