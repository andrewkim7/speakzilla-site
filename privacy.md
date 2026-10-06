# SpeakZilla Privacy Policy

**Effective date:** 19 August 2026
**Last updated:** 6 October 2026

SpeakZilla ("SpeakZilla", "we", "us") is a pronunciation-practice app
operated by Andrew Kim, Ontario, Canada. This policy explains
what personal data we collect, why, who we share it with, and the choices
and rights you have.

If you have questions, contact us at **support@speakzilla.app**.

---

## 1. Who this policy covers

This policy applies to everyone who creates an account or uses SpeakZilla
on the web or in our mobile apps.

## 2. Information we collect

**a) Account information**
- Your email address and a password (passwords are stored only in hashed
  form by our authentication provider — we never see or store your plain
  password).
- A display name, which by default is derived from your email address.
- If you sign in with Apple or Google instead of a password: the email address that provider gives us and, where the provider shares them, your name and profile picture, which we show on your Profile screen. We receive nothing else from your Apple or Google account, and we never see that account's password.
- Two settings, so the app behaves correctly for you: your **time zone** (so that daily limits, streaks and missions turn over at your own midnight) and your **chosen app language** (so that account email reaches you in it).

**b) Learning activity and progress**
- Your lesson progress, scores, accuracy history, streaks, points, tokens,
  daily missions, and which lessons you've completed.

**c) Your speech, and the transcript of it** *(the most important category —
see Section 3)*
- When you practise, your speech is captured and streamed for scoring, and a
  text transcript of what you said is generated.
- We store the transcript and the resulting pronunciation scores (overall and
  per word/sound). **On the mobile app we do not store the audio itself** —
  see Section 3.

**d) Sentences you write yourself** *(the "Sentences" feature — see Section 3a)*
- The text of each sentence you type or paste to practise, when you created it, which voice read it to you, and your scores for it.
- This is your own text, so it contains whatever you put in it. Please do not include sensitive information (such as health details, passwords, or other people's private information).
- If you ask to be told when a paid plan becomes available, we record that you asked, and when.

**e) Information collected automatically**
- Basic technical data needed to run and secure the service (for example
  IP address, device/browser type, and timestamps), collected by our
  hosting and backend providers through standard server logs.

We do **not** collect payment information, precise location, your contacts, or
anything from an Apple or Google account beyond what is listed in (a).

## 3. Voice data — how it works

Because SpeakZilla scores pronunciation, using it necessarily involves
recording your voice. Specifically:

- **Capture:** while you practise, the app captures your speech as you read
  the sentence aloud.
- **Processing:** your speech is streamed to **Microsoft Azure AI Speech**,
  which transcribes it and assesses pronunciation accuracy in real time and
  returns the scores. See Microsoft's terms for how they handle audio.
- **Storage:** we do **not** keep your recordings from the mobile app. What we
  store is the resulting transcript and the scores (overall, per word, and per
  sound), so you can review progress and so features like spaced repetition
  can resurface sounds you find difficult. Where a recording is stored (for
  example if you use SpeakZilla on the web), it is deleted automatically after
  90 days.
- **Hearing your own attempt:** so that you can play back what you just said,
  the mobile app holds your most recent attempt on your own device. It is not
  sent anywhere for this, and it is discarded when you record again or leave
  the sentence.

You control this data — see **Your rights** (Section 7). If you do not want
your voice recorded, you should not use the practice features, as they
cannot function without it.

## 3a. Your own sentences — how it works

The "Sentences" feature lets you practise a sentence you write yourself. Specifically:

- **Storage:** the sentence and your scores for it are stored with your account, so you can practise it again. You can delete any sentence at any time in the app; it is then removed from our database.
- **The voice that reads it to you:** to let you hear the sentence, its text is sent to a speech-generation service. Where the sentence is read in your coach's voice, the text is sent to **ElevenLabs**; otherwise it is sent to **Microsoft Azure AI Speech**. Only the text of the sentence is sent — not your name, email address or account identifier.
- **What ElevenLabs keeps:** ElevenLabs records each request in our account with them. We delete that record as soon as the audio has been generated, and we have opted out of ElevenLabs using it to train their models. ElevenLabs states that deleted items may remain in its backups for up to 30 days.
- **The audio:** the generated audio is saved on your own device only, so the sentence can be replayed. We do not store it on our servers.
- **Scoring:** when you say the sentence, your speech is scored exactly as described in Section 3, with your sentence as the reference text.

## 4. How we use your information

We use the data above to:
- provide the core service — recognise your speech and score pronunciation;
- track and show your progress, streaks, and achievements;
- personalise practice (e.g. resurfacing sounds you struggle with);
- operate, secure, debug, and improve the app;
- communicate with you about your account (e.g. password resets);
- tell you when a paid plan becomes available, if you asked us to.

We do **not** sell your personal data, and we do not use your voice
recordings to build or train speech models.

## 5. Who we share data with (service providers)

We share data with the following processors solely to run SpeakZilla. Each
processes data on our behalf under their own terms and security controls:

| Provider | Purpose | What it handles |
| --- | --- | --- |
| **Supabase** | Database, authentication, file storage | Account, progress and transcripts. Audio recordings only from the web app; the mobile app uploads none |
| **Microsoft Azure AI Speech** | Speech recognition + pronunciation assessment; text-to-speech | Audio clips and reference text, including the text of sentences you write yourself |
| **ElevenLabs** | Generating the coach's voice for sentences you write yourself | The text of the sentence only. No name, email address or account identifier |
| **Cloudflare** | Website hosting and delivery | Technical/log data (e.g. IP) |
| **Resend** | Delivering account email (confirming your address, password resets) | Your email address and the message |
| **Expo (EAS Update)** | Delivering app updates | Technical data (e.g. IP, app version, device platform) and an anonymous per-install identifier used to count update downloads. No account data |

Please review each provider's own privacy documentation:
- Supabase: https://supabase.com/privacy
- Microsoft Azure: https://privacy.microsoft.com
- ElevenLabs: https://elevenlabs.io/privacy-policy
- Cloudflare: https://www.cloudflare.com/privacypolicy/
- Resend: https://resend.com/legal/privacy-policy
- Expo: https://expo.dev/privacy

Apple and Google act as sign-in providers if you choose them. They are not our
processors, and their own privacy policies govern your account with them.

We may also disclose data if required by law, to protect our rights, or as
part of a business transfer (e.g. merger or acquisition), in which case we
will notify you where required.

## 6. Data retention

We keep your account and progress data for as long as your account is active.

**We do not store your voice recordings from the mobile app at all.** Your
speech is streamed for scoring and discarded; only the transcript and the
scores are kept. The copy of your most recent attempt that the app holds so
you can play it back stays on your device, and is discarded when you record
again or leave the sentence. Where a recording is stored — currently only if you practise on the web —
it is deleted automatically after **90 days**.

**Sentences you write yourself** are kept until you delete them or your account. The copy of the text that ElevenLabs records when it generates the coach's voice is deleted by us immediately afterwards; ElevenLabs states that it may remain in its backups for up to 30 days. The generated audio exists only on your device and is removed when you delete the sentence or the app.

When you delete your account, we delete or anonymise your personal data within
**30 days**, except where we must retain some data to comply with legal
obligations.


## 7. Your rights and choices

Depending on where you live (e.g. under GDPR or CCPA/CPRA), you may have
the right to:
- **access** the personal data we hold about you;
- **correct** inaccurate data;
- **delete** your data ("right to be forgotten");
- **export** a copy of your data (portability);
- **object to or restrict** certain processing;
- **withdraw consent** where processing is based on consent.

To exercise any of these, use the in-app **Delete account** option in your profile, or email
us at **support@speakzilla.app**. We will respond within the timeframe required by
applicable law. You will not be discriminated against for exercising these
rights.

## 8. Data security

We use industry-standard measures to protect your data, including
encryption in transit, access controls that restrict each user's data to
that user (row-level security), and reputable infrastructure providers. No
method of transmission or storage is 100% secure, so we cannot guarantee
absolute security.

## 9. International data transfers

SpeakZilla is operated from **Canada**. Your account, progress and transcripts
are stored by Supabase in the **United States**. Your speech is processed by
Microsoft Azure AI Speech in **Canada** (the Canada Central region). The text of sentences you write yourself is sent to ElevenLabs in the **United States** when your coach's voice reads them. Microsoft,
ElevenLabs, Resend, Expo and Cloudflare are United States companies; Cloudflare serves the website from the
data centre nearest to you. Where required, we rely on appropriate safeguards
(such as Standard Contractual Clauses and each provider's data processing
agreement) for these transfers.

## 10. Children's privacy

SpeakZilla is not directed to children under **16**, and we do not knowingly collect personal data from them.
If you believe a child has provided us data, contact us and we will delete
it.

## 11. Changes to this policy

We may update this policy from time to time. If we make material changes,
we will notify you (e.g. by email or an in-app notice) and update the
"Last updated" date above.

## 12. Contact

Questions or requests about this policy or your data:
**Andrew Kim** — **support@speakzilla.app** — 774 Solarium Ave, Ottawa K4M 0R7.
