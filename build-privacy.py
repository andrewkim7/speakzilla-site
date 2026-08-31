# Regenerates privacy.html from privacy.md — the source of record for the
# policy. Run after editing the markdown:  python build-privacy.py
import io, re

src = io.open('privacy.md', encoding='utf-8').read()
lines, out, in_tbl, in_list = src.splitlines(), [], False, False

def close_list():
    global in_list
    if in_list: out.append('</ul>'); in_list = False

for ln in lines:
    t = ln.rstrip()
    if not t.strip():
        close_list(); continue
    if t.startswith('|'):
        cells = [c.strip() for c in t.strip('|').split('|')]
        if set(''.join(cells)) <= set('-: '): continue
        if not in_tbl:
            out.append('<table>'); in_tbl = True
            out.append('<tr>' + ''.join(f'<th>{c}</th>' for c in cells) + '</tr>')
        else:
            out.append('<tr>' + ''.join(f'<td>{c}</td>' for c in cells) + '</tr>')
        continue
    if in_tbl: out.append('</table>'); in_tbl = False
    if t.startswith('## '): close_list(); out.append(f'<h2>{t[3:]}</h2>'); continue
    if t.startswith('# '):  close_list(); out.append(f'<h1>{t[2:]}</h1>'); continue
    if t.startswith('- '):
        if not in_list: out.append('<ul>'); in_list = True
        out.append(f'<li>{t[2:]}</li>'); continue
    if t.startswith('> '): close_list(); out.append(f'<blockquote>{t[2:]}</blockquote>'); continue
    if t.strip() == '---': close_list(); out.append('<hr>'); continue
    close_list(); out.append(f'<p>{t}</p>')
close_list()
if in_tbl: out.append('</table>')

body = '\n'.join(out)
body = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', body)
body = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', body)
body = re.sub(r'(?<!href=")\b(https?://[^\s<)]+)', r'<a href="\1">\1</a>', body)
# any unfilled placeholder stays impossible to miss
body = re.sub(r'\[([A-Z][A-Z /—-]*[A-Z])\]', r'<mark>[\1]</mark>', body)

# privacy.html is its own template: everything outside the markers — the
# shared header, the footer, the styles — is preserved, and only the generated
# body between them is replaced.
#
# The markers used to be `<main>` and the back link, so the boundary depended
# on whatever markup happened to sit there. When the back link was replaced by
# a real footer, a regeneration put the old link back and dropped a marker.
# Explicit comments cannot be moved by accident, and a missing one now stops
# the build rather than being guessed at.
START, END = '<!-- content:start -->', '<!-- content:end -->'
shell = io.open('privacy.html', encoding='utf-8').read()
if START not in shell or END not in shell:
    raise SystemExit('privacy.html is missing the content markers — refusing '
                     'to guess where the generated section begins.')
io.open('privacy.html', 'w', encoding='utf-8').write(
    shell.split(START, 1)[0] + START + '\n' + body + '\n' + END
    + shell.split(END, 1)[1])

left = re.findall(r'<mark>\[[^\]]+\]</mark>', body)
print('rebuilt privacy.html —', len(left), 'placeholder(s) left:',
      sorted(set(re.sub(r'<[^>]+>', '', x) for x in left)))
