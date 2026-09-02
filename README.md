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

## Editing the privacy policy

The policy is filled in — legal entity (Andrew Kim), address, contact
(support@speakzilla.app) and effective date are all set, and `build-privacy.py`
reports zero remaining placeholders. Edit the source `privacy.md`, then re-run
`python build-privacy.py`: it rebuilds `privacy.html`, wraps any unfilled
`[PLACEHOLDER]` in yellow, and prints how many are left. Have material changes
reviewed for your jurisdiction.

## Deploy

Cloudflare Pages → Create project → connect this repo →
build command: *none*, output directory: `/`.
Then add `speakzilla.app` as a custom domain.
