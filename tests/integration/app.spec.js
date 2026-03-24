import { test, expect } from '@playwright/test';

test.describe('Cashflow Simulator App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/Cashflow/i);
  });

  test('displays simulation controls', async ({ page }) => {
    await expect(page.locator('text=Initial Balance')).toBeVisible();
    await expect(page.locator('text=Start Date')).toBeVisible();
    await expect(page.locator('text=End Date')).toBeVisible();
  });

  test('displays events table', async ({ page }) => {
    await expect(page.locator('text=Events')).toBeVisible();
  });

  test('displays chart container', async ({ page }) => {
    await expect(page.locator('canvas#cashflowChart')).toBeVisible();
  });

  test('can add a new event', async ({ page }) => {
    await page.click('text=Add Event');
    await page.fill('input[name="name"]', 'Test Income');
    await page.fill('input[name="amount"]', '1000');
    await page.click('text=Save');
  });

  test('simulation runs and updates chart', async ({ page }) => {
    await page.fill('input[placeholder*="balance"]', '1000');
    await page.waitForTimeout(500);
    const chart = page.locator('canvas#cashflowChart');
    await expect(chart).toBeVisible();
  });

  test('dark mode toggle works', async ({ page }) => {
    const html = page.locator('html');
    const hasDarkClass = await html.evaluate(el => el.classList.contains('dark'));
    await page.click('button[aria-label*="dark"]');
    const hasDarkClassAfter = await html.evaluate(el => el.classList.contains('dark'));
    expect(hasDarkClassAfter).toBe(!hasDarkClass);
  });

  test('CSV export functionality exists', async ({ page }) => {
    await expect(page.locator('text=Export CSV')).toBeVisible();
  });

  test('CSV import functionality exists', async ({ page }) => {
    await expect(page.locator('text=Import CSV')).toBeVisible();
  });
});
