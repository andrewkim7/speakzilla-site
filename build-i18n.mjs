// node build-i18n.mjs
//
// Generates /ko/ and /ja/ from the English pages. The site still has no build step at DEPLOY time: the
// output is plain HTML, committed, and Cloudflare Pages serves it as-is. This only exists so the three
// languages cannot drift apart silently -- every English snippet below must be found in the English page
// EXACTLY as many times as stated, or nothing is written. Change the English and this tells you which
// translation now needs a second look.
//
// Same rule as the app: the brand, the coaches' accents-as-English, and anything the learner says aloud
// stay English; the explaining is translated. Vocabulary matches the app's (speakzilla-mobile
// locales/README.md): 달걀 / たまご, 개근 / 皆勤, 개근 방어 / 皆勤ガード, 발음 맵 / 発音マップ.
//
// PRIVACY: there is no translated policy yet (it needs Andrew's research into what Korea and Japan
// require). Until privacy.<lang>.html exists the localized pages link to the English policy and say so.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const LANGS = {
  ko: { html: 'ko', name: '한국어', store: 'https://apps.apple.com/kr/app/id6805255043' },
  ja: { html: 'ja', name: '日本語', store: 'https://apps.apple.com/jp/app/id6805255043' },
}
// A language has its own policy when its SOURCE exists (privacy.<lang>.md). These are not translations of
// privacy.md: the Korean one follows PIPA's prescribed contents and the Japanese one APPI's, which is what
// each regulator asks of a foreign service (speakzilla-mobile NEXT.md, "RESEARCH DONE 2026-09-21").
const privacyReady = (lang) => fs.existsSync(path.join(root, `privacy.${lang}.md`))

// The same small markdown dialect as build-privacy.py, line for line: one source line is one block, so a
// paragraph or list item must sit on ONE line. [UPPERCASE] placeholders are marked so they cannot be missed.
function mdToHtml(src) {
  const out = []; let inTbl = false, inList = false
  const closeList = () => { if (inList) { out.push('</ul>'); inList = false } }
  for (const ln of src.replace(/\r\n/g, '\n').split('\n')) {
    const t = ln.replace(/\s+$/, '')
    if (!t.trim()) { closeList(); continue }
    if (t.startsWith('|')) {
      const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
      if (/^[-: ]*$/.test(cells.join(''))) continue
      if (!inTbl) { out.push('<div class="tbl"><table>'); inTbl = true; out.push('<tr>' + cells.map((c) => `<th>${c}</th>`).join('') + '</tr>') }
      else out.push('<tr>' + cells.map((c) => `<td>${c}</td>`).join('') + '</tr>')
      continue
    }
    if (inTbl) { out.push('</table></div>'); inTbl = false }
    if (t.startsWith('## ')) { closeList(); out.push(`<h2>${t.slice(3)}</h2>`); continue }
    if (t.startsWith('# ')) { closeList(); out.push(`<h1>${t.slice(2)}</h1>`); continue }
    if (t.startsWith('- ')) { if (!inList) { out.push('<ul>'); inList = true } out.push(`<li>${t.slice(2)}</li>`); continue }
    closeList(); out.push(`<p>${t}</p>`)
  }
  closeList(); if (inTbl) out.push('</table></div>')
  return out.join('\n')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!href=")(https?:\/\/[^\s<)）]+)/g, '<a href="$1">$1</a>')
    .replace(/\[([A-Z][A-Z /—-]*[A-Z])\]/g, '<mark>[$1]</mark>')
}

// [english, ko, ja, count?]  -- count defaults to 1

const INDEX = [
  ['<title>SpeakZilla — Speak English, know exactly what to fix</title>', '<title>SpeakZilla — 영어 발음, 무엇을 고칠지 정확히 알려 드려요</title>', '<title>SpeakZilla — 英語の発音、何を直せばいいかが正確にわかる</title>'],
  ['content="SpeakZilla listens as you read a sentence aloud and scores your pronunciation word by word. Choose a British or American coach and practise until you are understood the first time."',
   'content="문장을 소리 내어 읽으면 SpeakZilla가 듣고 발음을 단어 하나하나 채점해요. 영국식 또는 미국식 코치를 골라, 한 번에 알아듣게 말할 수 있을 때까지 연습하세요."',
   'content="文を声に出して読むと、SpeakZillaが聞き取り、発音を単語ひとつひとつ採点します。イギリス式またはアメリカ式のコーチを選んで、一度で伝わるようになるまで練習しましょう。"'],
  ['<meta property="og:title" content="SpeakZilla — Speak English, know exactly what to fix">', '<meta property="og:title" content="SpeakZilla — 영어 발음, 무엇을 고칠지 정확히 알려 드려요">', '<meta property="og:title" content="SpeakZilla — 英語の発音、何を直せばいいかが正確にわかる">'],
  ['content="Word-by-word pronunciation feedback with a British or American coach."', 'content="영국식 또는 미국식 코치와 함께하는, 단어 하나하나 발음 채점."', 'content="イギリス式またはアメリカ式のコーチと、単語ひとつひとつの発音採点。"'],
  ['<h1>Speak English.<br>Know <em>exactly</em> what to fix.</h1>', '<h1>소리 내어 말해 보세요.<br>무엇을 고칠지 <em>정확히</em> 알려 드려요.</h1>', '<h1>声に出して言ってみよう。<br>直す場所が<em>正確に</em>わかる。</h1>'],
  ['<p>SpeakZilla listens as you read a sentence aloud and scores your pronunciation\n       word by word — so instead of guessing, you can see which sounds landed and which need another try.</p>',
   '<p>문장을 소리 내어 읽으면 SpeakZilla가 듣고 발음을 단어 하나하나 채점해요.\n       그래서 짐작하는 대신, 어떤 소리가 잘 전달됐고 어떤 소리를 다시 해 봐야 하는지 볼 수 있어요.</p>',
   '<p>文を声に出して読むと、SpeakZillaが聞き取り、発音を単語ひとつひとつ採点します。\n       だから当てずっぽうではなく、どの音が伝わり、どの音をもう一度やるべきかが見えます。</p>'],
  ['>Download on the App Store</a>', '>App Store에서 다운로드</a>', '>App Storeでダウンロード</a>'],
  ['<div class="badge">Android — coming soon</div>', '<div class="badge">Android — 준비 중</div>', '<div class="badge">Android — 準備中</div>'],
  ['Not ready to install? Watch a short lesson on ', '아직 설치가 망설여지나요? 짧은 레슨 영상을 먼저 보세요: ', 'まだインストールを迷っていますか？ 短いレッスン動画をどうぞ：'],
  ['</a> or <a href="https://www.tiktok.com/@speakzilla.app" target="_blank" rel="noopener">TikTok</a>.</p>', '</a> · <a href="https://www.tiktok.com/@speakzilla.app" target="_blank" rel="noopener">TikTok</a> (영어)</p>', '</a> · <a href="https://www.tiktok.com/@speakzilla.app" target="_blank" rel="noopener">TikTok</a>（英語）</p>'],
  ['<h2>See it in action</h2>', '<h2>이렇게 보여요</h2>', '<h2>実際の画面</h2>'],
  ['<p class="lede">Real screens — a scored sentence, your coach, a map of forty sounds, and your progress.</p>', '<p class="lede">실제 화면이에요. 채점된 문장, 코치, 40가지 소리 지도, 그리고 나의 진도.</p>', '<p class="lede">実際の画面です。採点された文、コーチ、40の音のマップ、そしてあなたの進度。</p>'],
  ['aria-label="Previous screenshot"', 'aria-label="이전 화면"', 'aria-label="前の画面"'],
  ['aria-label="Next screenshot"', 'aria-label="다음 화면"', 'aria-label="次の画面"'],
  ['aria-label="Screenshot navigation"', 'aria-label="화면 이동"', 'aria-label="画面の切り替え"'],
  ['alt="A sentence scored word by word, with a percentage and per-word colours"', 'alt="단어 하나하나 채점된 문장, 점수와 단어별 색"', 'alt="単語ひとつひとつ採点された文、スコアと単語ごとの色"'],
  ['alt="Choosing a British or American coach"', 'alt="영국식 또는 미국식 코치 고르기"', 'alt="イギリス式またはアメリカ式のコーチを選ぶ"'],
  ['alt="The Sound Map — forty English sounds coloured by how well you say each"', 'alt="발음 맵 — 영어의 40가지 소리를 얼마나 잘 내는지 색으로 표시"', 'alt="発音マップ — 英語の40の音を、どれくらい言えているかで色分け"'],
  ['alt="A coaching tip for a specific sound"', 'alt="소리 하나에 대한 코칭 팁"', 'alt="ひとつの音についてのコーチングのヒント"'],
  ['alt="The lesson map, from first words to near-native"', 'alt="첫 단어부터 원어민 수준까지 이어지는 레슨 맵"', 'alt="最初の単語からネイティブに近いレベルまで続くレッスンマップ"'],
  ['alt="Progress — accuracy over time and recent attempts"', 'alt="진도 — 정확도 변화와 최근 학습"', 'alt="進度 — 正確度の変化と最近の学習"'],
  ['<h2>How it works</h2>', '<h2>이렇게 진행돼요</h2>', '<h2>使い方</h2>'],
  ['<p class="lede">Three steps, seconds each.</p>', '<p class="lede">세 단계, 각각 몇 초면 돼요.</p>', '<p class="lede">3つのステップ、それぞれ数秒です。</p>'],
  ['<h3>Listen</h3>\n      <p>Your coach reads the sentence, so you know what it should sound like.</p>', '<h3>듣기</h3>\n      <p>코치가 문장을 읽어 줘요. 어떻게 들려야 하는지 먼저 알 수 있어요.</p>', '<h3>聞く</h3>\n      <p>コーチが文を読み上げます。どう聞こえるべきかが先にわかります。</p>'],
  ['<h3>Speak</h3>\n      <p>Read it aloud. SpeakZilla listens while you talk, not after.</p>', '<h3>말하기</h3>\n      <p>소리 내어 읽으세요. SpeakZilla는 말이 끝난 뒤가 아니라 말하는 동안 들어요.</p>', '<h3>話す</h3>\n      <p>声に出して読みます。SpeakZillaは、話し終えたあとではなく、話している間に聞き取ります。</p>'],
  ['<h3>See the detail</h3>\n      <p>Every word is scored and colour-coded, so you know precisely what to work on.</p>', '<h3>자세히 보기</h3>\n      <p>모든 단어를 채점해 색으로 보여 줘요. 무엇을 연습해야 하는지 정확히 알 수 있어요.</p>', '<h3>詳しく見る</h3>\n      <p>すべての単語を採点して色で示します。何を練習すべきかが正確にわかります。</p>'],
  ['<h2>Choose your accent</h2>', '<h2>원하는 억양을 고르세요</h2>', '<h2>アクセントを選ぶ</h2>'],
  ['<p class="lede">Two coaches, two accents. Whichever you pick speaks every example you practise —\n     so you train the English you actually want to sound like.</p>',
   '<p class="lede">두 명의 코치, 두 가지 억양. 고른 코치가 연습하는 모든 예문을 읽어 줘요.\n     그래서 정말로 닮고 싶은 영어를 연습하게 돼요.</p>',
   '<p class="lede">2人のコーチ、2つのアクセント。選んだコーチが、練習するすべての例文を読み上げます。\n     だから、本当に近づきたい英語を練習できます。</p>'],
  ['<img src="assets/alex.png" alt="Alex" style="border-color:var(--indigo)">\n      <div>\n        <h3>Alex</h3>\n        <div class="accent" style="color:var(--indigo)">British English</div>\n        <p>Calm and precise — good for clean, crisp consonants.</p>',
   '<img src="assets/alex.png" alt="알렉스" style="border-color:var(--indigo)">\n      <div>\n        <h3>알렉스</h3>\n        <div class="accent" style="color:var(--indigo)">영국식 영어</div>\n        <p>차분하고 정확해요. 또렷하고 깔끔한 자음을 익히기에 좋아요.</p>',
   '<img src="assets/alex.png" alt="アレックス" style="border-color:var(--indigo)">\n      <div>\n        <h3>アレックス</h3>\n        <div class="accent" style="color:var(--indigo)">イギリス英語</div>\n        <p>落ち着いていて正確。くっきりとした子音を身につけるのにぴったりです。</p>'],
  ['<img src="assets/sofia.png" alt="Sofia" style="border-color:var(--accent)">\n      <div>\n        <h3>Sofia</h3>\n        <div class="accent" style="color:var(--accent)">American English</div>\n        <p>Warm and encouraging — natural, everyday rhythm.</p>',
   '<img src="assets/sofia.png" alt="소피아" style="border-color:var(--accent)">\n      <div>\n        <h3>소피아</h3>\n        <div class="accent" style="color:var(--accent)">미국식 영어</div>\n        <p>따뜻하게 격려해 줘요. 자연스러운 일상 리듬을 익히기에 좋아요.</p>',
   '<img src="assets/sofia.png" alt="ソフィア" style="border-color:var(--accent)">\n      <div>\n        <h3>ソフィア</h3>\n        <div class="accent" style="color:var(--accent)">アメリカ英語</div>\n        <p>あたたかく励ましてくれます。自然な日常のリズムを身につけるのにぴったりです。</p>'],
  ['<h2>Android is on the way</h2>', '<h2>Android도 준비 중이에요</h2>', '<h2>Android版も準備中です</h2>'],
  ['<p>SpeakZilla is live on iPhone — grab it from the App Store above. The Android\n       version is coming to Google Play; leave your email and we\'ll tell you the moment\n       it lands. Nothing else, ever.</p>',
   '<p>SpeakZilla는 지금 iPhone에서 쓸 수 있어요. 위의 App Store에서 받으세요. Android 버전은\n       Google Play에 나올 예정이에요. 이메일을 남겨 주시면 나오는 순간 알려 드릴게요.\n       그 외에는 아무것도 보내지 않아요.</p>',
   '<p>SpeakZillaは今、iPhoneで使えます。上のApp Storeから入手してください。Android版は\n       Google Playに登場予定です。メールアドレスを残していただければ、公開されたらすぐにお知らせします。\n       それ以外は何も送りません。</p>'],
  ['aria-label="Email address"', 'aria-label="이메일 주소"', 'aria-label="メールアドレス"'],
  ['<button type="submit">Notify me</button>', '<button type="submit">알림 받기</button>', '<button type="submit">知らせてもらう</button>'],
  ["'Go to screenshot '", "'화면 '", "'画面 '"],
  ['done("You\'re on the list. We\'ll email you when Android lands."); return; }', 'done("등록됐어요. Android 버전이 나오면 메일로 알려 드릴게요."); return; }', 'done("登録しました。Android版が公開されたらメールでお知らせします。"); return; }'],
  ["msg.textContent = 'Please enter a valid email address.'; return; }", "msg.textContent = '올바른 이메일 주소를 입력해 주세요.'; return; }", "msg.textContent = '正しいメールアドレスを入力してください。'; return; }"],
  ["btn.textContent = 'Sending…'", "btn.textContent = '보내는 중…'", "btn.textContent = '送信中…'"],
  ['done("You\'re on the list. We\'ll email you the moment it\'s live.");', 'done("등록됐어요. 나오는 순간 메일로 알려 드릴게요.");', 'done("登録しました。公開されたらすぐにメールでお知らせします。");'],
  ['done("You\'re already on the list — talk soon.");', 'done("이미 등록되어 있어요. 곧 소식 전할게요.");', 'done("すでに登録されています。近いうちにお知らせします。");'],
  ["btn.textContent = 'Notify me'; msg.className = 'notify-msg';\n    msg.textContent = 'Something went wrong — please try again, or email support@speakzilla.app.'; }",
   "btn.textContent = '알림 받기'; msg.className = 'notify-msg';\n    msg.textContent = '문제가 생겼어요. 다시 시도하거나 support@speakzilla.app으로 메일을 보내 주세요.'; }",
   "btn.textContent = '知らせてもらう'; msg.className = 'notify-msg';\n    msg.textContent = '問題が発生しました。もう一度試すか、support@speakzilla.app までメールでご連絡ください。'; }"],
  ["source: 'site' }", "source: 'site-ko' }", "source: 'site-ja' }"],
]

const SUPPORT_HEAD = [
  ['<title>Support — SpeakZilla</title>', '<title>도움말 — SpeakZilla</title>', '<title>サポート — SpeakZilla</title>'],
  ['content="Help with SpeakZilla: microphone, audio, scoring, daily lessons, accounts and data."', 'content="SpeakZilla 도움말: 마이크, 오디오, 채점, 하루 레슨, 계정과 데이터."', 'content="SpeakZillaのサポート：マイク、音声、採点、1日のレッスン、アカウントとデータ。"'],
]

// The support page's body is written whole per language rather than patched: it is prose, and prose
// translated sentence-by-sentence through exact-match snippets would be unmaintainable.
const SUPPORT_BODY = {
  ko: `    <h1>도움말</h1>
    <p class="lead">
      SpeakZilla는 한 사람이 만들어요. 저에게 바로 메일을 보내 주세요. 접수 대기열도,
      중간에 끼어 있는 챗봇도 없어요. 한국어로 쓰셔도 돼요.
    </p>

    <div class="card">
      <p class="email"><a href="mailto:support@speakzilla.app">support@speakzilla.app</a></p>
      <p class="muted">
        보통 영업일 기준 이틀 안에 답장해요. 문제가 생긴 경우라면 휴대폰 기종과 그때
        무엇을 하고 있었는지 알려 주세요. 대부분 훨씬 빨리 고칠 수 있어요.
      </p>
    </div>

    <h2>자주 묻는 질문</h2>

    <h3>앱이 제 목소리를 듣지 못해요</h3>
    <p>
      발음을 채점하려면 마이크 사용 권한이 필요해요. 권한 요청을 거절했다면
      <strong>설정 → SpeakZilla → 마이크</strong>에서 다시 켜 주세요. 인터넷 연결도
      필요해요. 채점은 휴대폰이 아니라 서버에서 이루어지기 때문에, 오프라인에서는
      레슨을 할 수 없어요.
    </p>

    <h3>예문 소리가 안 나거나 너무 작아요</h3>
    <p>
      예문을 듣는 것이 이 앱의 핵심이라, 휴대폰이 무음 모드여도 레슨 소리는 나와요.
      그래도 소리가 작다면 앱을 완전히 종료했다가 다시 열어 보세요. 오디오 세션이
      초기화돼요. 연결은 되어 있지만 쓰고 있지 않은 블루투스 이어폰도 흔한 원인이에요.
    </p>

    <h3>점수가 생각보다 낮아요</h3>
    <p>
      점수는 <strong>발음의 정확도만</strong> 측정해요. 얼마나 유창했는지, 얼마나
      빨랐는지가 아니라 소리 하나하나가 얼마나 가까웠는지를 봐요. 누구에게나 잘했다고
      하는 점수는 아무것도 가르쳐 주지 않기 때문에, 일부러 엄격하게 채점해요. 결과가
      나온 뒤 단어를 누르면 어떻게 들렸는지 볼 수 있어요.
    </p>
    <p>
      문장의 일부만 말하면 SpeakZilla는 아예 채점하지 않아요. 몇 단어가 들렸는지
      알려 드리고 문장 전체를 다시 말해 달라고 해요. 절반만 말한 것은 발음의 문제가
      아니라 아직 끝나지 않은 시도이기 때문이에요.
    </p>

    <h3>왜 하루에 레슨을 세 개만 할 수 있나요?</h3>
    <p>
      몰아서 하는 대신 꾸준히 학습할 수 있도록 새 레슨은 하루 세 개로 제한돼요.
      가끔 길게 하는 것보다 매일 짧게 하는 편이 나아요. 처음 열 개의 레슨은 적응할 수
      있도록 제한이 없고, 그 뒤로는 이렇게 돼요.
    </p>
    <ul>
      <li>끝낸 레슨을 다시 하는 것은 언제나 무료이고 횟수 제한이 없어요</li>
      <li>발음 연습은 제한에 포함되지 않아요</li>
      <li>달걀을 써서 하루에 한두 개를 더 열 수 있어요</li>
    </ul>

    <h3>달걀은 어디에 쓰나요?</h3>
    <p>
      달걀은 학습으로 모아요. 레슨을 끝내고, 오늘의 미션을 완료하고, 개근을 이어 가면
      받을 수 있어요. 추가 레슨과 개근 방어를 사는 데 써요. 돈으로는 살 수 없어요.
    </p>

    <h3>개근이 끊겼어요</h3>
    <p>
      개근은 레슨을 하나 이상 끝낸 날을 세고, 하루를 놓치면 처음으로 돌아가요.
      달걀로 사는 <strong>개근 방어</strong>가 있으면 놓친 하루를 자동으로 지켜 줘요.
      하루는 내 휴대폰 시간대의 자정에 바뀌어요.
    </p>

    <h3>비밀번호를 잊어버렸어요</h3>
    <p>
      로그인 화면에서 <strong>비밀번호를 잊으셨나요?</strong>를 누르고, 메일로 받은
      링크를 따라가세요. 몇 분이 지나도 메일이 오지 않으면 스팸함을 확인해 보시고,
      그래도 없으면 저에게 메일을 보내 주세요.
    </p>

    <h3>계정과 데이터를 어떻게 삭제하나요?</h3>
    <p>
      앱에서 <strong>프로필 → 계정 삭제</strong>를 누르세요. 계정과 학습 기록, 녹음이
      영구적으로 삭제돼요. 되돌릴 수 없고, 저에게 따로 연락할 필요도 없어요.
    </p>
    <p>
      무엇을 얼마 동안 저장하는지는 <a href="%PRIVACY%">개인정보 처리방침%PRIVACY_NOTE%</a>에
      나와 있어요.
    </p>

    <h3>어떤 억양을 골라야 하나요?</h3>
    <p>
      알렉스는 영국식, 소피아는 미국식이에요. 어느 쪽이 더 맞는 발음인 것은 아니에요.
      닮고 싶은 쪽을 고르세요. 코치는 프로필에서 언제든 바꿀 수 있고, 학습 기록은
      그대로 이어져요.
    </p>

    <h3>번역이 어색해요</h3>
    <p>
      알려 주세요. 앱에서 <strong>프로필 → “번역이 어색한가요? 알려 주세요”</strong>를
      누르면 메일이 열려요. 어느 화면의 어떤 문장인지 적어 주시면 고칠게요.
    </p>

    <hr>

    <h2>문제 신고하기</h2>
    <p>
      버그 신고는 정말 환영해요. 고칠 수 있는 사람이 직접 읽어요. 무엇을 기대했는지,
      실제로는 어떻게 됐는지, 대략 언제였는지를 알려 주시면 가장 도움이 돼요. 가능하면
      <strong>프로필 → 정보</strong>에 있는 버전 표시도 함께 보내 주세요. 어떤 빌드를
      쓰고 계신지 정확히 알 수 있어요.
    </p>

    <p class="muted">
      SpeakZilla — Andrew Kim, 774 Solarium Ave, Ottawa K4M 0R7, Canada.
    </p>
`,
  ja: `    <h1>サポート</h1>
    <p class="lead">
      SpeakZillaはひとりで作っています。私に直接メールを送ってください。受付の順番待ちも、
      間に入るボットもありません。日本語で書いていただいてかまいません。
    </p>

    <div class="card">
      <p class="email"><a href="mailto:support@speakzilla.app">support@speakzilla.app</a></p>
      <p class="muted">
        通常、2営業日以内に返信します。不具合のご報告の場合は、端末の機種と、そのとき
        何をしていたかを教えてください。ほとんどの場合、ずっと早く直せます。
      </p>
    </div>

    <h2>よくある質問</h2>

    <h3>アプリが声を聞き取ってくれません</h3>
    <p>
      発音を採点するには、マイクの使用許可が必要です。許可を求める画面で拒否した場合は、
      <strong>設定 → SpeakZilla → マイク</strong>でオンに戻してください。インターネット
      接続も必要です。採点は端末ではなくサーバーで行うため、オフラインではレッスンが
      できません。
    </p>

    <h3>例文の音が出ない、またはとても小さい</h3>
    <p>
      例文を聞くことがこのアプリの要なので、端末がマナーモードでもレッスンの音は出ます。
      それでも小さい場合は、アプリを完全に終了してから開き直してください。オーディオ
      セッションがリセットされます。接続されたまま使っていないBluetoothイヤホンも、
      よくある原因です。
    </p>

    <h3>スコアが思ったより低い</h3>
    <p>
      スコアが測るのは<strong>発音の正確さだけ</strong>です。どれだけ流暢か、どれだけ
      速いかではなく、音ひとつひとつがどれだけ近かったかを見ます。誰にでも「よく
      できました」と言う点数は何も教えてくれないので、あえて厳しく採点しています。
      結果が出たあとに単語をタップすると、どう聞こえたかが見られます。
    </p>
    <p>
      文の一部しか言わなかった場合、SpeakZillaはまったく採点しません。何語聞こえたかを
      お知らせし、文全体をもう一度言うようお願いします。半分だけの発話は発音の問題では
      なく、まだ終わっていない挑戦だからです。
    </p>

    <h3>なぜ1日に3つしかレッスンができないのですか？</h3>
    <p>
      まとめてやるのではなく、続けて学習できるように、新しいレッスンは1日3つに制限して
      います。たまに長くやるより、毎日短くやるほうが身につきます。最初の10レッスンは
      慣れるまで制限がなく、そのあとは次のとおりです。
    </p>
    <ul>
      <li>終えたレッスンのやり直しは、いつでも無料で回数制限もありません</li>
      <li>発音練習は制限に含まれません</li>
      <li>たまごを使って、1日に1つか2つ追加で開けます</li>
    </ul>

    <h3>たまごは何に使うのですか？</h3>
    <p>
      たまごは学習で集めます。レッスンを終える、今日のミッションを完了する、皆勤を
      続けることでもらえます。追加レッスンと皆勤ガードを買うのに使います。お金では
      買えません。
    </p>

    <h3>皆勤が途切れてしまいました</h3>
    <p>
      皆勤は、レッスンを1つ以上終えた日を数え、1日休むと最初に戻ります。たまごで買える
      <strong>皆勤ガード</strong>があれば、休んだ1日を自動で守ってくれます。1日は、
      お使いの端末のタイムゾーンの午前0時に切り替わります。
    </p>

    <h3>パスワードを忘れました</h3>
    <p>
      ログイン画面で<strong>パスワードをお忘れですか？</strong>を押し、メールで届いた
      リンクに従ってください。数分たってもメールが届かない場合は迷惑メールフォルダを
      確認し、それでも見つからなければ私までメールをください。
    </p>

    <h3>アカウントとデータを削除するには？</h3>
    <p>
      アプリで<strong>プロフィール → アカウントを削除</strong>を押してください。
      アカウント、学習記録、録音が完全に削除されます。元に戻すことはできず、私に連絡する
      必要もありません。
    </p>
    <p>
      何をどれくらいの期間保存するかは、<a href="%PRIVACY%">プライバシーポリシー%PRIVACY_NOTE%</a>に
      記載しています。
    </p>

    <h3>どちらのアクセントを選べばいいですか？</h3>
    <p>
      アレックスはイギリス式、ソフィアはアメリカ式です。どちらかがより正しいということは
      ありません。近づきたいほうを選んでください。コーチはプロフィールからいつでも変え
      られ、学習記録はそのまま引き継がれます。
    </p>

    <h3>翻訳が不自然です</h3>
    <p>
      教えてください。アプリで<strong>プロフィール →「翻訳が不自然ですか？教えて
      ください」</strong>を押すとメールが開きます。どの画面のどの文かを書いていただければ
      直します。
    </p>

    <hr>

    <h2>不具合の報告</h2>
    <p>
      不具合のご報告は本当に歓迎します。直せる本人が直接読みます。何を期待していたか、
      実際にはどうなったか、だいたいいつだったかを教えていただけると、いちばん助かります。
      できれば、<strong>プロフィール → 情報</strong>にあるバージョン表示も一緒に送って
      ください。どのビルドをお使いかが正確にわかります。
    </p>

    <p class="muted">
      SpeakZilla — Andrew Kim, 774 Solarium Ave, Ottawa K4M 0R7, Canada.
    </p>
`,
}

function applyAll(text, table, col, file) {
  for (const [en, ko, ja, count = 1] of table) {
    const n = text.split(en).length - 1
    if (n !== count) throw new Error(`${file}: expected ${count}× but found ${n}×:\n${en}`)
    text = text.split(en).join(col === 'ko' ? ko : ja)
  }
  return text
}

// Links, assets and language metadata, the same for every page.
function localize(html, lang, page) {
  const L = LANGS[lang]
  const privacy = privacyReady(lang) ? `/${lang}/privacy.html` : '/privacy.html'
  const once = (a, b, count = 1) => {
    const n = html.split(a).length - 1
    if (n !== count) throw new Error(`${page} [${lang}]: expected ${count}× but found ${n}×:\n${a}`)
    html = html.split(a).join(b)
  }
  once('<html lang="en">', `<html lang="${L.html}">`)
  // Absolute, so the same markup works one directory down.
  html = html.split('href="assets/').join('href="/assets/').split('src="assets/').join('src="/assets/').split('content="assets/').join('content="/assets/')
  once('<a class="brand" href="/">', `<a class="brand" href="/${lang}/">`)
  html = html.split('href="/support.html"').join(`href="/${lang}/support.html"`)
  html = html.split('href="/privacy.html"').join(`href="${privacy}"`)
  html = html.split('https://apps.apple.com/app/id6805255043').join(L.store)
  // hreflang: tell search engines these are the same page in three languages.
  const alt = ['en', 'ko', 'ja'].map((l) => `<link rel="alternate" hreflang="${l}" href="https://speakzilla.app/${l === 'en' ? '' : l + '/'}${page === 'index.html' ? '' : page.replace('.html', '')}">`).join('\n')
  once('<meta name="viewport" content="width=device-width, initial-scale=1">', `<meta name="viewport" content="width=device-width, initial-scale=1">\n${alt}`)

  // Korean breaks between words, never inside one. Japanese has no spaces to break at, so: never start a
  // line with 。or、, balance headings so one character is not left alone on a line, and a slightly smaller
  // headline -- at phone width the English size fits eleven characters across and the headline has twelve.
  const css = lang === 'ko'
    ? '  body{word-break:keep-all}\n'
    : '  body{line-break:strict}\n  h1,h2,h3,.lede{text-wrap:balance}\n  .hero h1{font-size:clamp(25px,5.6vw,46px)}\n'
  once('</style>', css + '</style>')

  // A browser renders a newline in the source as a SPACE. English and Korean want that; between two
  // Japanese characters it is a visible gap in the middle of a sentence. The prose here is wrapped for
  // readability, so join those lines back up for Japanese.
  if (lang === 'ja') {
    const J = '\\u3040-\\u30FF\\u3400-\\u9FFF\\uFF01-\\uFF60\\u3000-\\u303F'
    html = html
      .replace(new RegExp(`([${J}])\\n[ \\t]*(?=[${J}A-Za-z0-9<])`, 'g'), '$1')
      .replace(new RegExp(`(</strong>|</a>|[A-Za-z0-9])\\n[ \\t]*(?=[${J}])`, 'g'), '$1')
  }
  return html
}

const footerWords = { ko: ['도움말', '개인정보 처리방침'], ja: ['サポート', 'プライバシーポリシー'] }

let written = 0
const outputs = []
for (const lang of Object.keys(LANGS)) {
  const note = privacyReady(lang) ? '' : (lang === 'ko' ? ' (영문)' : '（英語）')

  // ── index ──
  let idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/\r\n/g, '\n')
  idx = applyAll(idx, INDEX, lang, 'index.html')
  idx = applyAll(idx, [
    ['<a class="nav" href="/support.html">Support</a>\n    <a class="nav" href="/privacy.html">Privacy</a>',
      `<a class="nav" href="/support.html">${footerWords.ko[0]}</a>\n    <a class="nav" href="/privacy.html">개인정보</a>`,
      `<a class="nav" href="/support.html">${footerWords.ja[0]}</a>\n    <a class="nav" href="/privacy.html">プライバシー</a>`],
    ['<a href="/support.html">Support</a> &nbsp;·&nbsp;\n      <a href="/privacy.html">Privacy policy</a> &nbsp;·&nbsp;',
      `<a href="/support.html">${footerWords.ko[0]}</a> &nbsp;·&nbsp;\n      <a href="/privacy.html">${footerWords.ko[1]}${note}</a> &nbsp;·&nbsp;`,
      `<a href="/support.html">${footerWords.ja[0]}</a> &nbsp;·&nbsp;\n      <a href="/privacy.html">${footerWords.ja[1]}${note}</a> &nbsp;·&nbsp;`],
    ['Short lessons: ', '짧은 레슨 영상 (영어): ', 'ショート動画（英語）：'],
  ], lang, 'index.html')
  idx = localize(idx, lang, 'index.html')
  outputs.push([path.join(root, lang, 'index.html'), idx])

  // ── support ──
  let sup = fs.readFileSync(path.join(root, 'support.html'), 'utf8').replace(/\r\n/g, '\n')
  const start = '<!-- content:start -->\n', end = '<!-- content:end -->'
  if (sup.split(start).length !== 2 || sup.split(end).length !== 2) throw new Error('support.html: content markers missing')
  sup = sup.slice(0, sup.indexOf(start) + start.length) + SUPPORT_BODY[lang] + '\n' + sup.slice(sup.indexOf(end))
  sup = applyAll(sup, SUPPORT_HEAD, lang, 'support.html')
  sup = applyAll(sup, [
    ['<a class="nav" href="/support.html">Support</a>\n      <a class="nav" href="/privacy.html">Privacy</a>',
      `<a class="nav" href="/support.html">${footerWords.ko[0]}</a>\n      <a class="nav" href="/privacy.html">개인정보</a>`,
      `<a class="nav" href="/support.html">${footerWords.ja[0]}</a>\n      <a class="nav" href="/privacy.html">プライバシー</a>`],
    ['<a href="/support.html">Support</a> &nbsp;&middot;&nbsp;\n      <a href="/privacy.html">Privacy policy</a> &nbsp;&middot;&nbsp;',
      `<a href="/support.html">${footerWords.ko[0]}</a> &nbsp;&middot;&nbsp;\n      <a href="/privacy.html">${footerWords.ko[1]}${note}</a> &nbsp;&middot;&nbsp;`,
      `<a href="/support.html">${footerWords.ja[0]}</a> &nbsp;&middot;&nbsp;\n      <a href="/privacy.html">${footerWords.ja[1]}${note}</a> &nbsp;&middot;&nbsp;`],
    ['Short lessons: ', '짧은 레슨 영상 (영어): ', 'ショート動画（英語）：'],
  ], lang, 'support.html')
  sup = sup.split('%PRIVACY_NOTE%').join(note).split('%PRIVACY%').join('/privacy.html')
  sup = localize(sup, lang, 'support.html')
  outputs.push([path.join(root, lang, 'support.html'), sup])

  // ── privacy ── its own text (privacy.<lang>.md) inside the English page's shell.
  if (privacyReady(lang)) {
    // main a: a long URL in a Japanese paragraph has nowhere to break and pushed the page sideways on a phone.
    const TABLE_CSS = '  .tbl{overflow-x:auto;margin:12px 0}\n  .tbl table{margin:0;min-width:560px}\n  td{font-size:14px;line-height:1.55}\n  main a{overflow-wrap:anywhere}\n</style>'
    let pv =fs.readFileSync(path.join(root, 'privacy.html'), 'utf8').replace(/\r\n/g, '\n')
    if (pv.split(start).length !== 2 || pv.split(end).length !== 2) throw new Error('privacy.html: content markers missing')
    const body = mdToHtml(fs.readFileSync(path.join(root, `privacy.${lang}.md`), 'utf8'))
    pv = pv.slice(0, pv.indexOf(start) + start.length) + body + '\n' + pv.slice(pv.indexOf(end))
    pv = applyAll(pv, [
      ['<title>Privacy policy — SpeakZilla</title>', '<title>개인정보 처리방침 — SpeakZilla</title>', '<title>プライバシーポリシー — SpeakZilla</title>'],
      ['<a class="nav" href="/support.html">Support</a>\n      <a class="nav" href="/privacy.html">Privacy</a>',
        `<a class="nav" href="/support.html">${footerWords.ko[0]}</a>\n      <a class="nav" href="/privacy.html">개인정보</a>`,
        `<a class="nav" href="/support.html">${footerWords.ja[0]}</a>\n      <a class="nav" href="/privacy.html">プライバシー</a>`],
      ['<a href="/support.html">Support</a> &nbsp;&middot;&nbsp;\n      <a href="/privacy.html">Privacy policy</a> &nbsp;&middot;&nbsp;',
        `<a href="/support.html">${footerWords.ko[0]}</a> &nbsp;&middot;&nbsp;\n      <a href="/privacy.html">${footerWords.ko[1]}</a> &nbsp;&middot;&nbsp;`,
        `<a href="/support.html">${footerWords.ja[0]}</a> &nbsp;&middot;&nbsp;\n      <a href="/privacy.html">${footerWords.ja[1]}</a> &nbsp;&middot;&nbsp;`],
      ['Short lessons: ', '짧은 레슨 영상 (영어): ', 'ショート動画（英語）：'],
      // Six-column tables (Korea's transfer table) need room to scroll sideways on a phone.
      // (The row has one column per language; the CSS is the same in both.)
      ['</style>', TABLE_CSS, TABLE_CSS],
    ], lang, 'privacy.html')
    pv = localize(pv, lang, 'privacy.html')
    const left = [...new Set((body.match(/<mark>\[[^\]]+\]<\/mark>/g) || []).map((x) => x.replace(/<[^>]+>/g, '')))]
    console.log(`  ${lang}/privacy.html: ${left.length ? 'placeholders left: ' + left.join(' ') : 'no placeholders left'}`)
    outputs.push([path.join(root, lang, 'privacy.html'), pv])
  }
}

// Nothing above threw: write everything.
for (const [file, html] of outputs) {
  if (/%PRIVACY|undefined/.test(html)) throw new Error(`${file}: unresolved placeholder`)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
  written++
  console.log('wrote', path.relative(root, file), `(${(html.length / 1024).toFixed(1)} KB)`)
}
console.log(`${written} pages. Privacy policy: ` + Object.keys(LANGS).map((l) => `${l}=${privacyReady(l) ? 'translated' : 'English (not translated yet)'}`).join(', '))
