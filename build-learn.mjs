// node build-learn.mjs
//
// The pronunciation-video pages (Andrew, 2026-11-16: "start with the website pages from the Shorts"; mockup
// https://claude.ai/artifact/KHHJ5pvaVLshvw4CviQxq8). One page per PUBLIC Short in all five languages, plus a
// list page per language:
//   /learn/<slug>/          /ko/learn/<slug>/   /ja/…   /zh-hans/…   /zh-hant/…
//   /learn/                 (grouped: vowels, consonants, British vs American, words people get wrong, rhythm)
//
// Everything comes from the app repository (../speakzilla-mobile, or SZ_MOBILE), so a page can't drift from its
// Short: the title and explanation from store/youtube/i18n/<lang>.json (the same text as the YouTube
// descriptions), what the coaches say from the scripts in DESCRIPTIONS.md / BATCH2–9.md, the poster from the
// Short's hook card. Same rule as the app: what the learner hears or says stays English (the coaches' lines, the
// "try it" sentence, lesson names); the explaining is translated.
//
// Which Shorts: learn/videos.json maps episode → YouTube id (from `node scripts/youtube-i18n.mjs plan` in the
// app repo, read-only). A Short gets pages only once YouTube's public oEmbed answers for it, i.e. the day it
// goes public; scheduled ones are checked again on the next build. So: after Shorts go public, run this again.
//
// Privacy: the video is NOT embedded on load. The poster is our own hook card; tapping it swaps in
// youtube-nocookie.com, so nothing from Google loads until a visitor chooses to play.
//
// Em dashes are turned into commas (titles: colons): these pages speak in Andrew's voice, and he removes them.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const MOBILE = path.resolve(root, process.env.SZ_MOBILE ?? '../speakzilla-mobile')
const YT = path.join(MOBILE, 'store/youtube')
const SITE = 'https://speakzilla.app'
const VIDEOS = path.join(root, 'learn/videos.json')
const IMG_DIR = path.join(root, 'assets/learn')

const read = (p) => fs.readFileSync(p, 'utf8')
const json = (p) => JSON.parse(read(p))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
// *word* in the descriptions is emphasis.
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>')
const noDashTitle = (s) => s.replace(/\s*[—–]\s*/g, ': ')
const noDash = (s) => s.replace(/\s+[—–]\s+/g, ', ').replace(/[—–]/g, ', ')

// ── Languages ────────────────────────────────────────────────────────────────────────────────────────────
const L = {
  en: {
    html: 'en', dir: '', name: 'English', menu: 'Language',
    store: 'https://apps.apple.com/app/id6805255043', appleW: 156,
    appleAlt: 'Download on the App Store', playAlt: 'Get it on Google Play',
    nav: { videos: 'Videos', support: 'Support' },
    foot: { support: 'Support', privacy: 'Privacy policy', social: 'Short lessons:' },
    root: 'Pronunciation videos',
    lede: "Short videos from SpeakZilla's four coaches. Each one fixes one sound or one word, in under a minute.",
    with: (names) => `With ${list(names, 'and')}, in under a minute.`,
    why: "What's going on", say: 'What the coaches say', sayNote: '',
    tryIt: 'Say it out loud', more: 'More videos', all: 'See all videos ›', play: 'Play the video',
    caption: 'Tap to play. The video comes from our YouTube channel.',
    app: {
      map: (s) => `In SpeakZilla, open the <b>Sound Map</b> and tap ${s}. The drill scores every word as you say it, free.`,
      lesson: (n) => `In SpeakZilla, the lesson <b>“${n}”</b> practises exactly this, with every word scored as you say it.`,
      general: 'Practise it out loud in SpeakZilla. Every word is scored as you say it, free.',
    },
    cats: { vowels: 'Vowels', consonants: 'Consonants', bva: 'British vs American', words: 'Words people get wrong', rhythm: 'Stress and rhythm' },
    or: 'or', count: (n) => `${n} videos`,
    home: { title: 'Fix one sound in a minute', lede: 'Free videos from the four coaches, each one explained in your language.' }, top: 'Back to top',
  },
  ko: {
    html: 'ko', dir: 'ko', name: '한국어', menu: '언어',
    store: 'https://apps.apple.com/kr/app/id6805255043', appleW: 169,
    appleAlt: 'App Store에서 다운로드', playAlt: 'Google Play에서 다운로드',
    nav: { videos: '영상', support: '도움말' },
    foot: { support: '도움말', privacy: '개인정보 처리방침', social: '짧은 레슨 영상 (영어):' },
    root: '발음 영상',
    lede: 'SpeakZilla의 네 코치가 만든 짧은 영상이에요. 하나에 소리 하나, 단어 하나를 1분 안에 바로잡아요.',
    // 와 after a vowel, 과 after a consonant: of the four names only 다니엘 (Daniel) ends in one.
    with: (names) => `${names.join(', ')}${names[names.length - 1] === 'Daniel' ? '과' : '와'} 함께, 1분 안에.`,
    why: '왜 그럴까요', say: '코치들이 하는 말', sayNote: '영상에서 들리는 그대로, 영어로 적었어요.',
    tryIt: '소리 내어 말해 보세요', more: '더 많은 영상', all: '전체 영상 보기 ›', play: '영상 재생',
    caption: '누르면 재생돼요. 영상은 YouTube 채널에서 불러와요.',
    app: {
      map: (s) => `SpeakZilla에서 <b>발음 맵</b>을 열고 ${s}를 누르세요. 말하는 단어마다 바로 채점해 줘요. 무료예요.`,
      lesson: (n) => `SpeakZilla의 <b>“${n}”</b> 레슨에서 바로 이걸 연습해요. 말하는 단어마다 바로 채점해 줘요.`,
      general: 'SpeakZilla에서 소리 내어 연습해 보세요. 말하는 단어마다 바로 채점해 줘요. 무료예요.',
    },
    cats: { vowels: '모음', consonants: '자음', bva: '영국식 vs 미국식', words: '자주 틀리는 단어', rhythm: '강세와 리듬' },
    or: '또는', count: (n) => `영상 ${n}개`,
    home: { title: '1분에 소리 하나 고치기', lede: '네 코치의 무료 영상이에요. 설명은 한국어로 볼 수 있어요.' }, top: '맨 위로',
  },
  ja: {
    html: 'ja', dir: 'ja', name: '日本語', menu: '言語',
    store: 'https://apps.apple.com/jp/app/id6805255043', appleW: 142,
    appleAlt: 'App Storeでダウンロード', playAlt: 'Google Playで入手',
    nav: { videos: '動画', support: 'サポート' },
    foot: { support: 'サポート', privacy: 'プライバシーポリシー', social: 'ショート動画（英語）：' },
    root: '発音動画',
    lede: 'SpeakZillaの4人のコーチによるショート動画です。1本で音ひとつ、単語ひとつを1分以内に直します。',
    with: (names) => `${names.join('と')}が1分以内で解説。`,
    why: 'なぜそうなるの', say: 'コーチのセリフ', sayNote: '動画で聞こえるとおり、英語で書いています。',
    tryIt: '声に出して言ってみよう', more: 'ほかの動画', all: 'すべての動画を見る ›', play: '動画を再生',
    caption: 'タップで再生。動画はYouTubeチャンネルから読み込みます。',
    app: {
      map: (s) => `SpeakZillaで<b>発音マップ</b>を開き、${s}をタップ。言った単語をひとつずつその場で採点します。無料です。`,
      lesson: (n) => `SpeakZillaのレッスン<b>「${n}」</b>で、まさにこれを練習できます。言った単語をひとつずつ採点します。`,
      general: 'SpeakZillaで声に出して練習しましょう。言った単語をひとつずつその場で採点します。無料です。',
    },
    cats: { vowels: '母音', consonants: '子音', bva: 'イギリス英語とアメリカ英語', words: '間違えやすい単語', rhythm: '強勢とリズム' },
    or: 'または', count: (n) => `${n}本`,
    home: { title: '1分で音をひとつ直す', lede: '4人のコーチによる無料の動画です。解説は日本語で読めます。' }, top: 'ページの先頭へ',
  },
  'zh-Hans': {
    html: 'zh-Hans', dir: 'zh-hans', name: '简体中文', menu: '语言',
    store: 'https://apps.apple.com/app/id6805255043', appleW: 142,
    appleAlt: '在 App Store 下载', playAlt: '在 Google Play 下载',
    nav: { videos: '视频', support: '帮助' },
    foot: { support: '帮助', privacy: '隐私政策', social: '短视频课程（英文）：' },
    root: '发音视频',
    lede: 'SpeakZilla 四位教练的短视频。每个视频用不到一分钟，纠正一个音或一个词。',
    with: (names) => `${names.join('和')}，不到一分钟讲清楚。`,
    why: '为什么会这样', say: '教练说了什么', sayNote: '照视频里听到的原样，用英文写出来。',
    tryIt: '大声说出来', more: '更多视频', all: '查看全部视频 ›', play: '播放视频',
    caption: '点击播放。视频来自我们的 YouTube 频道。',
    app: {
      map: (s) => `在 SpeakZilla 打开<b>发音地图</b>，点 ${s}。你说出的每个单词都会马上评分，免费。`,
      lesson: (n) => `SpeakZilla 的<b>“${n}”</b>课程专门练这个，你说出的每个单词都会马上评分。`,
      general: '在 SpeakZilla 大声练习，你说出的每个单词都会马上评分，免费。',
    },
    cats: { vowels: '元音', consonants: '辅音', bva: '英式与美式', words: '容易读错的词', rhythm: '重音与节奏' },
    or: '或', count: (n) => `${n} 个视频`,
    home: { title: '一分钟纠正一个音', lede: '四位教练的免费视频，每个都有中文讲解。' }, top: '回到顶部',
  },
  'zh-Hant': {
    html: 'zh-Hant', dir: 'zh-hant', name: '繁體中文', menu: '語言',
    store: 'https://apps.apple.com/tw/app/id6805255043', appleW: 142,
    appleAlt: '在 App Store 下載', playAlt: '在 Google Play 下載',
    nav: { videos: '影片', support: '支援' },
    foot: { support: '支援', privacy: '隱私權政策', social: '短片課程（英文）：' },
    root: '發音影片',
    lede: 'SpeakZilla 四位教練的短片。每支影片用不到一分鐘，糾正一個音或一個字。',
    with: (names) => `${names.join('和')}，不到一分鐘講清楚。`,
    why: '為什麼會這樣', say: '教練說了什麼', sayNote: '照影片裡聽到的原樣，用英文寫出來。',
    tryIt: '大聲唸出來', more: '更多影片', all: '看全部影片 ›', play: '播放影片',
    caption: '點一下就播放。影片來自我們的 YouTube 頻道。',
    app: {
      map: (s) => `在 SpeakZilla 打開<b>發音地圖</b>，點 ${s}。你唸出的每個單字都會馬上評分，免費。`,
      lesson: (n) => `SpeakZilla 的<b>「${n}」</b>課程專門練這個，你唸出的每個單字都會馬上評分。`,
      general: '在 SpeakZilla 大聲練習，你唸出的每個單字都會馬上評分，免費。',
    },
    cats: { vowels: '母音', consonants: '子音', bva: '英式與美式', words: '容易唸錯的字', rhythm: '重音與節奏' },
    or: '或', count: (n) => `${n} 支影片`,
    home: { title: '一分鐘糾正一個音', lede: '四位教練的免費影片，每支都有中文講解。' }, top: '回到頂端',
  },
}
const LANGS = Object.keys(L)
function list(xs, and) { return xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${and} ${xs[xs.length - 1]}` }
const CAT_ORDER = ['vowels', 'consonants', 'bva', 'words', 'rhythm']
const COACH = {
  Alex: { img: 'alex', color: '#0a8077', ring: '#d3f4f1' },
  Sofia: { img: 'sofia', color: '#c2410c', ring: '#ffe3d6' },
  Daniel: { img: 'daniel', color: '#1d4ed8', ring: '#dbe7ff' },
  Fiona: { img: 'fiona', color: '#4d7c0f', ring: '#e4f4cf' },
}

// ── The Shorts ───────────────────────────────────────────────────────────────────────────────────────────
const source = Object.fromEntries(json(path.join(YT, 'i18n/source.json')).map((e) => [e.n, e]))
const tr = { en: source }
for (const l of LANGS.slice(1)) tr[l] = json(path.join(YT, `i18n/${l}.json`))

// Script lines and the meta lines (Sound / Pattern / App) per episode.
const scripts = {}, meta = {}
for (const f of ['DESCRIPTIONS.md', ...[2, 3, 4, 5, 6, 7, 8, 9].map((i) => `BATCH${i}.md`)]) {
  const text = read(path.join(YT, f))
  for (const m of text.matchAll(/^## (\d+) — .*$([\s\S]*?)(?=^## \d+ — |(?![\s\S]))/gm)) {
    const n = +m[1], body = m[2]
    const g = (k) => body.match(new RegExp(`^- \\*\\*${k}:\\*\\* (.+)$`, 'm'))?.[1] ?? ''
    meta[n] = { sound: g('Sound'), pattern: g('Pattern'), app: g('App'), hook: g('Hook') }
    const sc = body.match(/^\*\*Script\*\*[^\n]*\n([\s\S]*?)(?=\n[ \t]*\r?\n|\n\*\*|(?![\s\S]))/m)
    if (!sc) continue
    scripts[n] = [...sc[1].matchAll(/^- \*\*(Alex|Sofia|Daniel|Fiona):\*\* "(.+?)"\s*(?:\*\(.*\)\*)?\s*$/gm)]
      .map(([, who, t]) => ({ who, text: noDash(t.replace(/\[[^\]]*\]\s*/g, '').replace(/\*([^*]+)\*/g, '$1').trim()) }))
  }
}

function category(n) {
  const e = source[n], m = meta[n] ?? {}
  const OVERRIDE = { 3: 'consonants', 8: 'rhythm', 10: 'consonants', 14: 'rhythm', 39: 'words', 122: 'words' }
  if (OVERRIDE[n]) return OVERRIDE[n]
  if (/BritishVsAmerican/.test(e.tags)) return 'bva'
  if (/WordStress|SpeakingPractice|EnglishGrammar/.test(e.tags) || /reduction|linking|assimilation|stress|weak form|-s.? ending/i.test(m.pattern)) return 'rhythm'
  if (/silent|spelling|phantom|forgotten|swallowed|jumps|letters?|wrong/i.test(m.pattern + ' ' + e.title)) return 'words'
  if (/[iɪeɛæɑɒɔʊuʌəɜ]ː?\//.test(m.sound) && !/ʃ|tʃ|dʒ|θ|ð|ŋ/.test(m.sound)) return 'vowels'
  return 'consonants'
}

function slugOf(title) {
  const head = title.split(/[?:(]|→|\s[—–]\s/)[0].replace(/[’']/g, '')
  return head.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'video'
}

// The app pointer, from the batch notes' "App:" line.
function appLine(n, lang) {
  const a = meta[n]?.app ?? ''
  const A = L[lang].app
  if (/^Sound Map/.test(a)) {
    const sounds = [...a.matchAll(/`(\/[^`]+\/)`/g)].map((x) => `<b>${esc(x[1])}</b>`)
    if (sounds.length) return A.map(sounds.join(` ${L[lang].or} `))
  }
  const lesson = a.match(/lesson `[^`]+` "([^"]+)"/)
  if (lesson) return A.lesson(esc(lesson[1]))
  return A.general
}

// What to say out loud: the script's own "Try it" sentence (batch 1), else, for a sound pair, the pair from
// the hook card (SHEEP / SHIP: two real words, both worth saying). Never the hook's other pairs, whose orange
// side is often the wrong version ('ERB, eXpresso).
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
function tryLine(n) {
  for (const s of [...(scripts[n] ?? [])].reverse()) {
    const m = s.text.match(/Try it[:.!]?\s*(.+)$/i)
    if (m && m[1].trim()) return cap(m[1].trim())
  }
  const c = category(n)
  if (c !== 'vowels' && c !== 'consonants') return null
  const h = (meta[n]?.hook ?? '').replace(/^.*?—\s*/, '').match(/^([A-Z]+) \(white\) \/ ([A-Z]+) \(orange\)/)
  return h ? `${h[1].toLowerCase()} · ${h[2].toLowerCase()}` : null
}

// ── Which are public ─────────────────────────────────────────────────────────────────────────────────────
const videos = json(VIDEOS)
for (const [n, v] of Object.entries(videos)) {
  if (v.public || !source[n]) continue
  try {
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${v.id}`)}`)
    if (r.ok) v.public = true
  } catch { /* offline: try again next build */ }
}
fs.writeFileSync(VIDEOS, JSON.stringify(videos, null, 1) + '\n')
const eps = Object.keys(videos).map(Number).filter((n) => videos[n].public && source[n]).sort((a, b) => a - b)

// Slugs, unique.
const slug = {}, used = new Set()
for (const n of eps) {
  let s = slugOf(source[n].title)
  if (used.has(s)) s = `${s}-${n}`
  used.add(s); slug[n] = s
}

// Posters: the hook card, 540 wide JPEG.
fs.mkdirSync(IMG_DIR, { recursive: true })
const hookPng = (n) => [path.join(YT, `hook-${String(n).padStart(2, '0')}.png`), ...[2, 3, 4, 5, 6, 7, 8, 9].map((b) => path.join(YT, `batch${b}/hook-${n}.png`))].find((p) => fs.existsSync(p))
const toMake = eps.filter((n) => !fs.existsSync(path.join(IMG_DIR, `${n}.jpg`)) && hookPng(n))
if (toMake.length) {
  const py = `import sys
from PIL import Image
for a in sys.argv[1:]:
    src, dst = a.split('|')
    im = Image.open(src).convert('RGB'); w = 540; im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(dst, 'JPEG', quality=82, optimize=True, progressive=True)`
  execFileSync('python', ['-c', py, ...toMake.map((n) => `${hookPng(n)}|${path.join(IMG_DIR, `${n}.jpg`)}`)], { stdio: 'inherit' })
}

// ── Page parts ───────────────────────────────────────────────────────────────────────────────────────────
const urlOf = (lang, tail = '') => `/${L[lang].dir ? L[lang].dir + '/' : ''}${tail}`
const GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>'

const CSS = `
  :root{--ink:#0f0e17;--night:#0e2229;--paper:#f2f8f8;--muted:#5c5b68;--accent:#ff6b35;--teal:#00c9a7;--deep:#0a8077;--border:#e1eaea}
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 system-ui,-apple-system,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic","Hiragino Sans","PingFang SC","PingFang TC","Microsoft YaHei",sans-serif}
  .wrap{max-width:960px;margin:0 auto;padding:0 20px}
  h1,h2,h3{font-family:Fredoka,system-ui,sans-serif;font-weight:700;line-height:1.2;margin:0}
  :lang(ko) h1,:lang(ko) h2,:lang(ja) h1,:lang(ja) h2,:lang(zh-Hans) h1,:lang(zh-Hans) h2,:lang(zh-Hant) h1,:lang(zh-Hant) h2{font-family:system-ui,sans-serif}
  a{color:#c2410c}
  header{background:var(--night);padding:14px 0}
  .bar{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none}
  .brand img{width:32px;height:32px;border-radius:9px}
  .brand span{font-family:Fredoka,sans-serif;font-size:19px;font-weight:700}
  .bar nav{display:flex;align-items:center;gap:18px}
  .bar a.nav{color:rgba(255,255,255,.7);text-decoration:none;font-size:14px;white-space:nowrap}
  .bar a.nav:hover{color:#fff}
  .bar a.nav.on{color:#fff;font-weight:600;border-bottom:2px solid var(--teal);padding-bottom:2px}
  .bar a.nav.prem{color:#fff;font-weight:600}
  .bar a.nav.prem::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent);margin-right:6px;vertical-align:2px}
  .lang-menu{position:relative}
  .lang-menu summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:5px;color:rgba(255,255,255,.7);font-size:14px;white-space:nowrap}
  .lang-menu summary::-webkit-details-marker{display:none}
  .lang-menu summary:hover,.lang-menu[open] summary{color:#fff}
  .lang-menu summary svg{width:15px;height:15px;flex:none}
  .lang-list{position:absolute;right:0;top:calc(100% + 12px);background:#17222a;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:6px;min-width:150px;box-shadow:0 14px 40px rgba(0,0,0,.45);z-index:20}
  .lang-list a{display:block;padding:8px 12px;border-radius:8px;color:rgba(255,255,255,.8);text-decoration:none;font-size:14px;white-space:nowrap}
  .lang-list a:hover{background:rgba(255,255,255,.08);color:#fff}
  .lang-list a[aria-current]{color:#fff;font-weight:600}
  .lang-list a[aria-current]::after{content:" ✓";color:var(--accent)}
  @media (max-width:480px){.bar nav{gap:12px}.bar a.nav,.lang-menu summary{font-size:13px}.brand span{display:none}}
  main{padding:26px 0 56px}
  .crumbs{font-size:14px;color:var(--muted)}
  .crumbs a{color:var(--deep);text-decoration:none;font-weight:600}
  .crumbs span{margin:0 6px}
  h1{font-size:clamp(28px,5vw,44px);margin:12px 0 8px}
  .sub{margin:0;color:var(--muted);font-size:17px}
  .top{display:flex;flex-wrap:wrap;gap:40px;margin-top:30px;align-items:flex-start}
  figure.video{margin:0 auto;flex:0 0 300px;max-width:100%}
  .poster{display:block;position:relative;width:300px;max-width:100%;aspect-ratio:9/16;border-radius:22px;overflow:hidden;background:var(--night);box-shadow:0 18px 40px rgba(14,34,41,.25);border:0;padding:0;cursor:pointer}
  .poster img,.poster iframe{width:100%;height:100%;max-height:none;object-fit:cover;display:block;border:0}
  .poster .go{position:absolute;left:50%;bottom:16%;width:72px;height:72px;margin:0 0 0 -36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.35)}
  figcaption{font-size:13px;color:var(--muted);margin-top:10px;text-align:center}
  .text{flex:999 1 440px;min-width:0}
  .text h2,.more h2{font-size:24px;margin:0 0 10px}
  .text section+section{margin-top:30px}
  .text p{margin:0 0 12px}
  .note{font-size:14px;color:var(--muted);margin:-4px 0 14px!important}
  .lines{display:flex;flex-direction:column;gap:14px}
  .line{display:flex;gap:12px;align-items:flex-start}
  .line img{width:40px;height:40px;border-radius:50%;flex:none;object-fit:cover}
  .line p{margin:0}
  .line b{display:block}
  .try{margin-top:44px;background:var(--night);color:#fff;border-radius:22px;padding:30px}
  .try h2{font-size:26px}
  .try q{display:block;quotes:none;font-family:Fredoka,system-ui,sans-serif;font-size:clamp(20px,3.4vw,26px);font-weight:600;line-height:1.35;margin:14px 0 0}
  .try .app{margin:22px 0 0;padding-top:20px;border-top:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.85)}
  .try .app b{color:#fff}
  .badges{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}
  .more{margin-top:44px}
  .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px}
  @media (max-width:520px){.cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.card span{padding:8px 10px 12px;font-size:14px}}
  .card{display:block;text-decoration:none;color:var(--ink);background:#fff;border:1px solid var(--border);border-radius:18px;overflow:hidden}
  .card:hover{border-color:#b9d6d6}
  .card img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;object-position:center 52%;display:block}
  .card span{display:block;padding:10px 14px 14px;font-weight:600;line-height:1.35}
  .card small{display:block;font-size:12px;font-weight:700;color:var(--deep);text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px}
  .card.all{display:flex;align-items:center;justify-content:center;background:#d3f4f1;color:var(--night);font-weight:700;min-height:120px;text-align:center;padding:20px}
  .cat{margin-top:40px}
  .cat h2{font-size:26px;margin-bottom:14px}
  .cat h2 small{font-family:system-ui,sans-serif;font-size:14px;font-weight:600;color:var(--muted);margin-left:8px}
  .lede{color:var(--muted);font-size:18px;margin:0;text-wrap:pretty}
  footer{border-top:1px solid var(--border);padding:28px 0 44px;color:var(--muted);font-size:14px}
  footer .row{display:flex;gap:18px;flex-wrap:wrap;justify-content:space-between}
  footer a{color:var(--muted)}
  footer .social{margin-top:12px}
  .totop{position:fixed;right:18px;bottom:18px;width:48px;height:48px;border-radius:50%;background:var(--night);border:2px solid var(--teal);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 22px rgba(14,34,41,.3);opacity:0;pointer-events:none;transform:translateY(8px);transition:opacity .2s,transform .2s;z-index:30}
  .totop.on{opacity:1;pointer-events:auto;transform:none}
  @media (prefers-reduced-motion:reduce){.totop{transition:none}}
`

const TOP_JS = "(function(){var b=document.querySelector('.totop');if(!b)return;function f(){b.classList.toggle('on',scrollY>innerHeight)}addEventListener('scroll',f,{passive:true});f();b.addEventListener('click',function(e){e.preventDefault();scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})})})()"
const totop = (lang) => `<a class="totop" href="#" aria-label="${L[lang].top}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V6M6 11l6-6 6 6"/></svg></a>`
const PLAY_JS = `document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button.poster');if(!b)return;var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.id+'?autoplay=1&playsinline=1&rel=0';f.title=b.getAttribute('aria-label');f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.setAttribute('allowfullscreen','');b.replaceWith(Object.assign(document.createElement('div'),{className:'poster'}));document.querySelector('div.poster').appendChild(f)});`

function head(lang, { title, desc, tail, image }) {
  const alts = LANGS.map((l) => `<link rel="alternate" hreflang="${L[l].html}" href="${SITE}${urlOf(l, tail)}">`).join('\n')
  return `<!doctype html>
<html lang="${L[lang].html}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${urlOf(lang, tail)}">
${alts}
<link rel="alternate" hreflang="x-default" href="${SITE}${urlOf('en', tail)}">
<link rel="icon" href="/assets/icon.png">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}${image ?? '/assets/icon.png'}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>`
}

function header(lang, tail) {
  const t = L[lang]
  const menu = LANGS.map((l) => `<a href="${urlOf(l, tail)}" lang="${L[l].html}"${l === lang ? ' aria-current="page"' : ''}>${L[l].name}</a>`).join('\n          ')
  return `<header>
  <div class="wrap bar">
    <a class="brand" href="${urlOf(lang)}"><img src="/assets/icon.png" alt=""><span>SpeakZilla</span></a>
    <nav>
      <a class="nav on" href="${urlOf(lang, 'learn/')}">${t.nav.videos}</a>
      <a class="nav prem" href="${urlOf(lang)}#premium">Premium</a>
      <a class="nav" href="${urlOf(lang, 'support.html')}">${t.nav.support}</a>
      <details class="lang-menu">
        <summary aria-label="${t.menu}: ${t.name}">${GLOBE}${t.name}</summary>
        <div class="lang-list">
          ${menu}
        </div>
      </details>
    </nav>
  </div>
</header>`
}

function footer(lang) {
  const t = L[lang]
  return `<footer>
  <div class="wrap row">
    <div>© 2026 SpeakZilla</div>
    <div>
      <a href="${urlOf(lang, 'learn/')}">${t.nav.videos}</a> &nbsp;·&nbsp;
      <a href="${urlOf(lang, 'support.html')}">${t.foot.support}</a> &nbsp;·&nbsp;
      <a href="${urlOf(lang, 'privacy.html')}">${t.foot.privacy}</a> &nbsp;·&nbsp;
      <a href="mailto:support@speakzilla.app">support@speakzilla.app</a>
    </div>
  </div>
  <div class="wrap social">
    ${t.foot.social} <a href="https://www.youtube.com/@speakzilla" target="_blank" rel="noopener">YouTube</a> &nbsp;·&nbsp; <a href="https://www.tiktok.com/@speakzilla.app" target="_blank" rel="noopener">TikTok</a> &nbsp;·&nbsp; <a href="https://www.instagram.com/speakzilla/" target="_blank" rel="noopener">Instagram</a>
  </div>
</footer>`
}

const badges = (lang) => {
  const t = L[lang], b = lang === 'en' ? 'en' : t.dir
  return `<div class="badges">
        <a class="store" href="${t.store}"><img src="/assets/badges/app-store-${b}.svg" width="${t.appleW}" height="52" alt="${esc(t.appleAlt)}"></a>
        <a class="store" href="https://play.google.com/store/apps/details?id=com.speakzilla.app"><img src="/assets/badges/google-play-${b}.png" width="175" height="52" alt="${esc(t.playAlt)}"></a>
      </div>`
}

const titleOf = (n, lang) => noDashTitle((tr[lang][n] ?? source[n]).title)
const card = (n, lang) => `<a class="card" href="${urlOf(lang, `learn/${slug[n]}/`)}"><img src="/assets/learn/${n}.jpg" alt="" loading="lazy" width="540" height="405"><span><small>${L[lang].cats[category(n)]}</small>${esc(titleOf(n, lang))}</span></a>`

function shortPage(n, lang) {
  const t = L[lang], e = tr[lang][n] ?? source[n]
  const title = titleOf(n, lang)
  const paras = (e.paras ?? source[n].paras).map(noDash)
  const lines = scripts[n] ?? []
  const names = [...new Set(lines.map((l) => l.who))]
  const tail = `learn/${slug[n]}/`
  const cat = category(n)
  const same = eps.filter((m) => m !== n && category(m) === cat)
  const after = same.filter((m) => m > n), before = same.filter((m) => m < n).reverse()
  const related = [...after, ...before].slice(0, 2)
  const tryIt = tryLine(n)
  const desc = paras[0] ?? title
  return `${head(lang, { title: `${title} | SpeakZilla`, desc, tail, image: `/assets/learn/${n}.jpg` })}
${header(lang, tail)}
<main class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${urlOf(lang, 'learn/')}">${t.root}</a><span aria-hidden="true">›</span><a href="${urlOf(lang, 'learn/')}#${cat}">${t.cats[cat]}</a></nav>
  <h1>${esc(title)}</h1>
  ${names.length ? `<p class="sub">${esc(t.with(names))}</p>` : ''}
  <div class="top">
    <figure class="video">
      <button class="poster" type="button" data-id="${videos[n].id}" aria-label="${esc(t.play)}: ${esc(title)}">
        <img src="/assets/learn/${n}.jpg" alt="" width="540" height="960">
        <span class="go"><svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#fff"/></svg></span>
      </button>
      <figcaption>${t.caption}</figcaption>
    </figure>
    <div class="text">
      <section>
        <h2>${t.why}</h2>
        ${paras.map((p) => `<p>${rich(p)}</p>`).join('\n        ')}
      </section>
      ${lines.length ? `<section>
        <h2>${t.say}</h2>
        ${t.sayNote ? `<p class="note">${t.sayNote}</p>` : ''}
        <div class="lines" lang="en">
          ${lines.map((l) => `<div class="line"><img src="/assets/${COACH[l.who].img}.png" alt="" style="background:${COACH[l.who].ring}"><p><b style="color:${COACH[l.who].color}">${l.who}</b>${esc(l.text)}</p></div>`).join('\n          ')}
        </div>
      </section>` : ''}
    </div>
  </div>
  <section class="try">
    <h2>${t.tryIt}</h2>
    ${tryIt ? `<q lang="en">${esc(tryIt)}</q>` : ''}
    <p class="app">${appLine(n, lang)}</p>
    ${badges(lang)}
  </section>
  <section class="more">
    <h2>${t.more}</h2>
    <div class="cards">
      ${related.map((m) => card(m, lang)).join('\n      ')}
      <a class="card all" href="${urlOf(lang, 'learn/')}">${t.all}</a>
    </div>
  </section>
</main>
${footer(lang)}
${totop(lang)}
<script>${PLAY_JS}${TOP_JS}</script>
</body>
</html>
`
}

function indexPage(lang) {
  const t = L[lang]
  const groups = CAT_ORDER.map((c) => [c, eps.filter((n) => category(n) === c)]).filter(([, ns]) => ns.length)
  return `${head(lang, { title: `${t.root} | SpeakZilla`, desc: t.lede, tail: 'learn/' })}
${header(lang, 'learn/')}
<main class="wrap">
  <h1>${t.root}</h1>
  <p class="lede">${t.lede}</p>
  ${groups.map(([c, ns]) => `<section class="cat" id="${c}">
    <h2>${t.cats[c]}<small>${t.count(ns.length)}</small></h2>
    <div class="cards">
      ${ns.map((n) => card(n, lang)).join('\n      ')}
    </div>
  </section>`).join('\n  ')}
</main>
${footer(lang)}
${totop(lang)}
<script>${TOP_JS}</script>
</body>
</html>
`
}

// Posting dates from SCHEDULE.md ("| Thu Sep 17 | 59 |"): Sep–Dec are 2026, Jan–Aug 2027. The episode numbers
// are not the posting order (the schedule was reshuffled), so "newest" goes by these.
const MON = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
const postedOn = {}
for (const m of read(path.join(YT, 'SCHEDULE.md')).matchAll(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d+) \| (\d+) \|/g)) {
  const mo = MON[m[1]]
  const at = Date.UTC(mo >= 8 ? 2026 : 2027, mo, +m[2])
  postedOn[+m[3]] = Math.min(postedOn[+m[3]] ?? Infinity, at)   // a Short listed twice: its first posting
}

// The home page's videos section, in each language's index.html (between the markers): the newest three.
function homeVideos(lang) {
  const t = L[lang], newest = [...eps].sort((a, b) => (postedOn[b] ?? 0) - (postedOn[a] ?? 0) || b - a).slice(0, 3)
  const card = (n) => `<a class="vcard" href="${urlOf(lang, `learn/${slug[n]}/`)}"><img src="/assets/learn/${n}.jpg" alt="" loading="lazy" width="540" height="405"><span><small>${t.cats[category(n)]}</small>${esc(titleOf(n, lang))}</span></a>`
  return `  <div class="vhead">
    <div>
      <h2>${t.home.title}</h2>
      <p>${t.home.lede}</p>
    </div>
    <a class="vall" href="${urlOf(lang, 'learn/')}">${t.all}</a>
  </div>
  <div class="vcards">
    ${newest.map(card).join('\n    ')}
  </div>`
}

// The translated home, support and privacy pages first: they are copies of the English, and the videos
// section below is filled into each copy afterwards.
execFileSync('node', [path.join(root, 'build-i18n.mjs')], { stdio: 'inherit' })

// ── Write ────────────────────────────────────────────────────────────────────────────────────────────────
let pages = 0
for (const lang of LANGS) {
  const base = path.join(root, L[lang].dir, 'learn')
  fs.rmSync(base, { recursive: true, force: true, ...(lang === 'en' ? {} : {}) })
}
// /learn/ holds videos.json: rebuild the English pages around it rather than deleting the folder.
fs.mkdirSync(path.join(root, 'learn'), { recursive: true })
fs.writeFileSync(VIDEOS, JSON.stringify(videos, null, 1) + '\n')
for (const lang of LANGS) {
  const base = path.join(root, L[lang].dir, 'learn')
  fs.mkdirSync(base, { recursive: true })
  fs.writeFileSync(path.join(base, 'index.html'), indexPage(lang)); pages++
  for (const n of eps) {
    fs.mkdirSync(path.join(base, slug[n]), { recursive: true })
    fs.writeFileSync(path.join(base, slug[n], 'index.html'), shortPage(n, lang)); pages++
  }
}

for (const lang of LANGS) {
  const f = path.join(root, L[lang].dir, 'index.html')
  const html = read(f)
  const re = /(<!-- videos:start[^>]*-->)[\s\S]*?(<!-- videos:end -->)/
  if (!re.test(html)) throw new Error(`${f}: the videos markers are missing`)
  fs.writeFileSync(f, html.replace(re, (_, a, b) => `${a}\n${homeVideos(lang)}\n${b}`))
}

// Sitemap: replace the learn block (between the markers), keep the rest.
const SM = path.join(root, 'sitemap.xml')
const today = new Date().toISOString().slice(0, 10)
const entry = (tail) => LANGS.map((lang) => `  <url>
    <loc>${SITE}${urlOf(lang, tail)}</loc>
    <lastmod>${today}</lastmod>
${LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${L[l].html}" href="${SITE}${urlOf(l, tail)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${urlOf('en', tail)}"/>
  </url>`).join('\n')
const block = `  <!-- learn:start (build-learn.mjs) -->\n${['learn/', ...eps.map((n) => `learn/${slug[n]}/`)].map(entry).join('\n')}\n  <!-- learn:end -->\n`
let sm = read(SM).replace(/  <!-- learn:start[\s\S]*?<!-- learn:end -->\n/, '')
sm = sm.replace('</urlset>', block + '</urlset>')
fs.writeFileSync(SM, sm)

const missing = eps.filter((n) => !scripts[n]?.length)
console.log(`  ✓ ${eps.length} public Shorts → ${pages} pages in ${LANGS.length} languages; sitemap updated`)
if (missing.length) console.log(`  (no script for #${missing.join(', #')}: those pages have no "what the coaches say")`)
const noTry = eps.filter((n) => !tryLine(n))
if (noTry.length) console.log(`  (no "Try it" line for #${noTry.join(', #')})`)
const waiting = Object.keys(videos).map(Number).filter((n) => !videos[n].public)
if (waiting.length) console.log(`  not public yet: #${waiting.join(', #')}`)
