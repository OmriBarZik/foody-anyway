# Left to do

The library, stock list, guess mode, shopping list, suggestions, dietary profile, and admin cost screen are in the app. This file is what is still open.

## Still to build

- [ ] Expiry dates on fridge, freezer, and pantry items. Spices stay present or absent. This was left out of the current slices on purpose.

## Tighter versions of what shipped

- [ ] Match recipes by amount, not only by name. A kitchen that has any milk currently counts as able to cook a recipe that needs a liter.
- [ ] Give the budget a real meaning. Low budget only shortens the "a few items short" list. Recipes have no prices.
- [ ] Treat kosher and halal as more than a name check. The filter hides obvious pork and shellfish words. It is not a certification. Vegetarian and vegan use the same kind of word list.
- [ ] Let guess mode learn beyond the fixed staple deck. Swipes today walk one built-in list, in English and Hebrew.
- [ ] Check a shopping line off into the kitchen. Removing a line deletes it. It does not add that food to stock.

## Before you try the signed-in app

- [x] Google OAuth values are in `.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). The app is on port 3010, so the authorized redirect URI is `http://localhost:3010/api/auth/callback/google`.
- [x] `GEMINI_API_KEY` is in `.env`.
- [ ] Click through Guess, Shop, Ideas, Profile, Settings, and Costs on a phone and on a laptop after sign-in. Those screens were checked through the API. The browser session here had no Google login, so the signed-in pages were not clicked.
- [ ] Commit the uncommitted kitchen work when you want it saved. Nothing from this pass has been committed.
