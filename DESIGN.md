# SG Radio — Design System

**Concept: The FM Board**

A backlit frequency dashboard — everything visible at once, like scanning a radio dial.
The FM frequency number is the primary identity of each station. Dark glass, monospace
numerals, per-station accent colors that ignite when you tune in.

---

## Principles

1. **Frequency first.** The number (95.0, 93.3) is what makes it a radio — not the
   brand name. Treat it as the headline.

2. **At a glance.** All 16 stations visible simultaneously, no navigation needed.
   Information hierarchy: freq → station → now playing.

3. **Color as signal.** Each station's accent color is its identity. When playing,
   that color floods the card. When idle, it's present but restrained.

4. **Quiet when quiet.** No "No track info" copy. If there's nothing to say, say nothing.

---

## Color Tokens

```css
/* Background */
--bg:           #0a0a0a;   /* page background */
--surface:      #141414;   /* card background */
--border:       rgba(255,255,255,0.06);  /* card border (idle) */

/* Text */
--text-primary:   #f0f0f0;
--text-secondary: #888888;
--text-tertiary:  #555555;  /* group labels, timestamps */

/* Playing state */
/* --c is set per-card as the station's accent color */
/* active card: background color(--c) at 10% opacity */
/* active card: 2px top border in color(--c) */
/* active freq number: color(--c) instead of white */
```

### Station Accent Colors

| Station | Color |
|---|---|
| Class 95 | `#e63946` |
| Gold 90.5 | `#f4a261` |
| 987FM | `#2a9d8f` |
| YES 93.3 | `#e9c46a` |
| Capital 95.8 | `#f7b731` |
| Hao FM 96.3 | `#26c6da` |
| Love 97.2 | `#e76f51` |
| Symphony 92.4 | `#a8dadc` |
| Ria 89.7 | `#b388ff` |
| Warna 94.2 | `#4fc3f7` |
| CNA 938 | `#8ac926` |
| Oli 96.8 | `#ff595e` |
| Kiss92 | `#ff006e` |
| One FM 91.3 | `#3a86ff` |
| UFM 100.3 | `#8338ec` |
| Money FM 89.3 | `#06d6a0` |

---

## Typography

Load via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

| Role | Font | Size | Weight | Treatment |
|---|---|---|---|---|
| Frequency number | Space Mono | 24px | 700 | Station color when playing, `#f0f0f0` when idle |
| Station name | Inter | 10px | 600 | Uppercase, letter-spacing: 0.10em, color: `#888` |
| Artist | Inter | 11px | 400 | color: `#888` |
| Track title | Inter | 12px | 600 | color: `#f0f0f0` |
| Group label | Inter | 11px | 600 | Uppercase, letter-spacing: 0.12em, color: `#555` |
| Page title | Space Mono | 18px | 700 | color: `#f0f0f0` |
| Page subtitle | Inter | 14px | 400 | color: `#555`, inline after title |
| Timestamp | Inter | 11px | 400 | color: `#555`, footer position |

---

## Card Component

```
+------------------------------------------+
| {freq}                       [ ART  ART  ]|
| {STATION NAME}               [ ART  ART  ]|
|                              [ ART  ART  ]|
| {artist}                     [            ]|
| {Track Title}                              |
+------------------------------------------+
```

### Dimensions & Spacing

- Height: `108px`
- Border radius: `12px`
- Padding: `14px 0 14px 14px` (no right padding — art bleeds to edge)
- Art panel: `90px` wide, full height, `object-fit: cover`
- Art fallback: `rgba(255,255,255,0.04)` background (station color at 4% optional)

### CSS Card Structure

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  height: 108px;
  cursor: pointer;
  position: relative;
}

.card-content {
  flex: 1;
  padding: 14px 12px 14px 14px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.card-art {
  width: 90px;
  flex-shrink: 0;
}

.card-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Frequency number */
.freq {
  font-family: 'Space Mono', monospace;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 3px;
  color: var(--text-primary);  /* overridden to var(--c) when playing */
}

/* Station name */
.station-name {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

/* Track area */
.track-artist { font-size: 11px; color: var(--text-secondary); }
.track-title  { font-size: 12px; font-weight: 600; color: var(--text-primary); }
```

### Playing State

```css
.card.playing {
  border-top: 2px solid var(--c);
}

.card.playing::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--c);
  opacity: 0.10;
  pointer-events: none;
}

.card.playing .freq {
  color: var(--c);
}
```

### Equalizer Bars (playing state)

Four animated bars, top-right of card, inside the art zone boundary:

```css
.eq {
  position: absolute;
  top: 10px;
  right: 100px;  /* positions just left of art panel */
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}

.eq-bar {
  width: 3px;
  background: var(--c);
  border-radius: 1px;
  animation: eq-bounce var(--dur) ease-in-out infinite alternate;
}

@keyframes eq-bounce {
  from { height: 30%; }
  to   { height: 100%; }
}
```

Stagger durations: `0.5s`, `0.7s`, `0.4s`, `0.8s`.

---

## Grid Layout

```css
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 600px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
```

---

## Station Groups

Display order and names:

1. **Chinese** — YES 93.3, Capital 95.8, Hao FM 96.3, Love 97.2
2. **English** — Class 95, Gold 90.5, 987FM, Kiss92, One FM 91.3, Money FM 89.3, Symphony 92.4, CNA 938
3. **Malay & Tamil** — Ria 89.7, Warna 94.2, Oli 96.8, UFM 100.3

Group label style:

```css
.group-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-tertiary);  /* #555 */
  margin-bottom: 12px;
}
```

---

## Page Header

```
SG Radio  FM 88—108
```

- `SG Radio`: Space Mono 700 18px, `#f0f0f0`
- `FM 88—108`: Inter 400 14px, `#555`, inline after a `12px` left margin
- No nav, no controls — just the wordmark

---

## Timestamp

- Position: page footer, below all groups
- Format: `Updated {hh:mm am/pm}`
- Style: Inter 400 11px, `#555`
- Do not display prominently in the header

---

## Empty / Error States

- **No track info**: render nothing. Do not show "No track info" copy.
- **Station loading**: card renders with freq + name, track area empty.
- **API error**: same as no track info — silent.

---

## Interaction

- **Hover**: no transform/scale. Subtle — `border-color` transitions from `rgba(255,255,255,0.06)` to `rgba(255,255,255,0.14)`.
- **Tap / click**: triggers playback. Playing card gets full playing state treatment.
- **Transition**: `border-color 0.15s ease`, `background 0.2s ease` on the `::before` pseudo.
