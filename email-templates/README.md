# Supabase email templates

Paste into **Supabase → Authentication → Email Templates**.

| File | Template | Subject to use |
| --- | --- | --- |
| `confirm-signup.html` | Confirm signup | see **Subjects** below |
| `reset-password.html` | Reset Password | see **Subjects** below |

Both use `{{ .ConfirmationURL }}` and, since the Korean and Japanese work,
`{{ .Data.locale }}`.

> **On branch `i18n-ko-ja` these are the three-language versions. Do not paste
> them into Supabase before app v1.3.0 is released** — their footers link to
> `/ko/` and `/ja/`, which do not exist on the live site until the branch is
> merged. What is in the dashboard today is the English-only version on
> `master`.

## Three languages, one template

Supabase keeps one template per email, so each file carries English, Korean and
Japanese and chooses between them. The app writes the learner's language into
the account's `user_metadata.locale` at sign-up (`signUp` in
`speakzilla-mobile/lib/api.ts`) and again whenever they change it in Profile →
Language; Supabase hands `user_metadata` to the template as `.Data`.

Every template starts with

    {{ $lang := printf "%v" .Data.locale }}

and compares `$lang`, never `.Data.locale` directly. Every account made before
v1.3, and every Apple/Google account that never opened the Language picker,
has no `locale` at all, and a failed template means **no email** — someone
locked out of their account with no way back in. `printf` turns whatever is
there (nothing, null, a number) into a string, so the comparison cannot fail.
Tested 2026-09-20 by executing both files and both subjects under Go's
`text/template` and `html/template` against nine shapes of account (no
metadata, empty, Google-style, en, ko, ja, unknown language, non-string, null):
72 runs, no errors, exactly one language per mail, English whenever in doubt.
For the record: on Go 1.26 the plain `eq .Data.locale "ko"` also survives a
missing key and only errors on a non-string value. The `printf` costs nothing
and does not depend on which Go version Supabase happens to run.

Anything that is not `ko` or `ja` gets English.

### Subjects

The subject field is a template as well. Paste one line each:

Confirm signup:

    {{ $lang := printf "%v" .Data.locale }}{{ if eq $lang "ko" }}SpeakZilla 계정을 확인해 주세요{{ else if eq $lang "ja" }}SpeakZillaアカウントの確認{{ else }}Confirm your SpeakZilla account{{ end }}

Reset Password:

    {{ $lang := printf "%v" .Data.locale }}{{ if eq $lang "ko" }}SpeakZilla 비밀번호 재설정{{ else if eq $lang "ja" }}SpeakZillaパスワードの再設定{{ else }}Reset your SpeakZilla password{{ end }}

**Not verified against Supabase itself:** that the subject field accepts
conditionals (the documentation only shows them in the body). The send test
below settles it. If a subject arrives with `{{` in it, or the mail does not
arrive, use these instead — plain text, all three languages:

    SpeakZilla — Confirm your account · 계정 확인 · アカウント確認
    SpeakZilla — Reset your password · 비밀번호 재설정 · パスワード再設定

### Send test, the day they are pasted (about five minutes)

1. **An account with no language** — request a password reset for any account
   created before v1.3. It must arrive, in English. This is the one that
   matters: it is every existing user.
2. In the app, switch to 한국어, sign out, request a reset for the same
   account: Korean subject, Korean body, and the page it opens
   (`/reset`) is Korean.
3. Sign up with a fresh address while the app is in 日本語: Japanese
   confirmation, and `/confirmed` opens in Japanese.

If step 1 fails, paste the `master` version of the template back first and
investigate second.

### The pages the emails open

`confirmed.html` and `reset.html` are reached from an email, not from `/ko/`
or `/ja/`, so they pick their own language: the account's `locale`, read from
the token Supabase passes in the URL fragment (for display only — nothing
trusts it), else the browser's first supported language, else English. English
is what the HTML itself says, so the pages read correctly with scripts off.
Supabase's own error strings are English only; the Korean and Japanese pages
say their own sentence instead of showing them.

## Why they look like 2005

Email clients are not browsers. Outlook renders with Word's engine, and Gmail
strips `<style>` blocks — so layout is tables and every style is inline. No
flexbox, no grid, no web fonts. This is the boring approach because it is the
one that survives.

Other deliberate choices:

- **A visible fallback URL** under the button. Some clients strip or mangle
  styled links, and a reset email with no working link is a dead end.
- **A hidden preheader line**, which is what the inbox shows as preview text
  instead of scraping the first words of the body.
- **"If you did not ask for this"** on both. Standard, and on the reset mail it
  reassures the reader that ignoring it changes nothing.
- **No coach signature.** Alex and Sofia belong in lessons; account and
  security mail comes from SpeakZilla.
- The logo loads from `https://speakzilla.app/assets/icon.png`, so it keeps
  working as long as the site is up.

## Sender name

The templates cannot change who the mail is from. That needs custom SMTP —
until then Supabase sends as "Supabase Auth", and only to team member
addresses, capped at 2 messages an hour.

## Custom SMTP (Resend)

Verify the **root** domain `speakzilla.app` in Resend, not a subdomain — Resend
already scopes its own records under `send.`, so nothing lands on the root and
nothing collides with the Cloudflare Email Routing records that deliver
support@. All three records go in Cloudflare as **DNS Only** (grey cloud); the
proxy breaks mail records.

| Type | Name | Value |
| --- | --- | --- |
| MX | `send` | `feedback-smtp.<region>.amazonses.com`, priority 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| TXT | `resend._domainkey` | the `p=...` key from Resend |

Supabase → Authentication → Emails → SMTP Settings:

| Field | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` (the literal word) |
| Password | Resend API key — sending access, scoped to the domain |
| Sender email | `support@speakzilla.app` |
| Sender name | `SpeakZilla` |

`support@` rather than `noreply@` on purpose: it already routes to Gmail, and
people reply to confirmation mail when something has gone wrong.

Afterwards raise the limit under Authentication → Rate Limits — it stays at 30
an hour until changed. Test with an address that is **not** a Supabase team
member, since a team address would have worked before SMTP too.
