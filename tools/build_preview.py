"""Builds public/preview/index.html from public/index.html.

The preview is the live page plus the cinematic layer (cinema.css, cinema.js)
and "the climb" scene in place of the static tier grid. Run from the repo
root:  python3 tools/build_preview.py
"""
import re

TIERS = [
    ("bronze", "Bronze", "Everyone starts here."),
    ("silver", "Silver", "Wins pay by the odds. A loss costs half."),
    ("gold", "Gold", "The top of the free climb. From here, every loss costs full."),
    ("platinum", "Platinum", "Verified only. Earned with real bets from your sportsbook."),
    ("diamond", "Diamond", "Fewer players at every step."),
    ("sharp", "Sharp", "The highest a unicorn parlay can carry you."),
    ("legend", "Legend", "Stop playing and it fades. This one has to be defended."),
    ("goat", "GOAT", "Ten players. That's it."),
]

s = open("public/index.html").read()

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:60])
    s = s.replace(a, b)

rep('<link rel="stylesheet" href="/styles.css">',
    '<link rel="stylesheet" href="/styles.css">\n<link rel="stylesheet" href="/cinema.css">\n<meta name="robots" content="noindex">')
rep('<title>BetLab · The ranked ladder for sports bettors</title>', '<title>BetLab · Preview</title>')
rep('<header class="wrap top">', '<div class="top-bar">\n<header class="wrap top">')
rep('</header>\n\n<main>', '</header>\n</div>\n\n<main>')
s = s.replace('\n      <a href="https://app.betlab.us">Open the app</a>', '')

a = s.index('<section id="tiers" class="band">')
b = s.index('</section>', a) + len('</section>')
static = s[a:b]
inner = static[static.index('<div class="wrap section">'):static.rindex('</section>')]
lines = "\n".join(
    '          <div class="climb-line"><h2 class="climb-tier t-%s">%s</h2><p>%s</p></div>' % (k, n, t)
    for k, n, t in TIERS)
imgs = "\n".join(
    '        <img src="/badges/%s.webp" alt="%s rank badge" width="512" height="512">' % (k, n)
    for k, n, _ in TIERS)
rail = "<li></li>" * len(TIERS)
climb = '''<section id="tiers" class="band climb" aria-label="The eight tiers, Bronze to GOAT">
  <div class="climb-pin">
    <div class="wrap climb-grid">
      <div class="climb-copy">
        <div class="eyebrow">The climb</div>
        <div class="climb-lines">
%s
        </div>
        <ol class="climb-rail" aria-hidden="true">%s</ol>
      </div>
      <div class="climb-stage">
%s
        <div class="climb-edge"></div>
      </div>
    </div>
    <div class="climb-hint" aria-hidden="true">Scroll to climb</div>
  </div>
  <div class="climb-static">
  %s
  </div>
</section>''' % (lines, rail, imgs, inner)
s = s[:a] + climb + s[b:]

rep('<script src="/app.js" defer></script>', '<script src="/app.js" defer></script>\n<script src="/cinema.js" defer></script>')
open("public/preview/index.html", "w").write(s)
print("wrote public/preview/index.html", len(s))
