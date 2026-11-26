# THE ISLE · MASTER CHANGE LOG

## Page Silver darkened one step (Nov 26, 2026)

On the user's ruling, Page Silver darkens one step, from #6e6e6e to #686868, RGB 104 104 104, CMYK 0 0 0 59. At #6e6e6e the light accent measured 4.18 to 1 on The Isle Ivory, below the body text floor of 4.5 to 1, while carrying small text site-wide in light mode: volume labels, kickers, report headings and panel labels. The new step is the closest darker value that clears the floor with a working margin, measuring 4.57 to 1 on The Isle Ivory and 4.81 to 1 on Light Tint. The master style sheet's light accent tokens and every use of the colour follow, as do the tokens file, both palettes and the swatch sheet, and section 2 of the guide records the new value and its measured ratios. The Isle Silver #C0C0C0 is unchanged, and dark mode is untouched.

## Small secondary text on light takes Soft Ink (Nov 26, 2026)

On the user's ruling, small secondary text in light mode no longer stands in Dim Ink, which measures 3.4 to 1 on The Isle Ivory and is a large text pairing only. In the master style sheet, the small text that took the dim step now takes a small-text step of its own, resolving to Ivory Dim on dark and to Soft Ink on light, so every dark value is unchanged and on light the text stands in Soft Ink at 7.57 to 1. The change runs through The Build's report rows, foot line and status lines, the Lot Viewer's and the Shadow Study's panel labels, readouts and hints, Permits & Documents' back link, glance and facts labels, section navigation, table heads and foot line, the secure lock screen's password label, the style page's fault and role notes, and the 3D Model panel's muted text throughout. Dim Ink itself is unchanged as a colour and keeps its places at large sizes on light. Section 2 of the guide states the practice in its colour rows and its pairings.

## Hairline borders recorded as decorative (Nov 26, 2026)

On the user's ruling, section 2 of the guide now records the standing practice for the hairline borders. The contrast floors govern text and the borders that define a control; the settled hairline borders, silver at low alpha dividing and edging the panels, are decorative and stand outside the floor. The ruling follows the measured sample put to the user, in which the borders strengthened to the floor redraw the panels' character in light mode. No page changes: the entry records the standard, and the contrast sweep's hairline family stands under this exception from this date.

## One style sheet for the whole site (Nov 26, 2026)

On the user's direction, the site's styling is consolidated into the one master style sheet. Every page's rules now stand in the-isle-master.css itself, in a block of their own, scoped to that page at unchanged specificity, and the pages link the master alone. A folder keeps a sheet of its own only for a genuine exception, and the sheet holds only the exception: the Lot Viewer and the Shadow Study keep their grid button sizes, the Shadow Study its sun buttons' two-line form, the two viewers their on-state inversion in light, and the 404 its own system font stack. The sheets that carried ordinary styling, the splash's, The Build's, Permits & Documents', Reference Catalogues', the secure page's, the style page's and the 3D Model's two, are retired. Section 9 of the guide is amended to the single sheet model and section 11 corrected to match. No computed value changes anywhere: the consolidation moved rules, it did not restyle anything, verified by capture pairs in WebKit at both iPad sizes in both modes, pixel identical apart from the chart's animation phase, the live clock and one ground texture's loading state, and by computed style checks on every page.
## Silver becomes the site accent, inverted in light (Nov 26, 2026)

On the user's direction, silver replaces gold as the site accent on every page. The Isle Silver #C0C0C0 is the accent on dark grounds and Page Silver #6e6e6e, a new seventeenth colour recorded in section 2 as The Isle Silver's page step for light grounds at 4.18 to 1 on The Isle Ivory, is the accent on light grounds. The master style sheet's accent tokens and its gold rules for the switch, the buttons, the links and the chart now carry silver at the same opacities and in the same roles, and every section sheet follows. The Isle Gold remains inside the artwork only: the palm's trunk, the catalogue covers' own lettering and the posters. With the accent, the inversion becomes the standard form, stated in section 2: in light mode a page turns over, its bands and its footer exchanging ground and ink with their dark form, as the Reference Catalogues hero band and footer now do. The guide's sections 2, 5, 6, 7, 8, 10 and 12 are amended to state silver where they stated gold as a page accent, the tokens, both palettes and the swatch sheet carry all seventeen colours, and the book is rebuilt at 28 pages.
## The 3D Model menu published; Project Home lineless (Nov 25, 2026)

On the user's approval, the 3D Model page's panel takes its settled custom menu, built through the sample rounds in this chat and published to /build/3d/. The panel stands at the standard 308px. Its top row carries only Project Home and the Close ×, each standing alone; beneath it a text row names the five panes, House, Sun, Ground, Layers and Facts, the active entry in Page Gold with a gold underline, and each pane opens directly into its controls, with no repeated pane label. In the Layers pane, Show All Layers and Hide All Layers pair on one row at 11.5px, the size set by measurement so both labels hold one line, with Reset to Defaults at the full width in the standard form beneath them. The theme switch stands alone in its own row at the foot of the panel, 58px, pinned in every pane, with no line above it. Project Home is lineless: section 12 now records that the control carries no border, no box and no background, the house glyph alone the button. In the same pass the House pane's toggle and action grids are brought onto the pane's track, their second columns trimmed 1px, so every fitted control measures to the one grid.
## The Shadow Study sun buttons take a two-line form (Nov 24, 2026)

On the user's ruling, the Shadow Study's three sun buttons, Sunrise, Solar Noon and Sunset, take a designed two-line form inside the grid button exception recorded in section 12 of the guide. Each carries its name on the first line and its time on the second, at the grid's 13px, letter-spacing 0.05em and horizontal padding of 12px, so the three stand at one uniform height; Sunset, which spans the full width of the grid, carries the same form. The times remain live: the page's script writes each time into its own element, and clicking a sun button still jumps the study to that sun time. The other grid buttons stay on one line, unchanged.
## A grid button exception for the Lot Viewer and Shadow Study (Nov 24, 2026)

On the user’s ruling, one exception to the button form is recorded in section 12 of the guide. The panel grid buttons of the Lot Viewer and the Shadow Study carry a smaller size, so their longest labels sit on one line: 10.5px on the Lot Viewer and 13px on the Shadow Study, letter-spacing 0.05em and horizontal padding of 12px. The sizes were set by measurement in WebKit at both iPad sizes, the Lot Viewer’s longest label Show All Layers and the Shadow Study’s Shortest Day each on one line with room to spare. Every other part of the form is unchanged: the weight, the capitals, the colours, the border, the sharp corners, the vertical padding and the 44px minimum height. The exception lives in the two section sheets only.
## The 3D Model joins The Build (Nov 24, 2026)

On the user's ruling, the 3D Model takes the fourth place on The Build index, the place held ghosted for the next work: 04, eyebrow THE FORM, title 3D Model, to /build/3d/, "The house as a model: its form, rooms and grounds, turned and viewed from every side.", OPEN · THE WHOLE HOUSE. Section 8 of the guide now states the four entries in full. The model's own page is brought to the guide: it links the master style sheet first and its own sheets stand as the section exception in its folder, it carries the full favicon set, the settled switch with the theme held across pages, and a Project Home control returning to The Build; it opens in dark, and its buttons take the standard form. The model itself is untouched.
## The button standard reverted to the /ref form (Nov 24, 2026)

On the user’s ruling, the button standard reverts to the form the Reference Catalogues carried before the November 22, 2026 alignment, and that form is the accepted standard everywhere. The button is Source Sans 3 at 14.5px, weight 700, letterspaced at 0.1em, its labels written in Title Case and set in capitals by the form, padding 14px by 22px, sharp corners, a 1px border, an icon at 17px with a 10px gap and a 44px minimum height. Off, the button is transparent with a gold border and fills with that gold on hover; on, it fills with The Isle Navy and lifts to Panel on hover. The old form’s two tones outside the sixteen are mapped into the palette: its ivory text to The Isle Ivory and its hover ink to Deep. The field’s border is now stated on its own terms, Page Gold at 30 percent in dark and 38 percent in light. Section 12 of the guide, the master style sheet and every page’s buttons follow; the switch is untouched.
## US Letter (Nov 23, 2026)

On the user’s ruling, the document standard in section 10 and the book drawn from it move from A4 to US Letter, 612 by 792pt. The column widens to 500pt; the colour table’s columns are re-derived in the same proportions, so the table fills the wider measure and its right edge lands on the column edge; the cover’s geometry is re-derived in proportion, the mark 190pt wide, centred on the page width, its centre at 575.7pt from the foot, the title baselines at 425.2pt and 380.1pt. The margins, the running foot and every type size stand as settled. The book stands at 27 pages. Under the wording licence, two bullets in section 6 are tightened so the section’s closing bullet does not drop to a page by itself: the hairline in the index bullet now stands “inset 52px from top and bottom”, and in the panel measures bullet the lockup “sits atop the left panel” and the tagline rule stands at “56px by 1px”. Section 6 stands on one page. No other wording is changed; section 11’s closing bullet falls with company on its page.
## Section 10 amended to the running foot (Nov 23, 2026)

On the user’s ruling, section 10’s document standard is amended to the book’s own settled form. A document is A4, with margins of 56pt at the sides and the foot and 44pt at the top; it carries no running head, and at its foot one line in the label form names the document “THE ISLE · <TITLE>” at the left of the column, with the folio at the right. The running head form named before is replaced. The book is rebuilt from the amended guide.
## Wording adjusted against stray tails (Nov 23, 2026)

On the user’s direction, wording is adjusted inside sections 6, 11 and 12 so that a closing bullet does not drop to a page by itself. In section 6, the catalogue bullet gives up one word, “artwork”, and the closing bullet pulls back onto the section’s own page: section 6 stands on one page. In section 12, the Project Home bullet and the touch bullet are each tightened by a phrase, and the closing link bullet pulls back onto the section’s second page. Section 11’s closing bullet stands as it was: that section’s wording is already at its tightest, and the four lines the pull-back needs cannot be freed without dropping settled substance, so no wording is changed there. The book stands at 26 pages.
## The book’s page furniture settled (Nov 23, 2026)

The style guide book is rebuilt in its settled page furniture, on the user’s approval of the sample built to that form. The running head moves to the foot of the page: one line in Page Gold light, in the label form, carries “THE ISLE · <SECTION TITLE>” at the left of the column and the folio at the right of the column, and nothing stands at the top of the page; the foot line, at 8pt, is the only text in the book under 10pt. The body is lifted on the page, the content frame’s top at 44pt from the page’s top edge. Section 9’s two lead-ins carry their colons, as the guide has them. The book stands at 28 pages and replaces the earlier book at its fixed name in both master file sets.
## The master sheet completed (Nov 23, 2026)

The master style sheet now carries the four rules of section 12 that it lacked, in the guide’s own settled forms, folded in from the pages that held them. The field form: a field stands at least 44px tall, in Source Sans 3 at 17px, on Panel in dark and Light Tint in light, with a 1px border of Page Gold at the button’s resting percentage, curved corners of 6px and padding 8px by 12px, and on focus the border brightens to Page Gold with the 2px gold focus outline. The text link: a link inside text stands in Page Gold by the mode and brightens on hover. The switch’s knob carries the glyph of the mode in use, in Deep, centred in the knob, the sun and moon swapping with the mode. And the button rule carries the reset anchors need, its text decoration removed and its content centred, so a button stands the same whether it is a button or a link. The section sheets are relieved of their copies: the secure lock screen’s field, the permits pages’ text links and the knob glyph machinery of The Build, Reference Catalogues and Permits & Documents now come from the master alone. What a page keeps is only its own: the Lot Viewer and the Shadow Study keep their knob glyph block in their own form, Reference Catalogues keeps its reader fields and its buttons’ colour ease, and the Shadow Study’s date field stands as ruled.
## The book rebuilt (Nov 23, 2026)

The style guide book is rebuilt from a written spec, on the user’s approval of a sample built to that spec. The cover carries the mark in its silver with colour tree colourway, the island and waterline in The Isle Silver, the palm’s crown in The Isle Green and its trunk in The Isle Gold, and no domain line: the cover carries the mark and its two title lines, and nothing else. The section titles stand in their shortened form, the word The removed from the head of each. The text sizes follow the user’s ruling: the body at 13pt, and nothing under 10pt but the running head and the folio. The rebuilt book stands at 30 pages and replaces the earlier book at its fixed name in both master file sets.
## Section titles shortened (Nov 23, 2026)

On the user’s ruling, the word The is removed from the head of every section title, so each title stands in the one form, as Type and References already did. The twelve titles now read: Name and the words; Colours; Icon; Logo and the artwork; Type; Spacing and layout; Chart; Report and the entries; Rules for creating anything; References; Technical standards; Switch and the buttons. The word is removed from the titles only: the house name, The Isle, is never altered, and every other use stands unchanged. The book follows in the wholesale rebuild by the new builder, and the old book is not rebuilt.
## The cover mark settled (Nov 23, 2026)

On the user’s ruling, the mark on a cover stands in its silver with colour tree colourway: the island and waterline in The Isle Silver, the palm’s crown in The Isle Green and its trunk in The Isle Gold. Section 10’s document standard now names that colourway, in place of the silver colourway named before. In the same ruling, the domain line comes off the cover: a cover carries the mark and its title, and nothing else. The sample book’s cover is rebuilt to both rulings; the book itself follows in the wholesale rebuild by the new builder, and the old book is not rebuilt.
## No page hard-codes anything (Nov 23, 2026)

On the user’s ruling, no page hard-codes anything. The master style sheet is published at /assets/the-isle-master.css, byte identical to the master file set’s the-isle-master.css, and every page links it and drops its own copies of the shared layer: the colour variables, the font stacks and type roles, the switch, the button and field forms, and the link colours. Each page keeps only its own layout and what is specific to it. An exception to the shared layer is never written into a page: it lives in that section’s own folder, as the section’s style sheet, layered on the master. Images follow the same rule: one version of each image at one address, referenced by every page that uses it, so an update lands universally, and an image specific to a section lives in that section’s folder. Section 9 of the guide and the book now carries the rule, and section 11 the published sheet.
## The switch glyphs recorded (Nov 23, 2026)

On the user’s ruling, the symbol drawing specification in section 12 now records the switch’s sun and moon at stroke 1.8: drawn small inside the pill, they are the one exception to the symbols’ stroke of 2. The specification now states the drawing as it stands; the pages are unchanged.
## The professional form completed (Nov 23, 2026)

Four elements of the full professional form are added, on the user’s ruling. Section 2 now tabulates a CMYK build for each of the sixteen, computed from the master values by the standard conversion, and section 10’s print standard points at the tabulated builds; the tokens carry RGB and CMYK beside each hex. The book gains two shown misuse plates: Plate A, in section 4, the lockup stretched, squashed, recoloured outside the colourways, set on a ground that fights it and tilted, and the palm lifted out and set alone; Plate B, in section 2, gold given a field, green given a surface, a colour outside the sixteen given a ground, and body text set below the contrast floor. Section 12 gains the symbol drawing specification, as drawn on /ref: the 24 by 24 grid, stroke 2, round caps and round joins, currentColor, no fill. Section 1 gains worked voice examples, three subjects set the house’s way and then the way the house never speaks. The foundation statement and the font provenance are not added, by the same ruling.
## Project Home settled (Nov 23, 2026)

On the user's ruling, section 12 now names the Project Home control: the way back to The Build index is a control carrying the home glyph alone, the house of the master symbol list, with no words, the glyph at 20px, keeping its name, Project Home, for assistive technology. The Lot Viewer and the Shadow Study already carry it in this form; the permits pages follow in their own chat.
## The lamplight removed (Nov 23, 2026)

On the user's ruling, the lamplight is removed from The Build page and from the masters: the mention in section 6 of the guide and in the book, the --lamp token in the style sheet and in the tokens, in both modes. The sample built for the decision showed the glow made no visible difference to the page, one to three units per channel at its centre. With it gone, the sixteen are again the whole palette, with no unaccounted values standing anywhere in the masters.
## Masters corrections (Nov 22, 2026)

Five corrections so the masters agree with the settled standards. The style sheet's button rule carries its settled minimum height of 44px again. The tokens file is completed with the clear space measures, the minimum sizes and the contrast floor. The book's section 8 entry specimens carry their destinations again, and its section 9 sub-headings, How things are created and What is required of anything created, are restored. The Title Case restored entry below corrects its own wording: the entries it speaks of stand below it, this file being newest first.
## Title Case restored (Nov 22, 2026)

On the user's word, the capitalised The is reversed: buttons and titles stand in ordinary Title Case, and the guide and the book say so without the exception. The /ref hero button reads Download the Full Catalogue again. The two entries below stand as the history of the evening's rulings.
## The book brought to the guide in full (Nov 22, 2026)

A full comparison of the book against the guide found the book carrying less than the guide in sixteen places: sentences of the register, the roles of the working colours, the measured contrast pairings, the end of the proportion rule, the colour naming rule, the manifest sentence, the font load line and fallbacks, the lamplight token and the poster viewport, the shore specification, the plate mark's colour values, the motion values, the second and third entries, the not settled clause, the running head and cover forms, and the eleventh section's name. The missing substance is restored, in the guide's words or the book's parallel form, and the book now agrees with the guide section for section.
## The mark and the element (Nov 22, 2026)

Section 4 now carries the full treatment of the mark and of the element, on the user's direction. The mark standing alone keeps clear space of half its own height (the lockup keeps three quarters; both settled from samples the same evening). The palm's scope is settled: its four places, and beyond them it is not decoration, save that in rare circumstances it may serve as an ornament, as the exception.
## Title Case corrected (Nov 22, 2026)

The user's ruling is narrower than the entry above: only The is capitalised wherever it stands; the other small words follow ordinary Title Case. The guide and the book are corrected to say exactly that, and Link To This Page on /ref is restored to Link to This Page. Download The Full Catalogue stands.
## Title Case refined (Nov 22, 2026)

On the user's word, the house's Title Case is stated in full in sections 1 and 12: every word capitalised, articles and prepositions included. The /ref labels were corrected to match the same evening: Download The Full Catalogue and Link To This Page.
## The house email settled (Nov 22, 2026)

On the user's word, section 10 gains a Correspondence subsection: a personal closing takes one of two forms, both allowed, The Isle with M & D Silver beneath it, or The Isle alone; and house email, from the house's own address, is signed The Isle Staff, one line in Title Case, standing as the whole closing. With this entry, all nine gaps found on the full re-read are written into the guide and the book.
## Print colour settled (Nov 22, 2026)

On the user's word, section 10 now carries the print colour standard: the sixteen are built as CMYK from the master values and proofed against them on the stock in use, and The Isle Gold and The Isle Silver print as flat colour, never as metallic foil. Of the nine gaps, one remains open: the house email, awaiting the user's word on its closing.
## Seven standards added (Nov 22, 2026)

On the user's word, seven gaps found on a full re-read were written into the guide and the book: units and numbers (section 1), the artwork off the site (section 4), sound (section 7), records in rows (section 8), image files (section 10), form fields and links in text (section 12). Two more, print colour and the house email, await the user's word on their open values.
## The names taken out of the guide (Nov 22, 2026)

On the user's word, the part names passage added to section 1 earlier this evening is removed from the guide and the book: a roster of current names is documentation, not standard. The naming rules stay in section 1. No separate names list is kept; the settled names live on the pages themselves, and the naming review stands in the change log entry above.
## The names settled (Nov 22, 2026)

Every name on the site reviewed with the user, five at a time. Kept: The Isle, Lot Viewer, Shadow Study, Reference Catalogues, Secure, Style Guide, Page Not Found, The Next Work, THE LAST CHECK, WHAT HAPPENS NEXT, SOUNDINGS IN FATHOMS, PLATE I, the three volumes and the Appendix, the section names, Test 001 to 003, and the ten poster titles. Renamed: Permits becomes Permits & Documents, and Site Index becomes The Build, which moves to /build/ with the whole tree beneath it (lot, shadow, permits). The part names and the new addresses are written into section 1 of the guide and section 8's entries corrected; the pages themselves move in the alignment round.
## Imagery direction settled (Nov 22, 2026)

The guide's imagery standard, settled by samples: the house in its own photography; curated outside photographs where the subject is inspiration; artwork where artwork is the subject; no stock imagery, and no other house presented as The Isle. Written into section 10 of the guide and the book.
## November 22, 2026

- Colour proportions settled (Nov 22, 2026), on the user's
  decision from three samples of the real index page: the
  proportions as they stand. Section 2 of the guide now
  states the proportion rule, the ground carrying the page
  and gold reserved to labels, rules, dots, the knob and
  the coastline, never a field. The book carries it in full.
- The touch minimum settled (Nov 22, 2026), on the user's
  decision: every control stands at least 44px tall, the
  Apple standard. The button gains a 44px minimum height and
  the switch grows in proportion to 117 by 44px, its knob
  54 by 32px sliding 51px. Guide, style sheet and tokens
  updated.
- Symbols refined (Nov 22, 2026), on the user's decisions:
  four symbols stand alone, replacing the words, Menu, Close,
  Search and Settings, each keeping its name for assistive
  technology; and state pairs are a rule, a control carrying
  the symbol of the state it is in, Menu and Close one pair,
  Play and Pause one pair, the expand and collapse chevrons
  one pair. Section 12 of the guide and the book carry both.
- A master symbol list added to the guide (Nov 22, 2026), on
  the user's decision: section 12 now names every approved
  button symbol, from the actions in use, and a new action
  joins the list only when its symbol is genuinely
  established. The book carries the list in full.
- The contrast floor settled (Nov 22, 2026), from measured
  samples with choices: text pairings meet 4.5 to 1 for body
  text and 3 to 1 for large text, and a pairing short of the
  body floor is reserved for large text and labels. Dim Ink
  and Page Gold light on The Isle Ivory are large text
  pairings only. Section 2 of the guide and the book carry
  the floor.
- The logo's parts named exactly, and its minimum sizes
  settled (Nov 22, 2026), on the user's correction: the logo
  is the island, the palm and the words together; the mark is
  the island and the palm without the words; the palm alone
  is an element, never the logo. Minimum sizes: the
  horizontal lockup 160px wide, the vertical lockup 90px
  tall, the mark 24px tall, with their print equivalents.
  Section 4 of the guide and the book carry the names and the
  sizes, and the clear space measure is named by the mark.
- The clear space adjusted (Nov 22, 2026): the user asked to
  try three quarters, saw a finer set of samples, and settled
  it at three quarters of the height of the palm mark,
  replacing the half settled earlier the same evening.
  Section 4 of the guide and the book carry the new measure.
- The logo's clear space settled (Nov 22, 2026), from side by
  side samples with choices: on all sides of a lockup, half
  the height of the palm mark in the lockup, and nothing
  stands inside it. Written into section 4 of the guide and
  the book.
- The tokens file completed (Nov 22, 2026), on the user's
  decision: the-isle-tokens.json now carries the full token
  set, the colours, the type faces and roles, the complete
  per mode variable tables taken from the style sheet, the
  layout measures, the switch and the button, and the motion
  cycles, so the machine readable format holds the whole
  standard on its own.
- Additions to the guide (Nov 22, 2026), approved by the user and
  drafted into the guide and the book: words in use in section 1;
  the colours in use, with their settled pairings, in section 2;
  the logo's misuse rules in section 4; motion as a general
  manner at the end of section 7; file and asset discipline with
  a documents and print passage in section 10; the checking
  sizes, the visible focus and alt text requirements in
  section 9; and the guide's own amendment rule in section 10.
  Unsettled values were drafted at first as proposals, then
  removed the same evening on the user's instruction: what is
  not settled is brought to him with side by side visual samples
  for a decision with choices, never written in as text. The
  clear space, the minimum sizes, the colour proportions, the
  contrast floor, the imagery direction, the touch target size
  and the site part names await those sample decisions and stand
  nowhere in the guide until he makes them.
- Verification pass on the recast (Nov 22, 2026): section 6 of
  the guide confirmed to carry the catalogue manner and the
  poster preload requirement, so the guide and the book agree in
  full, and the book's entry specimen now shows the entry's full
  status, OPEN · 18 LAYERS.
- The guide recast as a prescriptive standard (Nov 22, 2026), at
  the user's direction: the guide is a standard for others to
  follow when creating anything for The Isle, across pages,
  projects, websites and print, and it now reads that way
  throughout. Every section, document, image and item is
  described and expressed as the standard for that item, so
  continuity holds everywhere; instances that are themselves the
  standard, the entries' exact copy, the poster set and its
  order, the refusal sentence, are stated in full. Section 9 now
  carries the creation rules and the requirements complete and
  explicit, how things are created and what is required of
  anything created, and section 2 states the ground rule as a
  check on every page. Out of the guide: verification records
  and hashes, audit narration, temporary page states, chat
  process and history, which lives here only. The book was
  brought to the same recast and re-read page by page.
- Third audit of the guide, run from scratch at the user's
  direction (Nov 22, 2026): a fresh extraction of the whole
  transcript against the guide found fourteen gaps and four
  statements without basis. Now recorded: the report's first
  heading, THE LAST CHECK; The Isle as a single residence with its
  named rooms; the full register, mysterious, complicated and
  robust, ultra in tropical luxury, refined elegance, the most
  discerning guest; the closed composition, a login page followed
  by a scroll of links; /ref's hand counting; the locked page image
  rule; the verification method; the splash's closed extras and its
  poster preload; /ref's own type measures; the index's three
  entries word for word; the /style page's temporary standing and
  its seal footer; and the Bear handoff that confirmation triggers.
  Corrected: section 3's manifest sentence now names /ref as well;
  Terra's role is stated as it stands, a tone held in the splash's
  tokens; PLATE I's colour is named as Page Gold with its values;
  the fallback stacks are stated as the style sheet carries them;
  and the button's dark off border is given its value, Page Gold
  dark at 30 percent, matching the picked sample and the style
  sheet. The book was amended on the same points and re-read page
  by page. The secure zone's build template was corrected in three
  places, its title, its mask colour, which still carried the
  retired blue, and its missing theme colour; the live zone page
  itself still carries the old title and no theme colour, awaiting
  the user's word.
- Second audit of the guide, run from scratch at the user's
  direction (Nov 22, 2026): thirteen further gaps found and closed.
  The splash's poster set and order, the lamplight, the left panel's
  foot, the splash frame's lift and the wordmark's set width, the
  small icons' measured geometry, the 404's composition and the
  lockup's waterline, /ref's hero and footer manner, the lock
  screen's form and its refusal sentence, page titles, the chart
  caption's place and the plate's viewBox, the report's universal
  check, the switch's remembered choice, and the GoatCounter
  locations. Three statements corrected as false: the /site lockups'
  identity (re-issued from the vertical masters at 1100 by 497 in
  The Isle Navy and Silver, and published), the font load line (the
  standard for text pages, the splash's exception stated), and the
  switch's border value, with the style sheet's switch brought to
  the same values. The master set's ICO was stale on the retired
  blue and was replaced with the served file; /ref's static theme
  colour was set to The Isle Navy; the index font load was brought
  to the master line; the splash fallback stack to the guide's
  generics. Both MANIFEST.md files were corrected entry by entry
  until a checker pass found zero mismatches. The book was rebuilt
  at fourteen pages: sixteen colours, the /ref exception and the
  ground rule in section 11, and a new section 12 page.
- The from-scratch audit of the guide against the whole chat
  (Nov 22, 2026): every settlement re-extracted from the transcript
  and checked against the masters. Corrected: section 7 now places
  the chart in its own block below the report, never behind text;
  section 3 states the theme colour follows the mode; section 11
  records that /ref follows the visitor's remembered choice or their
  system preference; section 2 states Deep's true roles and Page
  Gold's; section 1 records the house line as given on Nov 16, 2026;
  section 4 states the site's name treatments are artwork, never live
  text; section 10 states how the master documents are kept. The
  style sheet's dark field colour is The Isle Navy, its header names
  the guide by its settled title, and the tokens file is named for
  the style guide. The ASE palette and the swatch sheet are
  regenerated at sixteen colours, the sheet titled for the style
  guide and printed on The Isle Ivory. Section 9 now also states
  the true samples rule settled the same day.

- The ground rule written into the book (Nov 22, 2026): the browser
  bars take the page's ground, so in each mode the theme colour, the
  body ground and the page gradient's first and last stops are the one
  ground colour. Found on the site index, whose gradient ended in Deep
  and whose body ground stood at Deep while its theme colour stood at
  navy, so the phone's bars showed a seam first at the top and then at
  the foot. The index is corrected, and section 11 of the guide and
  the master style sheet now carry the rule, with the whole length
  check it requires.


- The pages were matched to this book, at the user's direction.
  Light Ground #faf7ee retired and folded to The Isle Ivory, which is
  now the light page ground across the group; the set stands at
  sixteen colours. The button settlement was completed the same
  evening: curved corners at 6px, Title Case at weight 600, padding
  8px by 12px, and an icon only where the action has a true symbol.

- The button style was picked and section 12 completed as The
  switch and the buttons: the Panel Button, sample A of six shown in
  both states and both modes, the furniture of the Lot Viewer and the
  Shadow Study. Its measures and both states are specified in the
  guide and carried in the style sheet.

- The switch was made part of the standard, at the user's
  direction: one form everywhere, the pill slider from /ref, specified
  in section 12 of the guide and carried in the style sheet. A button
  style is directed as well and joins the same section when it is
  picked.

- The chart plate was redrawn as Survey Lines, at the user's pick: a
  shore with a point and a bay, soundings taken along survey lines run
  off the shore, deepening line by line. The plate is unboxed
  everywhere. Book page 9, the guide source and the style page carry
  the one plate; the earlier grid plate and the scattered plate are
  superseded.
The history of the master documents, kept separately from them. The masters themselves always read as the present truth; every change they have ever carried is recorded here, newest first.

## November 22, 2026

- The Absolute Master was renamed The Style Guide, at the user's direction. The book and its source document carry the new name, The-Isle-Style-Guide.pdf and THE-ISLE-STYLE-GUIDE.md; their contents are unchanged by the rename.

- The palette was simplified, from twenty six named colours to seventeen, at the user's direction. The five masters stand. Retired values folded to their nearest kept step: Raised #2a405e to Panel #22344a; Far #121c28, Field #0d141d and Frame #131e2b to Deep #152130; Bright Gold on dark #d8bc7d to The Isle Gold #c9ab72; Bright Gold on light #8a6a2a to Page Gold light #a07f3a; Light Curve #2c3e57 to Soft Ink #3c4763; the chart's coast #d8bc7d to The Isle Gold; the chart's curves and figures #e9dfc6 to The Isle Ivory #f0e8d5. The style sheet, tokens, palettes, swatch sheet and this book were updated to match, and the live site index and the /ref theme colour were moved to the kept steps (commit f1b3013, verified live by hash).
- The master documents were established on their enduring basis: a small set of documents at fixed names in this set, one canonical copy of each, updated in place as things change. This log was separated from them the same day, at the user's direction.
- The silver with a colour tree colourway was completed across the mark, horizontal and vertical lockups, in PNG and vector, and named in the master as the dark mode form of the logo.
- The swatch sheet and the master book were placed inside the master file set, in the swatches and documents folders.
- The master colours took their house names: The Isle Navy #1d2a3b, The Isle Green #46936a, The Isle Gold #c9ab72, The Isle Silver #C0C0C0, The Isle Ivory #f0e8d5.
- The one common blue was selected: #1d2a3b, over the master blue #1b2a4a and the Night Chart blue #101c2c, which step back to working shades. The colour lockups in the master set were recoloured to it, the icon set regenerated on it, and the splash, /ref, the 404 page and the secure zone moved to it.
