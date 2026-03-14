import { test, expect } from '@playwright/test';

/**
 * Address Book tests aligned to specification.md
 * - CREATE (Add Address), READ (Display), UPDATE (Edit), DELETE, SEARCH
 * - Form validation, UI state, and data integrity per spec
 */

test.describe('Address Book', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/address-book.html');
    await expect(page.getByRole('heading', { name: 'Add New Address' })).toBeVisible({
      timeout: 10000,
    });
  });

  test.describe('1. CREATE (Add Address) - Spec §1', () => {
    test('1.2 initial state: heading "Add New Address", Cancel not visible, Add Address visible', async ({
      page,
    }) => {
      await expect(page.getByRole('heading', { name: 'Add New Address' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancel' })).not.toBeVisible();
      await expect(page.getByRole('button', { name: 'Add Address' })).toBeVisible();
    });

    test('1.1 required fields and validation: empty submit shows all required errors', async ({
      page,
    }) => {
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.getByText('First Name is required')).toBeVisible();
      await expect(page.getByText('Last Name is required')).toBeVisible();
      await expect(page.getByText('Email is required')).toBeVisible();
    });

    test('1.1 invalid email: rejected and no contact added', async ({ page }) => {
      await page.locator('#firstName').fill('Jane');
      await page.locator('#lastName').fill('Doe');
      await page.locator('#email').fill('not-an-email');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      const appError = page.getByText('Please enter a valid email address');
      const noContactAdded = page.getByText('No addresses in your book');
      await expect(appError.or(noContactAdded)).toBeVisible();
      await expect(page.locator('#contactsList')).not.toContainText('Jane');
    });

    test('1.2 valid submission: contact added, list updated, success message', async ({ page }) => {
      await page.locator('#firstName').fill('Alice');
      await page.locator('#lastName').fill('Smith');
      await page.locator('#email').fill('alice@example.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());

      await expect(page.getByText('Contact added successfully')).toBeVisible();
      await expect(page.locator('#contactsList')).toContainText('Alice', { timeout: 10000 });
      await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Smith', exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'alice@example.com', exact: true })).toBeVisible();
    });

    test('1.2 optional fields: phone and street accepted and phone shown in table', async ({
      page,
    }) => {
      await page.locator('#firstName').fill('Bob');
      await page.locator('#lastName').fill('Jones');
      await page.locator('#email').fill('bob@test.com');
      await page.locator('#phone').fill('555-1234');
      await page.locator('#street').fill('123 Main St');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());

      await expect(page.locator('#contactsList')).toContainText('Bob', { timeout: 10000 });
      await expect(page.getByRole('cell', { name: 'Bob', exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: '555-1234', exact: true })).toBeVisible();
    });

    test('6.2 whitespace trimming: leading/trailing trimmed before storage and display', async ({
      page,
    }) => {
      await page.locator('#firstName').fill('  John  ');
      await page.locator('#lastName').fill('  Doe  ');
      await page.locator('#email').fill('john@example.com'); // no spaces so browser allows submit
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());

      await expect(page.locator('#contactsList')).toContainText('John', { timeout: 10000 });
      await expect(page.getByRole('cell', { name: 'John', exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Doe', exact: true })).toBeVisible();
    });
  });

  test.describe('2. READ (Display Addresses) - Spec §2', () => {
    test('2.1 empty state: message when no addresses', async ({ page }) => {
      await expect(
        page.getByText('No addresses in your book. Add one to get started.')
      ).toBeVisible();
    });

    test('2.1 table structure: columns First Name, Last Name, Email, Phone, Actions', async ({
      page,
    }) => {
      await page.locator('#firstName').fill('A');
      await page.locator('#lastName').fill('B');
      await page.locator('#email').fill('a@b.co');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());

      await expect(page.getByRole('columnheader', { name: 'First Name' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Last Name' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Phone' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
    });

    test('2.2 Edit and Delete buttons per row', async ({ page }) => {
      await page.locator('#firstName').fill('Edit');
      await page.locator('#lastName').fill('Test');
      await page.locator('#email').fill('edit@test.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());

      await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Delete' }).first()).toBeVisible();
    });
  });

  test.describe('3. UPDATE (Edit Address) - Spec §3', () => {
    test('3.1 entering edit mode: heading and Save Changes, Cancel visible', async ({ page }) => {
      await page.locator('#firstName').fill('Old');
      await page.locator('#lastName').fill('Name');
      await page.locator('#email').fill('old@example.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('Old', { timeout: 10000 });

      await page.getByRole('button', { name: 'Edit' }).first().click();
      await expect(page.getByRole('heading', { name: /Edit Address: Old Name/ })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    test('3.2 saving changes: list updates, success message, form returns to Add mode', async ({
      page,
    }) => {
      await page.locator('#firstName').fill('Old');
      await page.locator('#lastName').fill('Name');
      await page.locator('#email').fill('old@example.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('Old', { timeout: 10000 });

      await page.getByRole('button', { name: 'Edit' }).first().click();
      await page.locator('#firstName').fill('New');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());

      await expect(page.getByText('Contact updated successfully')).toBeVisible();
      await expect(page.locator('#contactsList')).toContainText('New', { timeout: 10000 });
      await expect(page.getByRole('cell', { name: 'New', exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Old', exact: true })).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'Add New Address' })).toBeVisible();
    });

    test('3.2 cancelling edit: form reverts to Add New Address, list unchanged', async ({
      page,
    }) => {
      await page.locator('#firstName').fill('One');
      await page.locator('#lastName').fill('Contact');
      await page.locator('#email').fill('one@example.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('One', { timeout: 10000 });
      await page.getByRole('button', { name: 'Edit' }).first().click();

      await page.locator('#cancelBtn').evaluate((el: HTMLElement) => el.click());

      await expect(page.getByRole('heading', { name: 'Add New Address' })).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByRole('button', { name: 'Add Address' })).toBeVisible();
      await expect(page.locator('#firstName')).toHaveValue('');
      await expect(page.getByRole('cell', { name: 'One', exact: true })).toBeVisible();
    });
  });

  test.describe('4. DELETE - Spec §4', () => {
    test('4.1 delete with confirmation: contact removed, success message, empty state if last', async ({
      page,
    }) => {
      await page.locator('#firstName').fill('Delete');
      await page.locator('#lastName').fill('Me');
      await page.locator('#email').fill('delete@example.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('Delete', { timeout: 10000 });

      page.on('dialog', (dialog) => dialog.accept());
      await page.getByRole('button', { name: 'Delete' }).first().click();

      await expect(page.getByText('Contact deleted successfully')).toBeVisible();
      await expect(page.getByText('No addresses in your book')).toBeVisible();
    });
  });

  test.describe('5. SEARCH - Spec §5', () => {
    test('5.1 real-time search: filter by name, no results message when no match', async ({
      page,
    }) => {
      await page.locator('#firstName').fill('Alice');
      await page.locator('#lastName').fill('Smith');
      await page.locator('#email').fill('alice@example.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('Alice', { timeout: 10000 });

      await page.locator('#searchInput').fill('Alice');
      await page.locator('#searchInput').press('Tab');
      await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible();

      await page.locator('#searchInput').fill('Nobody');
      await page.locator('#searchInput').evaluate((el: HTMLInputElement) => {
        el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      });
      await expect(page.getByText('No matches found. Try a different search term.')).toBeVisible();
    });

    test('5.1 case-insensitive: search "alice" finds contact with first name "Alice"', async ({
      page,
    }) => {
      await page.locator('#firstName').fill('Alice');
      await page.locator('#lastName').fill('Smith');
      await page.locator('#email').fill('alice@example.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('Alice', { timeout: 10000 });

      await page.locator('#searchInput').fill('alice');
      await page.locator('#searchInput').evaluate((el: HTMLInputElement) => {
        el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      });
      await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible();
    });

    test('5.1 Clear search: restores full list, search box empty', async ({ page }) => {
      await page.locator('#firstName').fill('Alice');
      await page.locator('#lastName').fill('Smith');
      await page.locator('#email').fill('alice@example.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('Alice', { timeout: 10000 });

      await page.locator('#searchInput').fill('Ali');
      await page.locator('#searchInput').press('Tab');
      await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Clear' }).click();
      await expect(page.locator('#searchInput')).toHaveValue('');
      await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible();
    });
  });

  test.describe('UI & data integrity - Spec §8, §7', () => {
    test('header: title and subtitle visible', async ({ page }) => {
      await expect(page).toHaveTitle('Simple Address Book');
      await expect(page.getByRole('heading', { name: 'Address Book', level: 1 })).toBeVisible();
      await expect(page.getByText('Manage your contacts with ease')).toBeVisible();
    });

    test('form: required field labels and Add Address button', async ({ page }) => {
      await expect(page.getByLabel(/First Name/)).toBeVisible();
      await expect(page.getByLabel(/Last Name/)).toBeVisible();
      await expect(page.getByLabel(/Email/)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add Address' })).toBeVisible();
    });

    test('XSS: script payload escaped in list (no execution)', async ({ page }) => {
      const xssPayload = "<script>alert('xss')</script>";
      await page.locator('#firstName').fill(xssPayload);
      await page.locator('#lastName').fill('User');
      await page.locator('#email').fill('xss@test.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());

      await expect(page.locator('#contactsList')).toContainText('script', { timeout: 10000 });
      await expect(page.locator('tbody td').first()).toContainText('script');
      await expect(page.locator('table')).toBeVisible();
    });
  });

  test.describe('QA concerns (edge cases & regression)', () => {
    test('QA-1: focused input remains usable height (no 8px collapse)', async ({ page }) => {
      const input = page.locator('#firstName');
      await input.focus();
      const height = await input.evaluate((el: HTMLElement) => el.getBoundingClientRect().height);
      expect(height).toBeGreaterThanOrEqual(20);
    });

    test('QA-2/9: search does not crash when contact has no phone (optional fields missing)', async ({
      page,
    }) => {
      await page.locator('#firstName').fill('NoPhone');
      await page.locator('#lastName').fill('User');
      await page.locator('#email').fill('nophone@test.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('NoPhone', { timeout: 10000 });

      await page.locator('#searchInput').fill('NoPhone');
      await page.locator('#searchInput').evaluate((el: HTMLInputElement) => {
        el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      });
      await expect(page.getByRole('cell', { name: 'NoPhone', exact: true })).toBeVisible();
    });

    test('QA-3/7: contact with only required fields shows no "undefined" in table or edit form', async ({
      page,
    }) => {
      await page.locator('#firstName').fill('Required');
      await page.locator('#lastName').fill('Only');
      await page.locator('#email').fill('required@only.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('Required', { timeout: 10000 });

      await expect(page.locator('#contactsList')).not.toContainText('undefined');
      await page.getByRole('button', { name: 'Edit' }).first().click();
      await expect(page.locator('#phone')).toHaveValue('');
      await expect(page.locator('#street')).toHaveValue('');
      await expect(page.locator('#firstName')).not.toHaveValue('undefined');
    });

    test('QA-4a: table column header spells "First Name" (spec)', async ({ page }) => {
      await page.locator('#firstName').fill('A');
      await page.locator('#lastName').fill('B');
      await page.locator('#email').fill('a@b.co');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.getByRole('columnheader', { name: 'First Name' })).toBeVisible();
    });

    test('QA-4b: search placeholder includes "name" and "email" (spec)', async ({ page }) => {
      const placeholder = await page.locator('#searchInput').getAttribute('placeholder') ?? '';
      expect(placeholder.toLowerCase()).toContain('name');
      expect(placeholder.toLowerCase()).toContain('email');
    });

    test('QA-5: delete confirmation message includes contact name', async ({ page }) => {
      await page.locator('#firstName').fill('Confirm');
      await page.locator('#lastName').fill('Delete');
      await page.locator('#email').fill('confirm@delete.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('Confirm', { timeout: 10000 });

      const dialogText: string[] = [];
      page.on('dialog', (dialog) => {
        dialogText.push(dialog.message());
        dialog.accept();
      });
      await page.getByRole('button', { name: 'Delete' }).first().click();
      expect(dialogText.some((m) => m.includes('Confirm') && m.includes('Delete'))).toBe(true);
    });

    test('QA-8: Cancel button visible and restores form to Add mode', async ({ page }) => {
      await page.locator('#firstName').fill('Cancel');
      await page.locator('#lastName').fill('Test');
      await page.locator('#email').fill('cancel@test.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('Cancel', { timeout: 10000 });
      await page.getByRole('button', { name: 'Edit' }).first().click();

      const cancelBtn = page.locator('#cancelBtn');
      await expect(cancelBtn).toBeVisible();
      const box = await cancelBtn.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(20);

      await cancelBtn.evaluate((el: HTMLElement) => el.click());
      await expect(page.getByRole('heading', { name: 'Add New Address' })).toBeVisible({
        timeout: 10000,
      });
    });

    test('QA-10: success message visible after add', async ({ page }) => {
      await page.locator('#firstName').fill('Success');
      await page.locator('#lastName').fill('Msg');
      await page.locator('#email').fill('success@msg.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.getByText('Contact added successfully')).toBeVisible();
    });

    test('QA-12: very long name (50 chars) still renders in table without breaking layout', async ({
      page,
    }) => {
      const longName = 'A'.repeat(50);
      await page.locator('#firstName').fill(longName);
      await page.locator('#lastName').fill('Long');
      await page.locator('#email').fill('long@test.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());

      await expect(page.locator('#contactsList')).toContainText(longName, { timeout: 10000 });
      await expect(page.locator('table')).toBeVisible();
      await expect(page.getByRole('cell', { name: longName, exact: true })).toBeVisible();
    });

    test('QA-13: focused input has visible focus indicator (outline or border)', async ({ page }) => {
      await page.locator('#firstName').focus();
      const outline = await page.locator('#firstName').evaluate((el: Element) => {
        const s = window.getComputedStyle(el);
        return { outlineWidth: s.outlineWidth, outlineStyle: s.outlineStyle, borderColor: s.borderColor };
      });
      const hasOutline =
        (parseInt(outline.outlineWidth, 10) > 0 && outline.outlineStyle !== 'none') ||
        outline.borderColor !== 'rgba(0, 0, 0, 0)';
      expect(hasOutline).toBe(true);
    });

    test('QA-17: XSS — all contact fields escaped in table (no script execution)', async ({
      page,
    }) => {
      await page.locator('#firstName').fill("<img onerror='window.__xss=1'>");
      await page.locator('#lastName').fill('Safe');
      await page.locator('#email').fill('xss2@test.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());

      await expect(page.locator('#contactsList')).toContainText('Safe', { timeout: 10000 });
      const xssFired = await page.evaluate(() => (window as unknown as { __xss?: number }).__xss === 1);
      expect(xssFired).toBe(false);
    });
  });

  test.describe('Mobile viewport', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('viewport meta and layout: form and Add Address visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Add New Address' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add Address' })).toBeVisible();
      await expect(page.locator('#firstName')).toBeVisible();
    });

    test('touch targets: primary button has min height 44px at 600px width', async ({ page }) => {
      await page.setViewportSize({ width: 600, height: 800 });
      const btn = page.getByRole('button', { name: 'Add Address' });
      await expect(btn).toBeVisible();
      const box = await btn.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    });

    test('add contact and table scroll: full flow works in mobile viewport', async ({ page }) => {
      await page.locator('#firstName').fill('Mobile');
      await page.locator('#lastName').fill('User');
      await page.locator('#email').fill('mobile@test.com');
      await page.locator('#contactForm').evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('#contactsList')).toContainText('Mobile', { timeout: 10000 });
      await expect(page.getByRole('cell', { name: 'Mobile', exact: true })).toBeVisible();
    });
  });
});
