import math
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.areaPen import AreaPen

def add_dot_zero(font, scale=1.0):
    gs = font.getGlyphSet()
    glyf = font['glyf']
    rec = DecomposingRecordingPen(gs)
    gs['zero'].draw(rec)
    # direction of first (outer) contour
    ap = AreaPen(gs); 
    # measure outer contour only
    contours = []; cur = []
    for op, args in rec.value:
        cur.append((op, args))
        if op in ('closePath', 'endPath'):
            contours.append(cur); cur = []
    areas = []
    for c in contours:
        p = AreaPen()
        for op, args in c: getattr(p, op)(*args)
        areas.append(p.value)
    outer_sign = 1 if areas[max(range(len(areas)), key=lambda i: abs(areas[i]))] > 0 else -1
    z = glyf['zero']
    cx = (z.xMin + z.xMax) / 2; cy = (z.yMin + z.yMax) / 2
    rx, ry = 46 * scale, 78 * scale
    pen = TTGlyphPen(gs)
    for op, args in rec.value: getattr(pen, op)(*args)
    # ellipse via quadratic segments (8 points)
    n = 16
    pts = [(cx + rx * math.cos(2*math.pi*i/n), cy + ry * math.sin(2*math.pi*i/n)) for i in range(n)]
    # AreaPen sign: positive for counter-clockwise in fontTools convention
    test = AreaPen(); test.moveTo(pts[0]); [test.lineTo(p) for p in pts[1:]]; test.closePath()
    if (test.value > 0) != (outer_sign > 0):
        pts = pts[::-1]
    pen.moveTo((round(pts[0][0]), round(pts[0][1])))
    for p in pts[1:]: pen.lineTo((round(p[0]), round(p[1])))
    pen.closePath()
    glyf['zero'] = pen.glyph()
    glyf['zero'].recalcBounds(glyf)
