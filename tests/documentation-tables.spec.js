const {test, expect} = require('@playwright/test');

test('Markdown tables retain content with quiet borders and readable headers', async ({page}, testInfo) => {
  await page.goto('/platform-grouping/logos/saas-governance#components');
  const table = page.getByRole('table').filter({hasText: 'datadog-org-policy'});
  await expect(table.getByRole('columnheader')).toHaveText(['Component', 'Description']);
  await expect(table.getByRole('cell').first()).toHaveText('datadog-org-policy');
  await expect(table.getByRole('columnheader').first()).toHaveCSS('text-align', 'start');
  await expect(table.getByRole('cell').first()).toHaveCSS('border-left-width', '0px');
  await expect(table.getByRole('cell').first()).toHaveCSS('border-right-width', '0px');
  await table.scrollIntoViewIfNeeded();
  await page.screenshot({path: testInfo.outputPath('components-table.png')});
  await page.setViewportSize({width: 390, height: 900});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('wide Markdown tables scroll within the page on mobile', async ({page}) => {
  await page.setViewportSize({width: 390, height: 900});
  await page.goto('/getting-started');
  const table = page.getByRole('table').filter({hasText: 'You provide'});
  await expect(table.getByRole('columnheader')).toHaveCount(4);
  const container = table.locator('../..');
  await expect(container).toHaveCSS('overflow-x', 'auto');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('status indicator aligns its icon with its label', async ({page}) => {
  await page.goto('/platform-grouping/operating-model');
  const indicator = page.locator('.status-indicator').first();

  await expect(indicator).toBeVisible();
  await expect(indicator.locator('svg[aria-hidden="true"]')).toHaveCount(1);
  await expect(indicator).toHaveCSS('display', 'inline-flex');
  await expect(indicator).toHaveCSS('align-items', 'center');
});
