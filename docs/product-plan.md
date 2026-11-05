# Foody product plan

Shared kitchen app for a household. People save cooking videos, keep one kitchen inventory, and later get told what they can cook from recipes they already saved.

The library and kitchen list mode are in the app. Guess mode, shopping, and suggestions come after.

## Progress

The library slice is in the app. Kitchen stock list mode is in the app. Guess mode, shopping, suggestions, the dietary profile, and the admin cost screen are not.

### Library

- [x] Google sign-in, a user, and a household. An invite link is the only way into an existing household.
- [x] Paste a video link from YouTube, TikTok, Pinterest, or Instagram.
- [x] Store the link, thumbnail, finished-dish image when one is found, and the member who saved it.
- [x] Crawl the page, then ask Gemini to watch the video when the page is not enough. Other platforms can stay in `needs_review`.
- [x] Show the parsed recipe: original steps, translated ingredient names, amounts in the viewer's measurement system.
- [x] Show the household library on a phone and on a laptop.
- [x] Record an extraction cost for each run.
- [x] UI strings in English and Hebrew, with direction following the language.

### Kitchen

- [x] Shared stock for fridge, freezer, pantry, and spices. Spices are present or absent. Everything else has an amount.
- [x] List mode: add, edit, and remove stock by hand.
- [ ] Guess mode: swipe proposed ingredients into or out of the kitchen.
- [ ] Expiry dates stay out until a later slice.

### Later

- [ ] Shopping list, including the prompt that adds missing ingredients for a saved recipe.
- [ ] Suggestion mix of saved recipes the kitchen can make, filtered by the current user's profile.
- [ ] Dietary profile editor (allergies, diet, dislikes, time, budget, interests).
- [ ] Admin cost dashboard. Cost rows are already written.

## Decisions

### People and households

- Two people share one household. Friends can use the app too, so there are user accounts.
- A new account gets its own household. An invite link is the only way into an existing household. People who share a kitchen share stock and recipes. Everyone else keeps a separate household.
- Kitchen stock belongs to the household. When anyone adds or uses milk, every member sees the same kitchen.
- Food interests, favorites, allergies, diet, dislikes, max cooking time, budget, and measurement system belong to the user. Suggestions follow the person who is looking, and they do not change the shared kitchen.
- Phone is the main client. The same app must work on a laptop.
- Sign-in is Google only.

### Saved videos

- A recipe enters the app only as a link: YouTube, TikTok, Pinterest, or Instagram.
- The app never invents a recipe. Suggestions may use only recipes someone saved from those sources.
- Recipes belong to the household. Every member can open them.
- Each recipe shows who saved it.
- Each save stores the original video URL, a thumbnail URL, and a photo of the finished dish when one can be found.
- Each save also stores a parsed recipe that is easy to read and follow: title, ingredients with amounts, and ordered steps.
- Steps stay in the video's language.
- Ingredient names are translated into the viewer's language (Hebrew or English).
- Amounts are stored as parsed, and converted between metric and imperial. The viewer's measurement setting decides which system is primary. Default is metric.

### Reading the recipe off the link

All four platforms can be saved immediately. YouTube extraction is the path that must work reliably first. TikTok, Instagram, and Pinterest always keep the link and thumbnail. The crawler and the video model run when the page or the video is readable. Otherwise the recipe stays in `needs_review`.

1. A small crawler fetches the link and any connected recipe page and tries to pull a recipe from the page.
2. When the page has no usable caption or recipe, a video-capable model (Gemini, or the same class of model) watches the video and extracts the recipe.
3. Extraction also produces the ingredient-name translation and the unit conversion.
4. Every extraction writes a cost row: provider, model, dollar amount, token counts when the provider returns them, and the origin of the cost (page fetch, which costs nothing, or video understanding).
5. An admin dashboard, visible to the owner, lists those costs. The cost rows exist from the first extraction, even if the dashboard screen comes later.

### Shared kitchen (after the library)

- "Kitchen" means fridge, freezer, pantry, and spices.
- Spices are tracked as present or absent. Everything else tracks an amount.
- Expiry dates wait.
- Two ways to fill the kitchen:
  - Guess mode: the app proposes ingredients and the person swipes right for "I have this" and left for "I do not".
  - List mode: add, remove, and edit amounts by hand.
- The shopping list holds items added by hand. A separate prompt suggests extra ingredients to buy so a suggested saved recipe can be cooked. Accepting the prompt adds those ingredients to the list.

### Suggestions (after the kitchen)

- Show a mix of saved recipes the kitchen can already make and saved recipes that need a few extra items.
- Filter that mix with the current user's profile (allergies, diet, dislikes, time, budget, interests).
- The missing-ingredient prompt is how a suggestion becomes a shopping-list addition.

### Language

- English and Hebrew from the first screen.
- An i18n library, with RTL for Hebrew and LTR for English, is part of the app shell before feature work.
- Recipe steps stay in the source language. Ingredient names follow the UI language.

## What ships first

The library slice below is built. See Progress for what is still open.

The library slice:

- Google sign-in, a user, and a household. Invite link to join a household.
- Paste a video link from YouTube, TikTok, Pinterest, or Instagram.
- Store link, thumbnail, finished-dish image when available, and the member who saved it.
- Run crawler, then video extraction when the page is not enough. YouTube must succeed reliably. The other platforms may land in `needs_review`.
- Show the parsed recipe in a followable layout: original steps, translated ingredient names, amounts in the viewer's measurement system.
- Show the household library on a phone and on a laptop.
- Record extraction cost for each run.
- UI strings in English and Hebrew, with direction following the language.

Explicitly later: kitchen guess mode, shopping list, suggestion mix, dietary profile editor, admin cost dashboard UI. Kitchen list mode is already in the app.

## Data the first slice needs

- **User** — name, email, Google id, locale (`en` or `he`), measurement system (`metric` or `imperial`, default `metric`), admin flag. Profile fields (allergies, diet, dislikes, max minutes, budget, interests) can be empty until that screen exists.
- **Household** — name.
- **Membership** — user, household.
- **Invite** — household, code or token, who created it.
- **Recipe** — household, who saved it, source URL, platform, thumbnail URL, dish image URL, title, servings, time, ingredients in the source language and in translation, steps in the source language, source measurement system, source language, extraction status (`pending`, `ready`, `needs_review`, `failed`).
- **Extraction cost** — recipe, provider, model, origin, USD, tokens, time.
- **Stock item** — household, location (`fridge`, `freezer`, `pantry`, `spices`), name, amount and unit, or present/absent for spices.

## Stack notes for the build

- Bun and React, the app that is already in this repo.
- `bun:sqlite` for the database.
- `i18next` and `react-i18next` for English, Hebrew, RTL, and LTR.
- Google OAuth as the only sign-in.
- Gemini for video understanding when the crawler cannot find a recipe. Page fetches log a zero-cost row so the admin list shows the origin of every attempt.
