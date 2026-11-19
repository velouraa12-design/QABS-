# QABS Visual Design Standard

## Core rule

Let the layout explain itself. Avoid explanatory filler, redundant captions, secondary labels, and repeated helper text when grouping, alignment, hierarchy, icons, field labels, or the control itself already communicates the meaning.

## Interface requirements

- Use one clear page title and a primary action; do not add a second descriptive heading that repeats the same idea.
- Prefer recognizable section grouping, spacing, cards, progress, status indicators, and visual relationships over paragraphs explaining the interface.
- Keep labels short, specific, and action-oriented. A label should identify the field or action, not narrate how to use it.
- Remove redundant subtitles such as "manage your ..." when the page title and content already make the purpose obvious.
- Keep helper text only when it prevents a real mistake, explains a requirement, or discloses a material limitation. Put it next to the relevant control and keep it to one short sentence.
- Show important constraints at the point of action (for example, a disabled payment action must communicate why); never hide safety, legal, pricing, or availability disclosures merely to make the screen cleaner.
- Use progressive disclosure for advanced settings and infrequent actions. Do not expose every explanation or option at once.
- Use consistent spacing, alignment, typography, contrast, and component patterns across desktop and mobile. The visual hierarchy must survive RTL Arabic and LTR English.
- Prefer icons only for familiar actions; pair ambiguous icons with concise accessible names. Preserve keyboard focus, accessible names, and screen-reader context even when visible copy is reduced.
- Empty, loading, error, and success states should be communicated through clear visual state and one concise message, not a paragraph.
- Do not use decorative labels, badges, or status chips that add no decision-making value.

## Review gate

Before merging a screen, review it at mobile and desktop widths in Arabic and English. Remove every visible phrase that repeats information already conveyed by the layout. Keep only text needed for comprehension, accessibility, safety, or a user decision. Never replace necessary accessibility text with visual-only styling.
