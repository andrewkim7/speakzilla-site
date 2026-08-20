# Supabase email templates

Paste into **Supabase → Authentication → Email Templates**.

| File | Template | Subject to use |
| --- | --- | --- |
| `confirm-signup.html` | Confirm signup | `Confirm your SpeakZilla account` |
| `reset-password.html` | Reset Password | `Reset your SpeakZilla password` |

Both use `{{ .ConfirmationURL }}`, the only variable either flow needs.

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
