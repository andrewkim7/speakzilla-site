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
