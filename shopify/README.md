# ROVIA PDP — Shopify install

## Why the buttons didn't work

The markup and CSS were fine. The problem was that the JavaScript never executed.

When HTML is inserted with `innerHTML` — which is what page-builder custom-HTML
blocks, product description fields, and rich-text editors all do — the HTML spec
marks any `script` element inside it as **already started**, so the browser
parses it into the DOM but never runs it. The script tag is right there when you
inspect the page, which is what makes this confusing to debug. Nothing throws,
nothing logs, every button is simply inert.

Verified against the original code (`control.js` in the working notes):

```
script tag present in DOM : true
price after bundle click  : $99.00   (expected $237 if JS ran)
cart count after add      : 0        (expected 1 if JS ran)
```

Two secondary issues made it fragile even where the script *did* run:

1. **Unguarded lookups.** `$('[data-buy]').addEventListener(...)` and
   `$('[data-cart-open]').addEventListener(...)` throw a `TypeError` if a
   sanitizer strips any one element. Everything registered after that line —
   including the final `renderCart()` and `selectBundle()` — never runs.
2. **Listeners bound once to specific nodes.** Shopify's theme editor re-renders
   sections on every settings change, replacing the DOM and discarding the
   bindings. The cart drawer had the same issue internally: it rebound its own
   buttons after each re-render, which worked, but nothing else did.

## What changed

- **Event delegation.** One `click` listener on `document`, dispatching by
  `closest()`. It does not care when the markup appears, re-renders, or is
  replaced — so it survives innerHTML injection, section reloads, and builders.
- **Every lookup guarded.** No single missing element can kill the rest.
- **Re-init hooks.** `DOMContentLoaded`, `shopify:section:load`, and a
  `MutationObserver` that boots as soon as the markup shows up.
- **Bind-once flag** (`window.__ROVIA_PDP_BOUND__`) so duplicated markup or a
  double-loaded script cannot double-fire handlers.
- **`type="button"` on every button** — without it, a button inside a form
  submits the page on click.
- **Bundle rows are now real `button` elements** instead of clickable `div`s, so
  they are keyboard- and screen-reader-operable.
- **Lightbox close button fixed.** It was positioned `top:-42px` relative to its
  box, which put it off-screen on short viewports — the video could not be
  closed. It is now `position:fixed` in the overlay corner, and the box is
  height-constrained so it never overflows.
- Focus-visible outlines and a `prefers-reduced-motion` block.

## Install (recommended: theme section)

1. **Online Store → Themes → ⋯ → Edit code**
2. **Sections → Add a new section**, name it `rovia-pdp`
3. Delete the generated contents, paste in `sections/rovia-pdp.liquid`, **Save**
4. **Customize →** pick the template **→ Add section → ROVIA PDP**

Scripts in a `.liquid` section file are rendered server-side as part of the
document, so the browser parses and runs them normally.

## If you must use a page builder

Split the file:

- Paste everything **except** the `script` block into the builder's HTML element.
- Paste the `script` block into **theme.liquid**, just before `</body>`.

The delegated handlers bind to `document` up front and pick up the markup
whenever the builder injects it. This is tested — scenario B in `test.js`.

## Not wired to real checkout

The cart is a front-end demo: it tracks state in a JS array and the Checkout
button only shows a toast. There are no products in this store yet, so there is
nothing to add. To make it real, create the product, then POST variant IDs to
`/cart/add.js` and redirect to `/checkout`.
