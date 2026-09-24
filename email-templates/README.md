# Supabase email templates

Paste into **Supabase → Authentication → Email Templates**.

| File | Template | Subject to use |
| --- | --- | --- |
| `confirm-signup.html` | Confirm signup | see **Subjects** below |
| `reset-password.html` | Reset Password | see **Subjects** below |

Both use `{{ .ConfirmationURL }}` and, since the Korean and Japanese work,
`{{ .Data.locale }}`.

> The site went live with `/ko/` and `/ja/` on 2026-09-22, so these can be
> pasted any time. Until they are, the dashboard holds the English-only
> version: Korean and Japanese sign-ups get English mail (it works, it is
> just not localized).

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

Anything that is not `ko`, `ja`, `zh-Hans` or `zh-Hant` gets English.

**Chinese, 2026-09-24.** Both templates and both subjects gained Simplified and Traditional
branches (the app stores `zh-Hans` / `zh-Hant` — by script, never a bare `zh`). Wording
follows the app: 邮箱 / 重置 / 链接 in Simplified, 電子郵件 / 重設 / 連結 in Traditional.
The footer's site and policy links now go to the reader's own language for all four
(the Korean and Japanese policy link used to open the English policy). Re-tested the same
way, under Go 1.26 `text/template` and `html/template`: both files and both subjects against
thirteen account shapes — the nine above plus `zh-Hans`, `zh-Hant`, a bare `zh` and a
lower-case `zh-hans` (both of which must, and do, fall to English): 104 runs, no errors,
exactly one language per mail.

### Subjects

The subject field is a template as well, and Supabase caps it at **255 characters** -- the
five-language lines are written compactly for that (no spaces inside `{{ }}`, `$l`, `print`
instead of `printf "%v"`: same nil-safety, it still turns anything into a string). Confirm is
237 characters, Reset 234. Paste one line each:

Confirm signup:

    {{$l:=print .Data.locale}}{{if eq $l "ko"}}SpeakZilla 계정을 확인해 주세요{{else if eq $l "ja"}}SpeakZillaアカウントの確認{{else if eq $l "zh-Hans"}}确认 SpeakZilla 账号{{else if eq $l "zh-Hant"}}確認 SpeakZilla 帳號{{else}}Confirm your SpeakZilla account{{end}}

Reset Password:

    {{$l:=print .Data.locale}}{{if eq $l "ko"}}SpeakZilla 비밀번호 재설정{{else if eq $l "ja"}}SpeakZillaパスワードの再設定{{else if eq $l "zh-Hans"}}重置 SpeakZilla 密码{{else if eq $l "zh-Hant"}}重設 SpeakZilla 密碼{{else}}Reset your SpeakZilla password{{end}}

**Verified 2026-09-22:** the subject field accepts the conditionals — the send
test below produced an English, a Korean and a Japanese subject. Pasted into
Supabase the same day. If a future Supabase change ever shows `{{` in a
subject, use these instead — plain text, all three languages:

    SpeakZilla — Confirm your account · 계정 확인 · アカウント確認
    SpeakZilla — Reset your password · 비밀번호 재설정 · パスワード再設定

### Send test, the day they are pasted (about five minutes)

Run 2026-09-22 by Andrew: all three PASSED. Note for next time: Gmail delivered
the Japanese confirmation about five minutes after Supabase/Resend sent it
(the auth log showed the signup at 200 in 1.3 s); the two resets arrived within
a minute. Wait five minutes and check spam before suspecting the template. An
account with no language cannot be one of the real users — create a stand-in
in the dashboard (Add user, auto-confirm) with a `+alias` address.

1. **An account with no language** — request a password reset for any account
   created before v1.3. It must arrive, in English. This is the one that
   matters: it is every existing user.
2. In the app, switch to 한국어, sign out, request a reset for the same
   account: Korean subject, Korean body, and the page it opens
   (`/reset`) is Korean.
3. Sign up with a fresh address while the app is in 日本語: Japanese
   confirmation, and `/confirmed` opens in Japanese.

4. **Chinese (2026-09-24 paste):** in the app switch to 简体中文, sign out, request a
   reset: Simplified subject and body, and `/reset` opens in Simplified. Then the
   same in 繁體中文. Step 1 again first — it is still the one that matters.

If step 1 fails, paste the `master` version of the template back first and
investigate second. (The Korean/Japanese-only version of 2026-09-22 is commit
`ed38d74` in this repo.)

### The pages the emails open

`confirmed.html` and `reset.html` are reached from an email, not from `/ko/`
or `/ja/`, so they pick their own language (Chinese too since 2026-09-24; a
browser tag with Hant, TW, HK or MO means Traditional): the account's `locale`, read from
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
