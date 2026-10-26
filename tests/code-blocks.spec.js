const {test, expect} = require('@playwright/test');

test('code examples use the site charcoal palette without losing syntax or copy controls', async ({page}) => {
  await page.goto('/platform-grouping/logos/team-topology');
  const block = page.locator('pre').filter({hasText: 'route_auth_policies'}).first();
  await expect(block).toHaveCSS('background-color', 'rgb(35, 35, 35)');
  await expect(block).toContainText('required_groups');
  await expect(block.locator('.token.string').first()).toHaveCSS('color', 'rgb(206, 145, 120)');
  const wrapper = block.locator('..');
  await expect(wrapper.getByRole('button', {name: /Copy code/})).toHaveCount(1);
  await page.setViewportSize({width: 390, height: 900});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
