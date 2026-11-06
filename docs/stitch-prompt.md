# Stitch prompt for Foody

Paste the design system first, then paste one screen. Ask Stitch to keep the same system on every later screen.

## Design system

Design a mobile-first web app called Foody, then show how the same screens stretch onto a laptop. Foody is a shared kitchen for one household. People save cooking videos, keep one inventory, and get told which saved recipes they can cook. It is a warm, editorial kitchen notebook, not a grocery dashboard and not a recipe blog. Phone is the main client. The same layout must work on a laptop without becoming a cramped column of text.

**DESIGN SYSTEM (REQUIRED):**

- Platform: Web, mobile-first, with a laptop split view for the video library
- Palette: Paper (#F6F3EC, page background), Ink (#173027, text), Pine (#1E6B45, primary action), Chili (#D63A2F, destructive and "don't have"), Yolk (#E6B325, focus and selection), Mist (#E7F0E4, quiet chips)
- Typography: A high-contrast serif for the wordmark and recipe titles. A plain grotesque for UI labels, amounts, and buttons. Large type, short lines, generous whitespace
- Styles: Softly rounded cards (16px), pill-shaped buttons, whisper-soft shadows, thin ink-tinted borders. Flat color blocking, no glassmorphism, no gradients, no stock illustration
- Motion: A card can slide off to the right or left. Everything else is still
- Language: Design the English screen. Leave room for Hebrew, which is the same layout mirrored right to left. Do not invent a third language
- Do not add expiry dates, ratings, comments, or a bottom-tab icon set that looks like a generic delivery app

**SHARED CHROME:**

- Sticky top bar: the word "Foody" in the serif, a small household name, and a text button for language (English / עברית), measurement (Metric / Imperial), invite, and sign out
- Under that, a horizontally scrolling row of pill tabs: Videos, Stock, Guess, Shop, Ideas, Profile. The owner also sees Costs. The current tab is filled Pine with Paper text. The others are Paper with an Ink border
- Page background is Paper. Content sits in one column on a phone, max about 720px, with 20px side padding. On a laptop the video section becomes two columns and the other pages stay a calm centered column

## 1. Sign in

A quiet phone screen on Paper. No photo collage.

**PAGE STRUCTURE:**

1. **Header:** The word "Foody" in a large serif, with a short Yolk underline
2. **Lead:** One sentence: "Foody keeps the cooking videos your household wants to make again."
3. **Primary action:** A pill-shaped Pine button, "Sign in with Google". No other sign-in method
4. **Language:** Two text buttons, English and עברית. English is pressed, with a Yolk underline

## 2. Videos, phone

The household library. Real food photography is the content. Empty areas stay quiet.

**PAGE STRUCTURE:**

1. **Shared chrome** with Videos selected
2. **Paste bar:** A single text input, placeholder "Paste a YouTube, TikTok, Instagram, or Pinterest link", and a Pine button "Save video"
3. **Video list:** A vertical stack of cards. Each card is a 16:9 dish photo, the recipe title in the serif over a short Ink scrim, and a small line "Saved by Noa". One card is selected, with a 2px Pine border
4. **Empty state, as a second frame:** No cards. One line: "Nothing saved yet."

## 3. Recipe, phone

A saved video opened as a recipe. Steps stay large enough to cook from.

**PAGE STRUCTURE:**

1. **Top:** A text button "Back", then a full-width dish photo
2. **Title block:** Serif title, then "32 min · 4 servings" and "Saved by Noa". A text link "Open the video"
3. **Ingredients:** A list. Each row is a bold amount in a fixed column ("200 g", "1 tbsp") and the ingredient name. Names are in the viewer's language
4. **Steps:** A numbered list, large body text, one step per block, max line length about 65 characters. Steps stay in the video's language
5. **Incomplete state, as a note on the same screen:** A Mist banner: "The link is saved, and the recipe text is still incomplete."

## 4. Videos and recipe, laptop

Same content as screens 2 and 3, side by side.

**PAGE STRUCTURE:**

1. **Shared chrome**, full width
2. **Split view:** Left column 340px, the paste bar and the video cards. Right column, the open recipe. The selected card and the open recipe are the same dish
3. **Do not** turn the left column into a data table

## 5. Stock

Four stacks in one scroll: Fridge, Freezer, Pantry, Spices.

**PAGE STRUCTURE:**

1. **Shared chrome** with Stock selected
2. **Section:** A serif heading "Fridge". Under it, a compact add row: name field, amount field, unit field, Pine "Add" button
3. **Rows:** Name on the left, an amount field and a unit field in the middle, a text button "Remove" on the right. Show Milk 1 L, Eggs 6 pcs, Butter 200 g
4. **Spices section:** Same add row, but a checkbox "In the kitchen" instead of amount and unit. Rows are Salt, Cumin, Paprika. Cumin shows a pressed pill "In the kitchen". Paprika shows an outline pill "Out"
5. **Empty section:** Pantry has the add row and one line, "Nothing here yet."

## 6. Guess

One decision, full attention. This is the playful screen.

**PAGE STRUCTURE:**

1. **Shared chrome** with Guess selected
2. **Lead:** "Swipe right if it is in the kitchen, left if it is not."
3. **Card:** A large Paper card, floating with a whisper-soft shadow. The ingredient name "Tomatoes" in a very large serif. Under it, a small label "Fridge"
4. **Actions:** A Chili pill "Don't" on the left. A Pine pill "Have it" on the right
5. **Hint of the swipe:** The card sits a few degrees from center, as if a thumb is about to push it. No tutorial overlay

## 7. Shop

A short shared shopping list.

**PAGE STRUCTURE:**

1. **Shared chrome** with Shop selected
2. **Add row:** Name, amount, unit, Pine "Add"
3. **Rows:** Bread, 1 pcs. Lemons, 3 pcs. Olive oil, with no amount. Each row has "Remove"
4. **Empty state, as a second frame:** "The shopping list is empty."

## 8. Ideas

Two groups of saved recipes the kitchen can almost cook. Food photos, not a feed of new recipes.

**PAGE STRUCTURE:**

1. **Shared chrome** with Ideas selected
2. **Note:** A quiet line: "Suggestions use ingredient names. A diet filter is not a certification."
3. **Cook now:** Serif heading. One card with a dish photo, title "Lemon soup", and no missing line
4. **A few items short:** Serif heading. One card, title "Chicken tray", a line "Missing: chicken", and a Pine button "Add missing to the list"
5. **Empty state, as a second frame:** "No saved recipes match this kitchen and profile yet."

## 9. Profile

Preferences for the person looking. They do not change the shared kitchen.

**PAGE STRUCTURE:**

1. **Shared chrome** with Profile selected
2. **Lead:** "Suggestions follow this profile. The shared kitchen does not change."
3. **Word lists:** Three groups, Allergies, Dislikes, Interests. Each group is a row of Mist chips ("peanut", "cilantro") and a short add field with an "Add" button. A chip is removable
4. **Diet:** A wrapping row of pills. "Vegetarian" is pressed. The others are outline: No preference, Omnivore, Vegan, Pescatarian, Kosher, Halal
5. **Budget:** The same pill row. "Low" is pressed. Medium and High are outline
6. **Max minutes:** One numeric field labeled "Max minutes", value 30
7. **Save:** A Pine button "Save profile"

## 10. Costs

Only the owner sees this tab. It is a bill, not a chart dashboard.

**PAGE STRUCTURE:**

1. **Shared chrome** with Costs selected
2. **Heading:** "Extraction costs", then "Total $0.0420"
3. **Rows:** Recipe title, origin ("page" or "video"), provider, and the dollar amount. Two rows are enough. No graph, no sparkline
4. **Forbidden state, as a second frame:** The tab is hidden. If the page is opened anyway, one sentence: "Only the Foody owner can see costs."
