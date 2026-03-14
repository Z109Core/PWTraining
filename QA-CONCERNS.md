# QA Concerns & Usability Risks — Address Book

This document lists defects, usability risks, and ways the application could become unusable, based on review of `fixtures/address-book.html` and `specification.md`. Each concern that is covered by an automated test is linked to the Playwright test in `tests/example.spec.ts` (describe: **QA concerns (edge cases & regression)**).

---

## Critical (App-breaking or data loss)

### 1. **CSS: Input height on focus (form unusable)**
- **Where:** `input:focus { height: 8px; }` (line ~96)
- **Impact:** When any input receives focus, its height becomes 8px. Users cannot see what they type; the form is effectively unusable after first focus.
- **Fix:** Remove `height: 8px` from `input:focus`, or set a sensible min-height (e.g. same as default).
- **Test:** `QA-1: focused input remains usable height (no 8px collapse)` — asserts focused input height ≥ 20px. **Fixed in fixture.**

### 2. **Runtime error: search when optional fields are missing**
- **Where:** `getFilteredContacts()` — `contact.phone.toLowerCase()` (and similar for other optional fields)
- **Impact:** Contacts are created with `...data` from the form. If a field is missing from the object or is `undefined`, `.toLowerCase()` throws and the whole script can fail. Search and list render then break.
- **Fix:** Use safe access, e.g. `(contact.phone || '').toLowerCase()` (and same for firstName, lastName, email if needed).
- **Test:** `QA-2/9: search does not crash when contact has no phone (optional fields missing)` — adds contact with only required fields, then searches; asserts no throw and result visible.

### 3. **XSS / display crash: null/undefined in table**
- **Where:** `escapeHtml(text)` and table cells: `${this.escapeHtml(contact.firstName)}` etc.
- **Impact:** If a contact has `firstName`/`lastName`/`email`/`phone` as `null` or `undefined`, passing that to `escapeHtml` and then into the DOM can produce "null"/"undefined" text or, in other code paths, cause errors.
- **Fix:** Normalize before render, e.g. `this.escapeHtml(contact.firstName ?? '')`, and ensure `escapeHtml` handles non-strings (e.g. coerce to string or return '').
- **Test:** `QA-3/7: contact with only required fields shows no "undefined" in table or edit form` — adds contact with only required fields, asserts list and edit form never show "undefined".

---

## High (Wrong behavior, confusion, or poor UX)

### 4. **Copy/typos (spec and UX)**
- **"Frist Name"** in table header (line ~720) — should be "First Name". Hurts credibility and accessibility (screen readers).
- **"Search by nme or email..."** placeholder (line ~426) — "nme" → "name". Misleading and looks broken.
- **Test:** `QA-4a: table column header spells "First Name" (spec)` and `QA-4b: search placeholder includes "name" and "email" (spec)`. **Fixed in fixture (header + placeholder).**

### 5. **Delete confirmation with empty names**
- **Where:** `confirm(\`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?\`)`
- **Impact:** If firstName and lastName were ever empty (e.g. legacy data or future bug), dialog reads "Are you sure you want to delete  ?". Confusing and unprofessional.
- **Fix:** Fallback text, e.g. "this contact" or "Contact #" + id when both names are falsy.
- **Test:** `QA-5: delete confirmation message includes contact name` — asserts confirm dialog text includes the contact’s first and last name when present.

### 6. **Edit heading with empty names**
- **Where:** `Edit Address: ${contact.firstName} ${contact.lastName}`
- **Impact:** Same as above: "Edit Address:  " if both empty. Unclear which contact is being edited.
- **Fix:** Same fallback as delete (e.g. "this contact" or ID).
- **Test:** Not automated (cannot create contact with empty first/last via UI due to validation). Manual or unit test if data can be injected.

### 7. **Form pre-fill: "undefined" in fields**
- **Where:** `setFormData(contact)` assigns `contact.phone`, `contact.street`, etc., directly to `input.value`.
- **Impact:** If a contact object is missing optional properties (e.g. from old code or migration), inputs can show the string `"undefined"`.
- **Fix:** Use nullish coalescing, e.g. `contact.phone ?? ''`, for every optional field.
- **Test:** `QA-3/7: contact with only required fields shows no "undefined" in table or edit form` — in edit mode asserts `#phone` and `#street` have empty value, not "undefined".

### 8. **Cancel button: Playwright must use DOM click**
- **Observed:** Normal Playwright `click()` on Cancel did not reliably run the handler in some browsers; tests had to use `evaluate(() => el.click())`. Suggests the button may be covered, have a small hit area, or need better focus/visibility.
- **Recommendation:** Ensure Cancel is not obscured, has adequate size (e.g. min 44px touch target), and is focusable. Verify with keyboard and screen reader.
- **Test:** `QA-8: Cancel button visible and restores form to Add mode` — asserts Cancel visible, min height ≥ 20px, and DOM click returns form to Add mode.

---

## Medium (Edge cases and spec drift)

### 9. **No phone validation, but search assumes string**
- **Where:** Search uses `contact.phone.toLowerCase()`. Phone is optional and unvalidated.
- **Impact:** If phone were ever stored as a number (e.g. from a future API), `.toLowerCase()` would throw. Same as #2; optional fields should be treated as possibly missing or non-string.
- **Fix:** Defensive handling in search (and any other code that assumes string), e.g. `String(contact.phone ?? '').toLowerCase()`.
- **Test:** `QA-2/9: search does not crash when contact has no phone (optional fields missing)` — covers missing/undefined optional fields in search.

### 10. **Success message timing**
- **Where:** Message auto-hides after 4 seconds (`setTimeout(..., 4000)`).
- **Spec:** Says 3–5 seconds — current behavior is in range but at the long end. Slow readers or assistive tech may miss it.
- **Recommendation:** Consider 5s or make message dismissible and leave it visible until next action or explicit dismiss.
- **Test:** `QA-10: success message visible after add` — asserts "Contact added successfully" is visible after submit.

### 11. **No loading or disabled state during actions**
- **Impact:** Rapid double-clicks on "Add Address" or "Save Changes" could theoretically trigger submit twice. Unlikely to corrupt data (synchronous in-memory) but could add duplicate or show odd UI.
- **Recommendation:** Optional: disable submit button or show loading state until handler finishes.
- **Test:** Not automated (double-submit not asserted).

### 12. **Very long names/emails in table**
- **Spec:** Suggests truncation with ellipsis or overflow handling for very long fields.
- **Current:** No truncation; long text can stretch layout, break responsive design, or overflow.
- **Recommendation:** Add `max-width` and `text-overflow: ellipsis; overflow: hidden` on table cells, or cap display length in JS.
- **Test:** `QA-12: very long name (50 chars) still renders in table without breaking layout` — adds 50-char first name, asserts table visible and cell contains the name.

---

## Accessibility (A11y)

### 13. **Focus outline**
- **Where:** `input:focus { outline: none; ... }`
- **Impact:** Removing outline without a clear replacement (e.g. border change) can hide focus for keyboard users and worsen accessibility.
- **Fix:** Keep a visible focus indicator (e.g. the existing border-color change and/or a 2px outline). Do not rely only on `outline: none`.
- **Test:** `QA-13: focused input has visible focus indicator (outline or border)` — asserts focused input has non-zero outline or visible border. **Addressed in fixture (outline + border).**

### 14. **Table semantics**
- **Current:** Table has headers; action buttons are `<button>`.
- **Gaps:** No `scope="col"` on `<th>`, no `<caption>` or aria-label on table. "Edit"/"Delete" per row are not tied to the row for screen readers (e.g. no aria-label like "Edit John Doe").
- **Recommendation:** Add scope and table caption/label; consider aria-labels on Edit/Delete that include the contact name.
- **Test:** Not automated (semantics/ARIA not asserted). Consider axe or similar.

### 15. **Error messages and field association**
- **Current:** Errors appear in `.error-message[data-field="..."]` near the field.
- **Gap:** No `aria-describedby` or `aria-invalid` on inputs when errors are shown. Screen readers may not announce errors.
- **Recommendation:** Set `aria-invalid="true"` and `aria-describedby` pointing to the error element when validation fails; clear when fixed.
- **Test:** Not automated (aria-invalid/aria-describedby not asserted).

### 16. **Delete confirmation**
- **Current:** Uses `confirm()`. Message is plain text.
- **Gap:** `confirm()` is not always well announced by assistive tech; focus and role are platform-dependent.
- **Recommendation:** For better a11y, consider a custom modal with proper focus trap and aria roles (dialog, aria-labelledby, etc.).
- **Test:** Not automated (confirm() a11y not asserted).

---

## Security & data integrity

### 17. **XSS: escapeHtml coverage**
- **Current:** Table cells and edit heading use `escapeHtml` or direct assignment. `escapeHtml` is used for first/last name, email, phone in the table.
- **Risk:** Any new place that inserts contact data into the DOM without `escapeHtml` (e.g. a future "detail view") could introduce XSS. Edit heading uses `textContent`, which is safe.
- **Recommendation:** Centralize "render contact data" and always escape; avoid `innerHTML` with unsanitized data.
- **Test:** `XSS: script payload escaped in list (no execution)` and `QA-17: XSS — all contact fields escaped in table (no script execution)` — script and `onerror` payloads are escaped and do not execute.

### 18. **No duplicate or uniqueness checks**
- **Spec:** Explicitly allows duplicate emails. No duplicate prevention.
- **Impact:** Users can add the same person multiple times by mistake; no way to detect or merge. Not a bug but a limitation that can make the app feel unreliable.
- **Recommendation:** Document as known limitation; consider optional "warn if email already exists" (per spec, duplicate is allowed but warning could improve UX).
- **Test:** Not automated (by design; duplicate allowed).

---

## Browser & environment

### 19. **file:// and form submission**
- **Observed:** When the app was loaded via `file://`, form submit (button click) did not reliably add contacts in tests; switching to HTTP (webServer) fixed it. Suggests possible differences in event handling or validation under file protocol.
- **Recommendation:** Run and test the app over HTTP (e.g. simple static server) rather than opening the HTML file directly, to match real deployment and avoid file:// quirks.
- **Test:** Addressed by Playwright config: tests run against `webServer` (HTTP); no test for file:// behavior.

### 20. **ES6 and older browsers**
- **Current:** Uses const/let, arrow functions, template literals, optional chaining could be used.
- **Spec:** Targets modern browsers (Chrome, Firefox, Safari, Edge — latest 2).
- **Risk:** Very old or strict corporate browsers might fail. Not a defect if spec is "latest 2 versions," but worth noting for deployment.
- **Test:** Not automated (browser support documented in spec).

---

## Summary table

| #  | Severity   | Area        | One-line description                                      | Test in example.spec.ts |
|----|------------|-------------|------------------------------------------------------------|--------------------------|
| 1  | Critical   | CSS         | Input height 8px on focus makes form unusable              | QA-1 (fixed in fixture)  |
| 2  | Critical   | JS          | Search crashes if contact.phone (or other optional) is undefined | QA-2/9                  |
| 3  | Critical   | JS          | null/undefined in contact fields can break render/escapeHtml   | QA-3/7                  |
| 4  | High       | Copy        | Typos: "Frist Name", "nme" in placeholder                  | QA-4a, QA-4b (fixed)     |
| 5  | High       | UX          | Delete confirm message with empty names                    | QA-5                     |
| 6  | High       | UX          | Edit heading with empty names                             | —                        |
| 7  | High       | Form        | "undefined" shown in form when optional fields missing     | QA-3/7                   |
| 8  | High       | UX          | Cancel button click reliability / hit area                 | QA-8                     |
| 9  | Medium     | Search      | Optional fields as non-string (e.g. number) can throw       | QA-2/9                   |
| 10 | Medium     | UX          | Success message duration and dismiss                      | QA-10                    |
| 11 | Medium     | Form        | No double-submit prevention                                | —                        |
| 12 | Medium     | Layout      | Long text in table cells not truncated                     | QA-12                    |
| 13 | A11y       | Focus       | outline: none without strong focus alternative             | QA-13 (addressed)        |
| 14 | A11y       | Table       | Missing scope, caption, aria on actions                     | —                        |
| 15 | A11y       | Form        | Errors not aria-describedby / aria-invalid                 | —                        |
| 16 | A11y       | Dialog      | confirm() for delete not ideal for a11y                    | —                        |
| 17 | Security   | XSS         | Ensure all contact output goes through escapeHtml          | QA-17 + XSS test         |
| 18 | Data       | UX          | No duplicate warning (by design; document limitation)     | —                        |
| 19 | Env        | Protocol    | Prefer HTTP over file:// for testing and deployment        | Config (webServer)       |
| 20 | Env        | Browser     | ES6 target — document supported browsers                   | —                        |

---

All automated checks for the above are in **`tests/example.spec.ts`**, describe block **QA concerns (edge cases & regression)**. Run with: `npx playwright test`.

Concerns **#6, #11, #14, #15, #16, #18, #20** have no Playwright test (manual, spec, or code review). Fixing **#1 (input height)** and **#2/#3 (null-safe search/render)** in the app removes the highest risk of the app becoming unusable or crashing.
