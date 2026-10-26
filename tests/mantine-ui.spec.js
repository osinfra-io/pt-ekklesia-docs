const {test, expect} = require('@playwright/test');

test('the shared theme supplies layout variables on every kind of page', async ({page}) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  for (const path of ['/', '/getting-started', '/onboarding', '/ecosystem']) {
    await page.goto(path);
    await expect(page.locator('style[data-mantine-styles="true"]')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark');
    expect(await page.locator('html').evaluate(element =>
      getComputedStyle(element).getPropertyValue('--mantine-scale').trim(),
    )).toBe('1');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(page.locator('.navbar')).toBeVisible();
  }

  expect(errors).toEqual([]);
});

test('shared cards preserve headings, descriptions, links, and keyboard activation', async ({page}) => {
  await page.goto('/getting-started');
  const cards = page.locator('.mantine-Card-root');
  await expect(cards).toHaveCount(3);
  await expect(cards.locator('h3')).toHaveText([
    'Onboard Your Team', 'Expose and Protect a Route', 'Glossary',
  ]);
  await expect(cards.first().locator('p')).toContainText('Nomos opens the pull requests.');
  await expect(cards.first().locator('svg[aria-hidden="true"]')).toHaveCount(1);
  await expect(cards.locator('svg.tabler-icon')).toHaveCount(3);
  await expect(cards.first().locator('.mantine-ThemeIcon-root')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const link = cards.first().getByRole('link', {name: 'Start onboarding'});
  await expect(link).toHaveAttribute('href', '/onboarding');
  await link.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(link).toBeFocused();
  expect(await link.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.locator('style[data-mantine-styles="true"]')).toHaveCount(1);
  expect(await page.locator('html').evaluate(element =>
    getComputedStyle(element).getPropertyValue('--mantine-scale').trim(),
  )).toBe('1');
});

test('card grids adapt to desktop, tablet, and mobile without overflow', async ({page}, testInfo) => {
  await page.goto('/getting-started');
  const grid = page.locator('.mantine-SimpleGrid-root');
  await expect(grid).toHaveCount(1);

  for (const [width, columns] of [[1280, 3], [900, 2], [390, 1]]) {
    await page.setViewportSize({width, height: 900});
    await expect.poll(() => grid.evaluate(element =>
      getComputedStyle(element).gridTemplateColumns.split(' ').length,
    )).toBe(columns);
    expect(await page.evaluate(() =>
      document.documentElement.scrollWidth <= window.innerWidth,
    )).toBe(true);
    await page.screenshot({path: testInfo.outputPath(`getting-started-${width}.png`), fullPage: true});
  }
});

test('information-only cards and non-card grid children remain readable', async ({page}) => {
  await page.goto('/enabling-teams/soteria');
  const cards = page.locator('.mantine-Card-root');
  await expect(cards).toHaveCount(8);
  await expect(cards.getByRole('link')).toHaveCount(0);
  await expect(cards.first().getByRole('heading', {name: 'Secure by default'})).toBeVisible();

  await page.goto('/platform-grouping/corpus/networking');
  const activeGrid = page.locator('.mantine-SimpleGrid-root').first();
  await expect(activeGrid.getByRole('heading', {name: 'pt-pneuma-us-east1-b', exact: true})).toBeVisible();
  await expect(activeGrid.locator('dl').first()).toContainText('10.60.0.0/20');
  await page.setViewportSize({width: 390, height: 900});
  await expect(activeGrid).toHaveCSS('display', 'grid');
  expect(await activeGrid.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test('the timeline retains sized Tabler icons and separated bullets after theme centralization', async ({page}) => {
  await page.goto('/getting-started');
  const timeline = page.getByRole('list', {name: 'Four steps to use the platform'});
  await expect(timeline.getByRole('listitem')).toHaveCount(4);
  await expect(timeline.locator('svg[aria-hidden="true"]')).toHaveCount(4);
  const bullet = timeline.locator('.mantine-Timeline-itemBullet').first();
  await expect(bullet).toHaveCSS('width', '30px');
  await expect(bullet).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(bullet).toHaveCSS('border-color', 'rgba(0, 0, 0, 0)');
  await expect(bullet).toHaveCSS('color', 'rgb(255, 180, 0)');
  const body = timeline.locator('.mantine-Timeline-itemBody').first();
  const bulletBounds = await bullet.boundingBox();
  const bodyBounds = await body.boundingBox();
  expect(bulletBounds.x + bulletBounds.width).toBeLessThanOrEqual(bodyBounds.x);
});

test('the route timeline preserves the deployment sequence and fits mobile screens', async ({page}) => {
  await page.goto('/getting-started/expose-a-route');
  const timeline = page.getByRole('list', {name: 'Five steps to expose and protect a route'});
  await expect(timeline.getByRole('listitem')).toHaveCount(5);
  await expect(timeline.locator('.mantine-Timeline-itemTitle')).toHaveText([
    'Ask Nomos',
    'Review the Logos pull request',
    'Pneuma renders routing and authentication',
    'The shared gateway enforces access',
    'Requests reach your service',
  ]);
  await expect(timeline.locator('svg[aria-hidden="true"]')).toHaveCount(5);
  await expect(page.getByRole('heading', {name: 'Choose an Authentication Mode'})).toBeVisible();
  await page.setViewportSize({width: 390, height: 900});
  expect(await timeline.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
});
