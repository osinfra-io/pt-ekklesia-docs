const {test, expect} = require('@playwright/test');

test('invocation tabs expose each complete set of instructions to keyboard users', async ({page}) => {
  await page.goto('/onboarding');
  const cli = page.getByRole('tab', {name: 'Copilot CLI', exact: true});
  await expect(cli).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('read -rs NOMOS_GITHUB_TOKEN');
  await cli.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', {name: 'GitHub UI', exact: true})).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel').getByRole('link')).toHaveAttribute('href', 'https://github.com/osinfra-io/pt-techne-agents/agents');
  await page.getByRole('tab', {name: 'VS Code', exact: true}).click();
  await expect(page.getByRole('tabpanel')).toContainText('start a Copilot Chat session');
  await expect(page.getByRole('heading', {name: /^How It Works/})).toHaveAttribute('id', 'how-it-works');
  await expect(page.getByRole('list', {name: 'Onboarding workflow'}).getByRole('listitem')).toHaveCount(3);
});

test('invocation instructions remain readable without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await page.goto('/onboarding');
  await expect(page.getByRole('tabpanel')).toHaveCount(3);
  await expect(page.getByRole('tabpanel').filter({hasText: 'start a Copilot Chat session'})).toBeVisible();
  await context.close();
});

test('schema maps expand recursively with accessible controls and survive filtering on mobile', async ({page}, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/platform-grouping/logos/team-topology');
  await page.getByRole('switch', {name: /Optional/}).check();
  const project = page.getByRole('button', {name: /platform_managed_project/});
  await project.focus();
  await page.keyboard.press('Enter');
  await expect(project).toHaveAttribute('aria-expanded', 'true');
  const sql = page.getByRole('button', {name: /^cloud_sql/});
  await sql.click();
  await expect(sql).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('main')).toContainText('database_version');
  await page.getByRole('button', {name: /^github_repositories/}).click();
  await page.getByRole('button', {name: /^pages object/}).click();
  const pageFields = page.locator('.mantine-Accordion-panel').filter({has: page.locator('code').filter({hasText: /^build_type$/})}).last();
  await expect(pageFields).toContainText('"legacy"');
  await expect(pageFields).toContainText('"workflow"');
  await page.screenshot({path: testInfo.outputPath('schema-desktop.png'), fullPage: true});
  await page.setViewportSize({width: 390, height: 900});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path: testInfo.outputPath('schema-mobile.png'), fullPage: true});
  await page.getByRole('switch', {name: /Optional/}).uncheck();
  await expect(project).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('onboarding keeps form and instruction tabs within the mobile content area', async ({page}, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/onboarding');
  await page.getByRole('switch', {name: /Optional/}).check();
  for (const width of [1280, 390]) {
    await page.setViewportSize({width, height: 900});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('textbox', {name: 'Team key', exact: true}).scrollIntoViewIfNeeded();
    await page.screenshot({path: testInfo.outputPath(`onboarding-${width}.png`)});
  }
  expect(errors).toEqual([]);
});
