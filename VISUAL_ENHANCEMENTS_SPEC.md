# Academic Theme Visual Enhancements Specification

## Overview

This document specifies unique visual elements that reinforce the Academic Textbook/Notes/Papers theme. All effects are subtle, purposeful, and work in both light (paper) and dark (chalkboard) modes.

---

## 1. Paper Texture Overlay

**Inspiration**: Subtle paper grain texture like textbook pages

**Implementation**:
- CSS pseudo-element with SVG noise pattern
- Very low opacity (2-3%) to avoid overwhelming content
- Applied to card backgrounds and main content areas
- Different texture for dark mode (chalkboard grain)

**Use Cases**:
- Card backgrounds
- Main content containers
- Modal/dialog backgrounds

**CSS Approach**:
```css
.paper-texture::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,...");
  opacity: 0.03;
  pointer-events: none;
}
```

---

## 2. Folded Corner Effect

**Inspiration**: Dog-eared textbook pages, bookmarks

**Implementation**:
- CSS clip-path or border technique for corner fold
- Subtle shadow to create depth
- Optional: Different color for the "back" of the fold
- Hover effect: Slight animation of the fold

**Use Cases**:
- Featured cards
- Important announcements
- Tutorial cards
- Achievement badges

**Variants**:
- Top-right corner (most common)
- Bottom-right corner
- Small (8px) or large (16px) fold

---

## 3. Ruled Lines (Notebook Paper)

**Inspiration**: Lined notebook paper, composition books

**Implementation**:
- Horizontal lines with consistent spacing
- Very subtle color (barely visible)
- Optional: Red vertical margin line on the left
- Can be used as background pattern or separator

**Use Cases**:
- Text input areas (like writing on lined paper)
- Note-taking sections
- Chat message backgrounds
- Long-form content areas

**CSS Approach**:
```css
.ruled-lines {
  background-image: repeating-linear-gradient(
    transparent,
    transparent 1.5rem,
    var(--border) 1.5rem,
    var(--border) calc(1.5rem + 1px)
  );
}
```

---

## 4. Ink Underline Effect

**Inspiration**: Hand-drawn underlines with slight imperfection

**Implementation**:
- SVG path for slightly wavy/imperfect line
- Applied to headings and important links
- Animated on hover (draw-in effect)
- Color matches primary (blue ink)

**Use Cases**:
- Section headings
- Active navigation items
- Important links
- Call-to-action elements

**Variants**:
- Single underline
- Double underline (for emphasis)
- Wavy underline (for corrections/edits)

---

## 5. Highlighter Marker Effect

**Inspiration**: Yellow highlighter marker on text

**Implementation**:
- Extends existing ::selection styling
- Can be applied to specific elements
- Slightly transparent with blur for marker effect
- Animated on hover (marker swipe effect)

**Use Cases**:
- Important text emphasis
- Search result highlights
- Active quiz answers
- Key statistics

**CSS Approach**:
```css
.highlight-marker {
  background: linear-gradient(to right, transparent, var(--accent), transparent);
  background-size: 200% 100%;
  background-position: 100% 0;
  transition: background-position 0.3s;
}
.highlight-marker:hover {
  background-position: 0 0;
}
```

---

## 6. Sticky Note Callout

**Inspiration**: Post-it notes, sticky notes on textbook pages

**Implementation**:
- Slightly rotated container (-1 to 1 degree)
- Soft shadow (like paper lifted off page)
- Pastel background colors (yellow, pink, blue, green)
- Optional: Torn edge effect at top

**Use Cases**:
- Tips and hints
- Important notices
- Quick notes
- Tutorial callouts

**Variants**:
- Yellow (default/info)
- Pink (warning)
- Blue (note)
- Green (success)

---

## 7. Pencil Sketch Border

**Inspiration**: Hand-drawn boxes and borders in notes

**Implementation**:
- SVG stroke with slight irregularity
- Dashed or solid with imperfect spacing
- Animated on hover (draw-in effect)
- Graphite color (gray)

**Use Cases**:
- Focus states
- Selected items
- Diagram boxes
- Important sections

---

## 8. Page Curl Effect

**Inspiration**: Turning pages in a book

**Implementation**:
- CSS 3D transform on hover
- Subtle shadow for depth
- Only on interactive cards
- Very subtle (2-3 degree rotation)

**Use Cases**:
- Interactive cards on hover
- Tutorial navigation
- Game mode selection cards
- Profile cards

**CSS Approach**:
```css
.page-curl:hover {
  transform: perspective(1000px) rotateY(2deg);
  box-shadow: -2px 2px 8px rgba(0,0,0,0.1);
}
```

---

## 9. Margin Notes

**Inspiration**: Handwritten notes in textbook margins

**Implementation**:
- Smaller italic text
- Positioned in margin area
- Optional: Connecting line to main content
- Slightly rotated for handwritten feel

**Use Cases**:
- Tooltips
- Additional context
- Hints
- Definitions

**Already implemented as utility**: `.margin-note`

---

## 10. Bookmark Ribbon

**Inspiration**: Ribbon bookmarks in textbooks

**Implementation**:
- Vertical ribbon extending from top of card
- Subtle gradient and shadow
- Can display icon or text
- Indicates "saved" or "favorite" status

**Use Cases**:
- Saved game modes
- Favorite tutorials
- Bookmarked pages
- Current section indicator

**CSS Approach**:
```css
.bookmark-ribbon::before {
  content: '';
  position: absolute;
  top: 0;
  right: 1rem;
  width: 2rem;
  height: 3rem;
  background: var(--primary);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);
}
```

---

## Implementation Priority

**Phase 1 (High Priority)**:
1. Paper Texture Overlay - Adds immediate academic feel
2. Folded Corner Effect - Unique visual identity
3. Ink Underline Effect - Enhances typography
4. Highlighter Marker Effect - Functional and thematic

**Phase 2 (Medium Priority)**:
5. Sticky Note Callout - Useful for UI feedback
6. Ruled Lines - Great for input fields
7. Bookmark Ribbon - Visual indicator for saved items

**Phase 3 (Low Priority)**:
8. Page Curl Effect - Subtle hover enhancement
9. Pencil Sketch Border - Alternative to standard borders
10. Margin Notes - Already have utility, enhance with styling

---

## Technical Considerations

**Performance**:
- Use CSS transforms and opacity for animations (GPU accelerated)
- Avoid excessive SVG filters
- Lazy-load texture patterns
- Use will-change sparingly

**Accessibility**:
- All effects are decorative, don't convey critical information
- Maintain WCAG 2.1 AA contrast ratios
- Respect prefers-reduced-motion
- Ensure effects don't interfere with screen readers

**Browser Support**:
- Target modern browsers (last 2 versions)
- Graceful degradation for older browsers
- Test in Safari, Chrome, Firefox, Edge

**Dark Mode**:
- Adjust opacity and colors for dark mode
- Chalkboard texture instead of paper texture
- Lighter shadows and borders
- Test all effects in both modes

