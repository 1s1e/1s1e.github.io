# THE ISLE · THE STYLE GUIDE

The single authority for everything created for The Isle and for 1s1e.com.
Icon, colour, font, design, spacing, rules, references and requirements,
without exception. Anything created for The Isle starts here; a value,
a name or a practice that is not in this master is not settled, and
anything that departs from this master is drift, to be corrected, not a
local variation. The companion style sheet is the-isle-master.css, which
carries the same values in working form. Settled November 22, 2026.

## 1. The name and the words

- The house and the place are called The Isle, with a capital T, in every
  use, including mid sentence and the possessive, The Isle's.
- The street address never appears in anything created, presented,
  published or filed, including file names. Everything is just The Isle.
- Regalia is the builder's plan and model name. It appears only inside
  source documents, never as the home's name in anything presented,
  written or published.
- The register: high end, elusive, exclusive, and at the same time
  barefoot luxury, down to earth and easy going. Nothing boasts and
  nothing sells. Quality is stated plainly and warmly; confidence comes
  through restraint and ease. The Isle is the ultimate destination, a cut
  above the rest, and says so by how it is made, not by claiming it.
- The line of the house: "More than a place you come to, a place you
  stay." Set in Playfair Display, italic, weight 500.
- No em dashes, anywhere, in messages or in anything created.

## 2. The colours

Seventeen colours in total: the five masters and twelve working steps. Every colour carries the house name in speech and in records. Candidate names from the selection (Master, Night Chart, Ref Navy) belong to the history, not to the settled colours. The palette was simplified on November 22, 2026 from twenty six values to seventeen; every retired value folded to its nearest kept step, listed in the change log.

### The five masters

- The Isle Navy, #1d2a3b, RGB 29 42 59. The one common blue for the whole group: grounds, ink, the logo's lettering and island in colour artwork, the icon ground.
- The Isle Green, #46936a, RGB 70 147 106. The palm crown, in the artwork only.
- The Isle Gold, #c9ab72, RGB 201 171 114. The palm trunk, and gold on dark grounds: the coastline, headings, bright accents.
- The Isle Silver, #C0C0C0, RGB 192 192 192. The dark mode silver: the logo's island and text in dark mode, the splash's name.
- The Isle Ivory, #f0e8d5, RGB 240 232 213. Text on dark grounds, and the chart's curves and sounding figures on dark.

### The Isle Navy, its steps

- Panel #22344a: panels and cards on the navy ground.
- Deep #152130: the deepest ground, page fields and wells.

### Text steps on dark

- Ivory Soft #d9d0ba: secondary text on dark.
- Ivory Dim #a89f88: labels, captions and meta text on dark.

### Gold for text

- Page Gold, dark #c2a15c: labels, rules and the gold dot on dark grounds.
- Page Gold, light #a07f3a: gold text and rules on light grounds, where the artwork gold is too pale to read.

### Light grounds and their ink

- Light Ground #faf7ee: the light page ground.
- Light Tint #f3eee0: tinted panels on light.
- Soft Ink #3c4763: secondary text on light, and the chart's curves on light.
- Dim Ink #767c8d: labels and meta text on light.

### The splash

- Poster Mat #dfe2e6: the mat inside the poster frame.
- Terra #93a7c9: the splash's quiet secondary tone.

The splash's own tokens sit inside this family: ground The Isle Navy, the name in The Isle Silver, the frame equal to the ground, the shadow in the ground's own RGB, 29, 42, 59.

## 3. The icon

- Every page on the site carries the full favicon set, without exception,
  exactly these tags pointing at the site's own assets:
  favicon.ico (sizes any); PNG icons at 512, 48, 32 and 16;
  apple-touch-icon at 180; mask-icon safari-pinned-tab.svg with colour
  The Isle Navy; and the theme-color meta, The Isle Navy.
- The icon artwork is the windswept palm, crown The Isle Green, trunk The
  Isle Gold, on a ground of The Isle Navy. The palm sits at the measured
  geometry of the set: on the 512 icon the artwork is 299 by 230 at
  position 105, 141; on the maskable 512 it is 240 by 184 at 135, 164; on
  the 192 it is 113 by 87 at 39, 53; on the apple touch icon 105 by 81 at
  37, 50; on the 150 tile 89 by 68 at 30, 41.
- favicon.png and icon-512.png are byte identical. The two apple touch
  icons, at the root and in assets, are byte identical. The ICO contains
  16, 32 and 48. site.webmanifest and browserconfig.xml carry The Isle
  Navy as theme and tile colour.
- The icon files live in the master file set under icons/ and on the site
  at the root and in /assets/.

## 4. The logo and the artwork

- The anatomy of the mark, always: the crown is The Isle Green, the trunk
  is The Isle Gold, and the island and the text follow the mode. In colour
  artwork, used on light grounds, the island and the text are The Isle
  Navy. In dark mode the island and the text are The Isle Silver, and that
  does not change. The palm's green and gold never change.
- The wordmarks are Playfair Display, weight 500, as master artwork.
  Playfair Display is The Isle's master logo font.
- The colourways are black, colour, silver, white, and silver with a
  colour tree. The silver colourtree form, a silver island and silver
  text under the green crown and gold trunk, is the dark mode form; it
  exists as mark, horizontal and vertical, in PNG and vector.
- The master file set is the authority for the artwork: logo files in
  PNG and vector, in black, colour, silver and white colourways, with the
  inventory, sizes and hashes in its MANIFEST.md. Site copies are issued
  from the masters, never redrawn, never recoloured locally, and verified
  against the masters by hash. The lockups in use on /site, mark-colour
  and mark-dark, are byte identical to the masters (MD5
  59195ad55142f567af7e44052a67e737 and dc2b6beb7aad9199133d01bff3ab1c00).
- No substitution: an image, file or element the user chose or supplied
  is never replaced without asking. If it cannot be used as it stands,
  that is said plainly and asked, never silently worked around.

## 5. Type

- Two faces only, everywhere on 1s1e.com: Playfair Display for display,
  headings and serif lines; Source Sans 3 for body, labels and small
  text. Loaded once with exactly the line given in the style sheet.
  Fallbacks are generic only: Georgia, Times New Roman, serif; Avenir
  Next, Segoe UI, sans-serif.
- The six roles, at their master sizes:
  Display, Playfair Display 500, 64px. Serif line, Playfair Display 500
  italic, 19px. Heading, Playfair Display 500, 34px. Body, Source Sans 3
  400, 17px, line height 1.65. Label, Source Sans 3 600, 11px,
  letterspacing .34em, uppercase. Small, Source Sans 3 400, 10.5px,
  letterspacing .26em.
- Page measures from the settled index: the tagline is the serif line at
  clamp(19px, 2vw, 23px); report headings are labels in bright gold with
  the gold dot; entry titles are Playfair Display 600 at clamp(28px, 3vw,
  36px); entry and report body text is 16.5px at line height 1.5 to 1.55;
  row labels are 10px labels at letterspacing .24em.
- All fonts, sizing, spacing and weights match across the whole group.
  A page does not keep a private typography.

## 6. Spacing and layout

- The index composition is a split: two columns at 46 and 54 fractions,
  no outer frame, the page edge to edge. A single hairline divides the
  panels, inset 52px from the top and 52px from the bottom, never running
  off the screen. On phones the panels stack in order and the divider and
  the chart are hidden.
- Panel measures: left panel padding 52px, 46px, 30px; right panel 34px,
  50px, 78px. The lockup sits at the top of the left panel, width
  min(252px, 72%). Tagline 26px below it, then the tagline rule, 56px
  wide, 1px, in gold at .75 opacity. The report begins 40px below.
- Entries: a grid of a 96px numeral column and the text, gap 8px by 22px,
  padding 30px, 14px, 28px, divided by soft hairlines. The numeral is
  Playfair Display 500 at 58px. The status line under each entry is a
  10.5px label preceded by a 26px gold rule.
- The splash: a full viewport column, no scrolling. Masthead 112px, 78px
  on short screens, 100px on narrow, 74px on both. The wordmark at
  clamp(38px, 6.7vmin, 56px), letterspacing .34em. Below it a short
  centred silver rule, width clamp(140px, 28vw, 240px). The poster stage
  fills the remaining height; the frame's mat padding is clamp(10px,
  3vmin, 28px); the poster viewport is aspect 2 to 3, images cover,
  crossfading at 1.2 seconds, six seconds each, always starting on the
  first poster.
- Nothing on any page requires sideways scrolling, at any width.

## 7. The chart

- The chart is a fragment of an engraved nautical chart, behind the left
  panel of the index, at a whisper: never colliding with text, never
  playful. One coastline, a fine double shore line in gold, entering and
  leaving the edges in the upper third, with a point and a bay, the land
  above it empty. No anchor, no hachures, no headlands, no names or
  labels. Its caption is SOUNDINGS IN FATHOMS.
- Three depth curves follow the shore as true parallel offsets, at +54,
  +108 and +162 units. Soundings are taken along survey lines run off
  the shore, deepening along each line in small steps: 2, 5, 11 and 19
  down the first line, 3, 7, 14 and 23 down the second, 2, 6, 13 and 22
  down the third, 4, 9 and 17 down the last, every figure clear of the
  curves. Sounding figures are Playfair Display, italic, 500, 13px.
- Motion is gentle and always on the water only: the depth curves drift
  on staggered cycles of 13, 17 and 21 seconds, the soundings pulse on
  10, 14 and 18 seconds, the coastline never moves. Under reduced motion
  the chart is still.
- PLATE I stands at the plate's bottom right, Playfair Display 600,
  10.5px, letterspacing .30em, in plate gold. The plate carries no
  frame: it sits unboxed, as the chart sits on the site.

## 8. The report and the entries

- A status report is set in two headed groups. Each heading is a label in
  bright gold, preceded by the gold dot: a 5px circle in gold with a soft
  glow ring. The lead line under the first heading is Playfair Display
  600 at 22px, a date and a time. Rows are label and value pairs on a
  104px label column. A soft hairline divides the groups. The first group
  states the last thing that happened; the second, headed WHAT HAPPENS
  NEXT, states the next thing that will happen, automatically.
- Index entries carry a large pale numeral, a gold eyebrow label, a
  Playfair title, the exact description, and a quiet status line in the
  form OPEN plus its measure. A work in preparation is shown ghosted,
  unlinked, in the same form.

## 9. Rules for creating anything

- This master governs. One approved sample precedes any full round of
  creative work. Alternatives differ in composition, organisation and
  visual world, never in cover imagery alone, and each is built out in
  full. Photography in samples is placeholder; The Isle's own imagery is
  used in finished work.
- Every file created is audited against its source and this master,
  fixed, and re-audited in full until one complete pass finds zero
  defects. Layout is verified in the rendered result, at the size the
  user will see it. A fix is reported as fixed only when verified in the
  place the user will use it.
- Corrections propagate everywhere the old value appears, and each is
  verified in place. Changed files that have been presented are reissued
  under a fresh version name, never silently overwritten.
- Publishing is by git over SSH from the local clones, never by browser
  upload. Deletions are enumerated in the chat first and removed in one
  commit. Nothing is published, sent or deleted without the user's
  approval of the specific item.
- Decisions are put to the user as tappable choices, always, one question
  per message, with the recommendation named in the message.
- Anything created is stripped of metadata. Where an author field is
  required it reads MDS. Nothing created carries any credit or reference
  to its making.
- Every page carries the full favicon set (section 3), the master type
  (section 5) and the master colours (section 2), without exception.

## 10. References

- Precedents, researched November 2026, for the private site's guest
  experience: the Four Seasons Residences app and the Four Seasons app
  itinerary and chat; Aman; Six Senses; Belmond; Cheval Blanc Randheli;
  Waldorf Astoria Residences; and the great private islands, North
  Island, COMO Laucala and Necker Island. The recognition principle: at
  this level there are no points and no tiers; the guest is known.
- Sources of truth, in order: this master; the master file set and its
  MANIFEST.md at ~/workspace/1s1e-splash/the-isle-master-file-set/; the
  live pages at 1s1e.com (the splash, /site/, /ref/, /secure/); the local
  publishing clone at ~/workspace/git/1s1e.github.io.
- The catalogue PDFs linked from /ref are finished print documents with
  their own settled interior design. The site presents them; the site
  palette does not govern their contents.

## 11. Technical requirements

- The site is GitHub Pages, repository 1s1e/1s1e.github.io, branch main,
  published by git over SSH with the repository's dedicated key.
- Visitor counting is GoatCounter, one counter per website; this site's
  counter is 1s1e, reported only on new activity.
- robots.txt allows the landing page and its /assets/ only.
- Locked pages are encrypted with AES-256-GCM, the key derived by
  PBKDF2-SHA256 at 250,000 iterations, decrypted in the visitor's browser
  by Web Crypto. Passwords are never published, filed or recorded.
- Pages open in dark mode where a toggle exists, and the toggle switches
  the whole page. Both modes are always built and always checked.

## 12. The switch

- The light and dark switch is one form everywhere: the slider from
  /ref. A pill, 96 by 36px, fully rounded, on a Deep ground at 94
  percent, with a 1px gold line border that brightens to The Isle Gold
  on hover. A sun glyph stands at the left, 11px in, and a moon glyph
  at the right, both in The Isle Gold at 85 percent.
- The knob is 44 by 26px, fully rounded, in The Isle Gold, carrying the
  glyph of the mode in use in Deep. It rests on the side of the mode in
  use and slides 42px to change, on a .25 second ease. The switch is a
  real switch, role switch with its checked state carried for
  assistive technology, and its focus outline is The Isle Gold.
- The standard governs the switch's form. Where it sits is each page's
  own furniture: on /ref it docks at the top right in the reader and
  rests at the bottom right on the home page.
