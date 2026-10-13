import sys, os
from fontTools import subset
from fontTools.ttLib import TTFont
from dotzero import add_dot_zero

UNICODES = "U+0020-007E,U+00A0-00FF,U+0100-017F,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2002-200D,U+2010-2027,U+2030-203A,U+2044,U+20AC,U+2122,U+2190-2199,U+21D0-21D5,U+2212,U+2215,U+2218-2219,U+221E,U+2260,U+2264-2265,U+22C5,U+2423"

# (source file, new family, style name, weight, italic)
JOBS = [
  ("cmu-serif-500-roman", "BM Serif", "Regular", 500, False),
  ("cmu-serif-500-italic", "BM Serif", "Italic", 500, True),
  ("cmu-serif-700-roman", "BM Serif", "Bold", 700, False),
  ("cmu-serif-700-italic", "BM Serif", "Bold Italic", 700, True),
  ("cmu-concrete-500-roman", "BM Concrete", "Regular", 500, False),
  ("cmu-concrete-500-italic", "BM Concrete", "Italic", 500, True),
  ("cmu-concrete-700-roman", "BM Concrete", "Bold", 700, False),
  ("cmu-sans-serif-500-roman", "BM Sans", "Regular", 500, False),
  ("cmu-sans-serif-700-roman", "BM Sans", "Bold", 700, False),
  ("cmu-sans-serif-demi-condensed-600-roman", "BM Sans Condensed", "SemiBold", 600, False),
  ("cmu-typewriter-text-500-roman", "BM Typewriter", "Regular", 500, False),
  ("cmu-typewriter-text-700-roman", "BM Typewriter", "Bold", 700, False),
  ("cmu-typewriter-text-500-italic", "BM Typewriter", "Italic", 500, True),
  ("cmu-serif-extra-700-roman", "BM Serif Text Bold", "Bold", 700, False),
]

def rename(font, family, style):
    name = font["name"]
    full = f"{family} {style}".replace(" Regular", "") if style != "Regular" else family
    ps = (family + "-" + style).replace(" ", "")
    for rec in list(name.names):
        if rec.nameID in (1, 2, 3, 4, 6, 16, 17, 21, 22):
            name.removeNames(nameID=rec.nameID)
    name.setName(family, 1, 3, 1, 0x409)
    name.setName(style if style in ("Regular", "Italic", "Bold", "Bold Italic") else "Regular", 2, 3, 1, 0x409)
    name.setName(f"{ps};subset-of-Computer-Modern-Unicode", 3, 3, 1, 0x409)
    name.setName(full, 4, 3, 1, 0x409)
    name.setName(ps, 6, 3, 1, 0x409)
    name.setName(family, 16, 3, 1, 0x409)
    name.setName(style, 17, 3, 1, 0x409)
    # Keep the original copyright (nameID 0) and license (13/14) records.

for src, fam, style, w, it in JOBS:
    path = f"package/fonts/{src}.woff2"
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.name_languages = ["*"]
    opts.notdef_outline = True
    opts.hinting = False
    opts.desubroutinize = True
    font = TTFont(path)
    if fam == "BM Typewriter":
        add_dot_zero(font, 1.0 if w < 700 else 1.25)
    unis = []
    for part in UNICODES.split(","):
        part = part.strip()[2:]
        if "-" in part:
            a, b = part.split("-"); unis += list(range(int(a, 16), int(b, 16) + 1))
        else:
            unis.append(int(part, 16))
    s = subset.Subsetter(opts)
    s.populate(unicodes=unis)
    s.subset(font)
    rename(font, fam, style)
    out = f"out/{fam.lower().replace(' ', '-')}-{w}{'-italic' if it else ''}.woff2"
    font.flavor = "woff2"
    font.save(out)
    print(out, os.path.getsize(out))
