# Simple Address Book Application Specification

## Overview
A single-page address book application built with vanilla HTML, CSS, and JavaScript. The application demonstrates fundamental web development concepts without external dependencies or server requirements. All data is stored in browser memory.

## Purpose
This application serves as an educational tool for learning:
- HTML form structure and semantic markup
- CSS styling and layout techniques
- JavaScript DOM manipulation
- Basic data management and CRUD operations
- String manipulation and search algorithms
- Client-side form validation

## Features

### 1. Create (Add Address)
- Users can add new contacts to the address book
- Form includes fields for:
  - First Name (required)
  - Last Name (required)
  - Email (required, basic format validation)
  - Phone Number (optional)
  - Street Address (optional)
  - City (optional)
  - State/Province (optional)
  - Postal Code (optional)
- Form validation prevents incomplete or invalid entries
- Upon successful addition, form is cleared and address list is updated
- User receives visual confirmation of successful addition

### 2. Read (Display Addresses)
- All addresses are displayed in a table/list format
- Table shows key information: First Name, Last Name, Email, Phone
- Full details are accessible via detail view
- Addresses are displayed in the order they were added
- Display updates in real-time as addresses are added/modified/deleted

### 3. Update (Edit Address)
- Users can click an "Edit" button on any address
- Edit form pre-populates with existing address data
- Users can modify any field
- Changes are saved with a "Save Changes" button
- Users can cancel editing to discard changes
- Form validation applies to edits as it does to new entries
- Only one address can be edited at a time

### 4. Delete (Remove Address)
- Users can delete any address with a "Delete" button
- Confirmation prompt prevents accidental deletion
- Upon deletion, address is removed from display and memory
- List updates immediately

### 5. Search
- Search/filter box allows users to search addresses in real-time
- Search is case-insensitive
- Search matches across multiple fields: First Name, Last Name, Email, Phone
- Search results update dynamically as user types
- Clear search button restores full list view
- Search does not modify underlying data

## Technical Requirements

### Single File Constraint
- All code (HTML, CSS, JavaScript) must be contained in a single `index.html` file
- CSS should be in a `<style>` tag within the `<head>`
- JavaScript should be in a `<script>` tag before closing `</body>`

### Browser Compatibility
- Target modern browsers (Chrome, Firefox, Safari, Edge)
- Use vanilla JavaScript (ES6 compatible)
- No external libraries or frameworks

### Data Storage
- In-memory only - implemented using JavaScript array
- Data persists only during current session
- Reloading page clears all data
- Data structure: Array of contact objects

### Data Model
Each contact object contains:
```
{
  id: unique identifier (timestamp or increment)
  firstName: string
  lastName: string
  email: string (required)
  phone: string
  street: string
  city: string
  state: string
  postalCode: string
}
```

## User Interface Layout

### Header Section
- Application title
- Brief subtitle or description

### Main Content Area
**Left/Top: Input Form**
- Form heading: "Add New Address" or "Edit Address" (dynamic)
- Input fields for all contact properties
- "Add Address" button (or "Save Changes" when editing)
- "Cancel" button (visible only when editing)
- Required field indicators

**Right/Bottom: Search and List**
- Search input box with label
- "Clear Search" button or icon
- Table/list displaying all addresses or search results
- Column headers: First Name, Last Name, Email, Phone, Actions
- Action buttons per row: Edit, Delete, View Details (optional)
- Empty state message when no addresses exist
- Message when search returns no results

### Optional: Detail View
- Modal or expandable section showing full contact details
- Close button to return to main view

## Detailed Functional Requirements & Test Cases

### 1. CREATE Feature - Detailed Specifications

#### 1.1 Form Validation Rules
**Required Fields:**
- **First Name**: Required, minimum 1 character, maximum 50 characters
  - PASS: "John", "J", "Jean-Pierre", "O'Brien"
  - FAIL: "" (empty), "   " (whitespace only)
- **Last Name**: Required, minimum 1 character, maximum 50 characters
  - PASS: "Smith", "A", "Van Der Berg", "O'Malley-Jones"
  - FAIL: "" (empty), "   " (whitespace only)
- **Email**: Required, must contain @ and at least one dot after @
  - PASS: "user@example.com", "a@b.co", "test.email+tag@company.co.uk"
  - FAIL: "notanemail", "user@nodomain", "user.nodomain.com", "@example.com", "user@.com", "" (empty)

**Optional Fields:**
- **Phone Number**: No format validation. Accepts any alphanumeric characters and common phone symbols (-, +, (), spaces)
  - PASS: "" (empty), "555-1234", "+1 (555) 123-4567", "5551234567", "ext 123"
  - Field can be left empty
- **Street Address**: Accepts any characters, maximum 100 characters
  - PASS: "" (empty), "123 Main St", "Apt 4B, 567 Oak Ave"
- **City**: Accepts any characters, maximum 50 characters
  - PASS: "" (empty), "New York", "Saint Paul"
- **State/Province**: Accepts any characters, maximum 50 characters
  - PASS: "" (empty), "NY", "California", "Ontario"
- **Postal Code**: Accepts any characters, maximum 20 characters
  - PASS: "" (empty), "12345", "12345-6789", "K1A 0B1"

#### 1.2 Form Behavior - Add New Address
**Initial State:**
- Form heading displays "Add New Address"
- All fields are empty
- "Cancel" button is NOT visible
- "Add Address" button is visible and enabled
- No validation errors displayed

**Submission Behavior:**
- User fills in required fields (First Name, Last Name, Email)
- User optionally fills optional fields
- User clicks "Add Address" button OR presses Enter in any form field
- If validation fails: Display error message(s) next to invalid fields, form data retained, address NOT added to list
- If validation succeeds:
  - Address is added to in-memory storage with unique ID
  - Success message displays: "Contact added successfully" (or similar confirmation)
  - Form clears all fields completely
  - New address appears in address list immediately
  - Success message persists for 3-5 seconds or until next action
  - Focus may return to First Name field for next entry

**Validation Error Display:**
- Errors displayed inline next to the invalid field (not as popup/alert)
- Error message specifies which field and why (e.g., "Email must contain @ and .")
- All validation errors for the form are displayed simultaneously
- Red text or visual indicator (border, icon) identifies invalid fields
- Errors clear when user corrects the field

#### 1.3 Test Case Responsibility
QA engineers should develop comprehensive test cases for the CREATE feature based on the requirements above. Test cases should cover:
- Valid submissions with various field combinations
- Invalid submissions for each validation rule
- Edge cases (special characters, very long inputs, whitespace handling)
- Form state transitions (clearing, success messages, error states)
- Multiple sequential additions and form behavior consistency

### 2. READ Feature - Detailed Specifications

#### 2.1 Address List Display
**Table/List Structure:**
- Columns displayed: First Name, Last Name, Email, Phone, Actions
- Column headers are visible and clearly labeled
- One row per contact
- Rows are in insertion order (first added = top row)

**Data Display:**
- First Name and Last Name are displayed exactly as entered (preserving case, spacing)
- Email is displayed exactly as entered
- Phone is displayed exactly as entered or empty if not provided
- No data transformation or truncation (unless field is extremely long, may be truncated with ellipsis)
- Maximum 20 characters might be displayed per column with scroll/overflow handling

**Empty State:**
- When no addresses exist, table shows message: "No addresses in your book. Add one to get started."
- Empty state message is displayed prominently

**Search Results Display:**
- When search is active, only matching addresses are shown
- Non-matching addresses are completely hidden from view
- Number of results may be displayed (optional but helpful): "Showing X of Y contacts"
- When search returns no results: "No matches found. Try a different search term."

#### 2.2 Action Buttons
**Edit Button (per row):**
- Label: "Edit"
- Clicking Edit button triggers edit mode (see UPDATE section)
- Button is always enabled and functional
- Visual style distinguishes it as a button (clickable appearance)

**Delete Button (per row):**
- Label: "Delete"
- Clicking Delete button shows confirmation dialog
- Button is always enabled and functional
- Visual style may be different from Edit (e.g., red color to indicate destructive action)

**View Details (optional):**
- If implemented, displays full contact record in readable format
- Can be modal popup, expandable section, or separate panel

#### 2.3 Test Case Responsibility
QA engineers should develop comprehensive test cases for the READ feature based on the requirements above. Test cases should cover:
- Display of single and multiple contacts
- Correct field display and data integrity
- Empty state and search result states
- Action button visibility and functionality
- List updates in real-time during add/edit/delete operations

### 3. UPDATE Feature - Detailed Specifications

#### 3.1 Entering Edit Mode
**Trigger:**
- User clicks "Edit" button on any address row

**Form State Changes:**
- Form heading changes from "Add New Address" to "Edit Address: [First Name] [Last Name]"
- All form fields populate with contact's current data
- "Cancel" button becomes visible
- "Add Address" button text changes to "Save Changes"
- Address list is still visible but may be disabled/grayed out (optional)
- Only one address can be in edit mode at a time

**Behavior if Editing While Another Edit is Active:**
- Clicking Edit on a different address: First address edit is cancelled, second address enters edit mode
- No confirmation required for this transition
- Form resets to show newly selected address

#### 3.2 Edit Form Behavior
**Field Editing:**
- All fields can be edited (same as Add form)
- Validation rules are identical to Add form
- Data can be cleared from optional fields
- Changes are NOT automatically saved

**Cancelling Edit:**
- Click "Cancel" button
- Form reverts to empty state (as if adding new address)
- Form heading changes back to "Add New Address"
- "Cancel" button becomes hidden
- "Save Changes" button text changes back to "Add Address"
- Address in list is unchanged
- Current edit-in-progress is discarded

**Saving Changes:**
- User modifies one or more fields
- User clicks "Save Changes" button OR presses Enter in form field
- Validation runs on all fields (same rules as Add)
- If validation fails: Error messages displayed, changes NOT saved, edit mode remains active
- If validation succeeds:
  - Contact data in memory is updated with new values
  - Address list updates to show new values
  - Success message displays: "Contact updated successfully"
  - Form returns to empty state
  - Form heading changes back to "Add New Address"
  - "Cancel" button becomes hidden
  - "Save Changes" button text changes back to "Add Address"
  - Contact may move in list if sorting is implemented, otherwise stays in same position

#### 3.3 Test Case Responsibility
QA engineers should develop comprehensive test cases for the UPDATE feature based on the requirements above. Test cases should cover:
- Entering and exiting edit mode
- Form pre-population with existing data
- Editing single and multiple fields
- Validation on edit submission
- Cancel behavior and data retention/discarding
- Form state transitions between add and edit modes
- Switching between editing different contacts

### 4. DELETE Feature - Detailed Specifications

#### 4.1 Delete Behavior
**Trigger:**
- User clicks "Delete" button on any address row

**Confirmation Dialog:**
- Browser confirmation dialog appears (or custom modal)
- Message: "Are you sure you want to delete [First Name] [Last Name]?"
- Two options: "OK/Delete" and "Cancel"
- User must confirm before deletion occurs

**Confirmation Actions:**
- **User clicks "OK"/"Delete"**: Contact is removed from in-memory storage and list display immediately. Success message appears: "Contact deleted successfully." Contact row disappears from view.
- **User clicks "Cancel"**: Deletion is aborted. Dialog closes. Contact remains in list unchanged.

**Post-Deletion State:**
- Deleted contact is completely removed from memory
- List refreshes to remove deleted row
- If search is active, remaining contacts continue to match search criteria
- If deleted contact was the only result for current search, "No matches found" message appears
- User can immediately add new contact or continue with other operations

#### 4.2 Delete While Editing
**Scenario: Contact is in edit mode and delete is clicked on a different contact**
- Confirmation dialog appears for the contact being deleted (not the one being edited)
- If user confirms deletion:
  - Contact is deleted from list
  - Original edit mode continues (user is still editing the other contact)
  - User must click Cancel to exit edit mode
- If user cancels deletion:
  - Deletion is aborted
  - Edit mode remains active on original contact

#### 4.3 Test Case Responsibility
QA engineers should develop comprehensive test cases for the DELETE feature based on the requirements above. Test cases should cover:
- Confirmation dialog display and user confirmations
- Single and multiple sequential deletions
- Empty state after deleting all contacts
- Delete behavior with concurrent editing
- Search result updates after deletion
- Data removal from both memory and display

### 5. SEARCH Feature - Detailed Specifications

#### 5.1 Search Input & Behavior
**Search Box Location & UI:**
- Search box labeled "Search" or "Filter by name or email"
- Input field is visible and clearly interactive
- Placeholder text: "Search by name or email..." (or similar)
- Search is case-insensitive (e.g., "JOHN", "john", "John" all find "john" in list)

**Real-Time Search:**
- Search results update on every keystroke (keyup event)
- No delay or lag between typing and results appearing
- Results filter immediately without requiring Enter key or button click

**Search Scope - Fields Searched:**
- Searches across First Name, Last Name, Email, Phone (as specified)
- Does NOT search Street Address, City, State, Postal Code
- Searches for partial matches (e.g., "john" finds "Johnny", "johndoe@email.com", etc.)
- Searches must match anywhere in field value (substring match)
  - FIND: "abc" in field value "xabcy" ✓
  - FIND: "abc" in field value "abcxyz" ✓
  - FIND: "abc" in field value "xyzabc" ✓

**Search Result Behavior:**
- Matching contacts remain displayed, non-matching contacts are hidden
- If search term is empty/cleared, all contacts reappear
- Row order remains same (no re-sorting, still in insertion order)
- Search does NOT modify underlying data (non-destructive filter)

**Clear Search:**
- Button labeled "Clear" or with X icon next to search box
- Clicking Clear: Search field becomes empty, all contacts reappear
- If search box is already empty and Clear is clicked: No action needed (already cleared)

**No Results:**
- When search returns zero matches, message displays: "No matches found. Try a different search term."
- List area shows this message instead of empty address rows
- Clear Search button still visible to allow user to restore full list

#### 5.2 Edge Cases - Search
- Search for empty string "" shows all contacts
- Search for space " " may show all contacts or none (depending on implementation)
- Search with special characters (e.g., "@", "+", "-", ".") finds matching characters in data
- Search is updated after adding new contact (new contact is immediately searchable)
- Search is updated after editing contact (edited data is immediately searchable)
- Search is updated after deleting contact (deleted contact is removed from search scope)
- Search text persists in search box even after adding/editing/deleting (user can clear manually)
- Searching while in edit mode: Search continues to filter list, but edit form remains open
- Multiple consecutive searches: Each keystroke results in updated filter

#### 5.3 Test Case Responsibility
QA engineers should develop comprehensive test cases for the SEARCH feature based on the requirements above. Test cases should cover:
- Real-time search updates as user types
- Case-insensitive matching
- Partial string matching across specified fields
- Search scope verification (fields searched vs. not searched)
- Clear/reset behavior
- Search result updates after add/edit/delete operations
- Edge cases with special characters and whitespace

### 6. Form Interaction & State Management

#### 6.1 Form Submission
**Valid Submission:**
- User can submit form by clicking button OR pressing Enter key in any field
- Both methods trigger same validation and submission logic
- After successful submission, form clears completely

**Invalid Submission:**
- Validation errors prevent submission
- Form data is retained for user correction
- Focus may move to first invalid field

**Tab & Keyboard Navigation:**
- Tab key moves focus sequentially through form fields
- Tab order: First Name → Last Name → Email → Phone → Street → City → State → Postal → Button
- Shift+Tab moves backward through fields
- Enter key in any field attempts to submit form (Add Address or Save Changes)
- Can be prevented if TABbing to next field and pressing Shift+Tab behavior

#### 6.2 Data Trimming
**Whitespace Handling:**
- Leading/trailing whitespace is trimmed from all fields before storage
  - Input: "  John  " → Stored: "John"
  - Input: "  john@example.com  " → Stored: "john@example.com"
- Internal whitespace is preserved
  - Input: "Jack  Black" → Stored: "Jack  Black"

#### 6.3 Focus Management
**Add Address Mode:**
- Initial focus on First Name field (optional but recommended)

**Edit Mode:**
- Focus may remain on or move to a form element (implementation detail)

**After Successful Submission:**
- Focus returns to First Name field (recommended) or search box

### 7. State Consistency & Data Integrity

#### 7.1 Data in Memory
**Contact Storage:**
- All contacts stored in single JavaScript array
- Each contact has unique ID (timestamp-based or incrementing numeric ID)
- Contacts are objects with properties: id, firstName, lastName, email, phone, street, city, state, postalCode
- Data is not persisted to server or local storage

**Session Rules:**
- Data persists during entire browser session
- Refreshing page (F5, Ctrl+R) clears ALL data - app returns to empty state
- Closing browser tab loses all data
- Opening app in new tab has empty address book (independent session)

#### 7.2 List & Search Synchronization
**Adding Contact:**
- If search is active and new contact matches filter: Contact appears in filtered results
- If search is active and new contact does NOT match filter: Contact is added to data but not visible in list

**Editing Contact:**
- If search is active:
  - If edited contact now matches filter: Contact remains visible (or becomes visible if previously hidden)
  - If edited contact no longer matches filter: Contact is hidden from view
  - If matching contact is edited but still matches: Contact updates in place
- If search is NOT active: Contact updates in list as normal

**Deleting Contact:**
- Contact is immediately removed from list and memory
- Search scope is updated

### 8. UI/UX & Visual Specifications

#### 8.1 Form Fields
- All input fields should be clearly visible and properly sized (minimum 200px wide, ideally wider)
- Input fields should have visible borders or other visual indication they are interactive
- Placeholder text should be visible and suggest what data is expected
- Required field indicators (asterisk * or "required" label)
- Field labels should be associated with inputs (for accessibility and UX)

#### 8.2 Buttons
- Buttons should be clearly clickable (distinct visual style from regular text)
- Button text should clearly describe action:
  - "Add Address" for initial submission
  - "Save Changes" when editing
  - "Cancel" to discard edits
  - "Edit" per row
  - "Delete" per row
  - "Clear" or "Clear Search" for search
- Buttons should be disabled state if form is invalid (optional but recommended for UX)
- "Cancel" button should only be visible when in edit mode
- Destructive actions (Delete) may have different visual style (e.g., red)

#### 8.3 Messages & Feedback
**Success Messages:**
- "Contact added successfully" after adding
- "Contact updated successfully" after editing
- Message duration: 3-5 seconds before auto-dismissing
- Message text should be green or similar success color
- Message should be dismissible (user can close manually)

**Error Messages:**
- Validation errors displayed next to relevant field(s) in red/error color
- Error text clearly states what is wrong:
  - "First Name is required"
  - "Email must contain @ and ."
  - "This field is required"
- All validation errors for a form displayed simultaneously

**Confirmation Dialogs:**
- Delete confirmation uses browser confirm() or custom modal
- Message format: "Are you sure you want to delete [Contact Name]?"
- Buttons: "OK/Yes" and "Cancel/No"

#### 8.4 Color & Visual Design
- Form area should be visually distinct from list area
- Search area should be visually distinct
- Error fields should have red border or red background tint
- Error text should be red
- Success messages should be green or success color
- Buttons should have hover state (cursor: pointer, color change, etc.)
- List table rows should be visually scannable (alternating row colors optional)
- Icons optional but help with discoverability (e.g., edit pencil icon, delete trash icon)

#### 8.5 Layout Responsiveness
- Application should be usable on screens 400px+ wide (mobile consideration)
- Form and list should stack vertically on narrow screens, side-by-side on wide screens (optional)
- All form fields should be accessible and not hidden due to layout
- Buttons should be large enough to touch on mobile (minimum 44px recommended)

### 9. Browser Compatibility & Performance

#### 9.1 Browser Requirements
**Target Browsers:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Compatibility Issues to Test:**
- Form submission behavior across browsers
- Keyboard event handling (Enter key submission)
- ES6 JavaScript features (arrow functions, const/let, template literals, etc.)
- Event listeners and DOM manipulation

#### 9.2 Performance
**Requirements:**
- Page loads in <1 second (no external resources, single HTML file)
- Adding, editing, deleting, searching should be instantaneous (no perceptible lag)
- List updates should be rendered within 16ms of action (60 FPS)
- With 100+ contacts, all operations should remain responsive

### 10. Accessibility (A11y) Considerations

**Required:**
- Form inputs should have associated labels (<label> tags)
- Form should be navigable with keyboard only (Tab, Shift+Tab, Enter)
- Error messages associated with fields they relate to
- Semantic HTML (form, button, input types)

**Optional but Recommended:**
- ARIA attributes for screen reader support
- Sufficient color contrast for text and buttons
- Focus indicators visible on all interactive elements
- Button

 role on clickable elements if not using <button> tag

## Constraints and Limitations
- No data persistence beyond current browser session
- No backend/database
- No external libraries or CDN resources
- No npm or build process
- No real-time collaboration or multi-user support
- Email validation is basic format checking only (contains @ and one .)
- Phone number format is flexible and not strictly validated
- No duplicate email prevention (same email can be used multiple times)
- No sorting feature built-in
- No pagination (all contacts loaded at once in memory)
- No import/export functionality
- No contact photos or avatars
- Single user per browser tab (no multi-user synchronization)
- Limited to browser's available memory (practical limit ~1000+ contacts)

## Implementation Notes for QA Engineers

### Email Validation Scope
- Validation checks for @ symbol and at least one . character after @
- Does NOT validate that domain is real or reachable
- Does NOT validate against RFC 5322 standard strictly
- Does NOT prevent disposable/temporary email addresses
- Same email can appear on multiple contacts

### Whitespace Handling
- Leading and trailing whitespace is trimmed from ALL fields before storage
- Internal whitespace is preserved
- Empty optional fields store as empty string ""

### Duplicate Prevention
- No unique constraints on any field
- Duplicate emails, names, phone numbers are allowed
- Duplicate detection is Out of Scope

### ID Generation
- Each contact assigned unique ID on creation
- ID persists for contact's lifetime in session
- ID can be numeric (incrementing) or timestamp-based
- ID is NOT displayed to user but must be used internally to identify contacts

### Search Matching
- Case-insensitive substring matching
- Matches the following fields ONLY: firstName, lastName, email, phone
- Does NOT match: street, city, state, postalCode
- Single search term (no complex boolean operators like AND/OR)
- No weighted results or relevance ranking

### Edit Mode Behavior
- Only one contact can be edited at a time
- Clicking Edit on a different contact cancels previous edit without confirmation
- Form retains data until Cancel is clicked or Save completes
- No auto-save feature

### Delete Behavior
- Confirmation dialog required before permanent deletion
- No undo feature - deletion is permanent for session
- Deleted contact completely removed from memory

### Form Submission
- Can be triggered by button click or Enter key in any field
- Both methods use identical submission logic
- Form field-level validation is checked before submission
- If validation passes, all fields are processed regardless of which triggered submission

## Future Enhancements (Out of Scope)
- Local storage for data persistence across sessions
- Export to CSV/JSON file format
- Import from CSV/JSON files
- Multiple address books or groups
- Contact categories/tags
- Photo/avatar support
- Advanced search with multiple filters
- Sorting by column (ascending/descending)
- Pagination for large datasets  
- Bulk operations (delete multiple, import multiple)
- Contact notes or custom fields
- Birthday/anniversary tracking
- Relationship mapping (knows, related to, etc.)
- Duplicate contact detection/merging
- Contact activity history
- Mobile-specific optimizations beyond responsive design
