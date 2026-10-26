const {test, expect} = require('@playwright/test');

test('team dependencies distinguish shared capabilities from deployment order and consumers', async ({page}, testInfo) => {
  await page.goto('/platform-grouping#team-dependencies');
  const view = page.getByRole('region', {name: 'Team dependencies'});
  await expect(view.getByRole('list', {name: 'Deployment order'}).getByRole('link')).toHaveText(['Logos', 'Corpus', 'Pneuma']);
  for (const team of ['arche', 'ekklesia', 'techne', 'logos', 'corpus', 'pneuma']) {
    await expect(view.getByRole('link', {name: new RegExp(`^${team}$`, 'i')})).toHaveAttribute('href', `/platform-grouping/${team}`);
  }
  await expect(view).toContainText('Runtime and platform services, including secrets');
  await expect(view).toContainText('Documentation and tooling');
  await view.screenshot({path: testInfo.outputPath('dependencies-desktop.png')});
  await page.setViewportSize({width: 390, height: 900});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await view.screenshot({path: testInfo.outputPath('dependencies-mobile.png')});
});
