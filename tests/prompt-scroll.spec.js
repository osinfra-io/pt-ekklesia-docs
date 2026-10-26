const {test, expect} = require('@playwright/test');

test('the prompt title and copy control stay below the navbar while scrolling', async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.goto('/onboarding');
  await page.getByRole('textbox', {name: /Maintainers/}).scrollIntoViewIfNeeded();
  const title = page.getByText('Generated prompt', {exact: true});
  const navbar = page.locator('.navbar');
  await expect.poll(async () => {
    const headerBounds = await title.boundingBox();
    const navbarBounds = await navbar.boundingBox();
    return headerBounds.y >= navbarBounds.y + navbarBounds.height;
  }).toBe(true);
  await expect(page.getByRole('button', {name: 'Copy prompt'})).toBeInViewport();
});
