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

test('Team Topologies pages use centered outline icons for load indicators', async ({page}) => {
  const paths = [
    '/platform-grouping/operating-model',
    '/platform-grouping/arche',
    '/platform-grouping/corpus',
    '/platform-grouping/ekklesia',
    '/platform-grouping/logos',
    '/platform-grouping/pneuma',
    '/platform-grouping/techne',
  ];

  for (const path of paths) {
    await page.goto(path);
    const indicators = page.locator('.status-indicator');
    await expect(indicators.first()).toBeVisible();
    await expect(indicators.locator('svg[aria-hidden="true"]')).toHaveCount(
      await indicators.count(),
    );
    await expect(page.locator('article')).not.toContainText(/[🔵🟡🟢🟠🔴]/u);
    await expect(indicators.first()).toHaveCSS('display', 'inline-flex');
    await expect(indicators.first()).toHaveCSS('align-items', 'center');
    await expect(indicators.first()).toHaveCSS('vertical-align', 'middle');
  }
});
