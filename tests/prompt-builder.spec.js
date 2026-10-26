const {test, expect} = require('@playwright/test');
const schema = require('../src/components/SchemaViewer/team.schema.json');

async function openBuilder(page) {
  await page.goto('/onboarding');
}

async function fillRequiredFields(page) {
  await page.getByRole('textbox', {name: 'Description'}).fill('Trust and reliability for the platform.');
  await page.getByRole('textbox', {name: 'Maintainers'}).fill('brettcurtis');
}

function promptOutput(page) {
  return page.getByText('Generated prompt', {exact: true}).locator('..').locator('..').locator('pre');
}

test('field validation and schema descriptions remain accessible', async ({page}) => {
  await openBuilder(page);

  const teamKey = page.getByRole('textbox', {name: 'Team key'});
  await expect(teamKey).toHaveAttribute('aria-describedby', /pb-team-key-description/);
  await expect(page.locator('#pb-team-key-description')).toHaveText(schema.properties.team_key.description);

  await teamKey.fill('not-a-team-key');
  await expect(page.getByText('Must match pattern: (pt|st|ct|et)-<slug>, e.g. st-fides')).toBeVisible();

  await page.getByRole('textbox', {name: 'Display name'}).fill('lowercase');
  await expect(page.getByText('Title Case required, e.g. "Fides" or "Trust and Safety"')).toBeVisible();

  await page.getByRole('textbox', {name: 'Admin email'}).fill('not-an-email');
  await expect(page.getByText('Must be a valid email address')).toBeVisible();

  await teamKey.fill('');
  await page.getByRole('textbox', {name: 'Display name'}).fill('');
  await page.getByRole('textbox', {name: 'Admin email'}).fill('');
  await page.getByRole('textbox', {name: 'Description'}).fill(' ');
  await page.getByRole('textbox', {name: 'Maintainers'}).fill(' ');
  await page.getByRole('button', {name: 'Copy prompt'}).click();
  await expect(page.getByText('Description is required')).toBeVisible();
  await expect(page.getByText('At least one maintainer is required')).toBeVisible();
});

test('optional capabilities preserve dependencies and generate normalized prompt data', async ({page}) => {
  await openBuilder(page);
  const optional = page.getByRole('switch', {name: /Optional/});
  await expect(page.getByRole('textbox', {name: 'Members'})).toHaveCount(0);
  await optional.click();
  await expect(page.locator('#pb-members-description')).toHaveText(schema.$defs.usernameList.description);
  await expect(page.locator('#pb-repos-description')).toHaveText(schema.properties.github_repositories.description);

  const stateManagement = page.getByRole('switch', {name: /enable_opentofu_state_management/});
  await expect(stateManagement).toBeDisabled();
  await page.getByRole('switch', {name: /^enable_workflows/}).check();
  await expect(stateManagement).toBeEnabled();
  await stateManagement.check();

  const cloudSql = page.getByRole('switch', {name: /platform_managed_project\.cloud_sql/});
  await expect(page.getByRole('combobox', {name: 'Database version'})).toHaveCount(0);
  await cloudSql.check();
  await expect(page.getByRole('combobox', {name: 'Database version'})).toBeVisible();
  await expect(page.getByRole('combobox', {name: 'Machine tier'})).toBeVisible();
  await page.getByRole('combobox', {name: 'Database version'}).click();
  await page.getByRole('option', {name: 'POSTGRES_16'}).click();
  await page.getByRole('combobox', {name: 'Machine tier'}).fill('db-g1-small');
  await page.getByRole('combobox', {name: 'Regions'}).click();
  await page.getByRole('option', {name: 'us-east1'}).click();

  const kubernetes = page.getByRole('switch', {name: /platform_managed_project\.kubernetes_engine/});
  await kubernetes.check();
  await page.getByRole('combobox', {name: 'Locations (zones)'}).click();
  await page.getByRole('option', {name: 'us-east1-b'}).click();
  const regionPill = page.locator('.mantine-Pill-root').filter({hasText: /^us-east1$/});
  await expect(regionPill).toHaveCSS('align-items', 'center');
  expect(await regionPill.evaluate(element => parseFloat(getComputedStyle(element).borderRadius))).toBeGreaterThan(0);
  await regionPill.getByRole('button', {includeHidden: true}).click();
  await expect(regionPill).toHaveCount(0);
  await page.getByRole('combobox', {name: 'Regions'}).click();
  await page.getByRole('option', {name: 'us-east1'}).click();

  await page.getByRole('textbox', {name: 'Team key'}).fill(' ST-Fides ');
  await page.getByRole('textbox', {name: 'Display name'}).fill('Fides');
  await fillRequiredFields(page);
  await page.getByRole('textbox', {name: 'Maintainers'}).fill('brettcurtis\njanesmith');
  await page.getByRole('textbox', {name: 'Members'}).fill('joesmith, janesmith');
  await page.getByRole('textbox', {name: 'Repositories'}).fill('st-fides\nst-fides-api');

  const prompt = promptOutput(page);
  await expect(prompt).toContainText('Team key: st-fides');
  await expect(prompt).toContainText('Maintainers: brettcurtis, janesmith');
  await expect(prompt).toContainText('Members: joesmith, janesmith');
  await expect(prompt).toContainText('- st-fides-api');
  await expect(prompt).toContainText('enable_opentofu_state_management');
  await expect(prompt).toContainText('Cloud SQL: database_version=POSTGRES_16, machine_tier=db-g1-small, regions=us-east1');
  await expect(prompt).toContainText('Kubernetes Engine: locations=us-east1-b');

  await cloudSql.uncheck();
  await expect(page.getByRole('combobox', {name: 'Database version'})).toHaveCount(0);
  await kubernetes.uncheck();
  await expect(page.getByRole('combobox', {name: 'Locations (zones)'})).toHaveCount(0);
});

test('GCP API discovery suggestions are selectable', async ({page}) => {
  let discoveryRequests = 0;
  await page.route('https://discovery.googleapis.com/discovery/v1/apis', async route => {
    discoveryRequests += 1;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{
          preferred: true,
          discoveryRestUrl: 'https://run.googleapis.com/$discovery/rest?version=v1',
          documentationLink: 'https://cloud.google.com/run/docs',
        }],
      }),
    });
  });
  await openBuilder(page);
  await page.getByRole('switch', {name: /Optional/}).click();
  const apis = page.getByRole('textbox', {name: /Additional APIs/});
  await apis.focus();
  await expect.poll(() => discoveryRequests).toBe(1);
  await apis.fill('run.');
  await page.getByRole('option', {name: 'run.googleapis.com'}).click();
  await expect(apis).toHaveValue('run.googleapis.com');
  await expect(promptOutput(page)).toContainText('Additional GCP APIs: run.googleapis.com');
});

test('manual GCP API entry remains available when discovery fails', async ({page}) => {
  await page.route('https://discovery.googleapis.com/discovery/v1/apis', route => route.abort());
  await openBuilder(page);
  await page.getByRole('switch', {name: /Optional/}).click();
  const apis = page.getByRole('textbox', {name: /Additional APIs/});
  await apis.focus();
  await expect(page.getByText('Could not load API list — type manually.')).toBeVisible();
  await apis.fill('run.googleapis.com');
  await expect(promptOutput(page)).toContainText('Additional GCP APIs: run.googleapis.com');
});

test('clipboard success is announced and cleared after prompt edits', async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText: async text => { window.copiedPrompt = text; }},
    });
  });
  await openBuilder(page);
  await fillRequiredFields(page);
  await page.getByRole('button', {name: 'Copy prompt'}).click();

  await expect(page.getByRole('status')).toContainText('Prompt copied to clipboard.');
  expect(await page.evaluate(() => window.copiedPrompt)).toContain('Description: Trust and reliability');

  await page.getByRole('textbox', {name: 'Description'}).fill('An updated description.');
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('clipboard rejection displays an explicit error', async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText: async () => { throw new Error('permission denied'); }},
    });
  });
  await openBuilder(page);
  await fillRequiredFields(page);
  await page.getByRole('button', {name: 'Copy prompt'}).click();

  await expect(page.getByRole('alert')).toContainText('Could not copy to clipboard');
  await expect(page.getByRole('alert')).toContainText(/copy the prompt below manually/i);
});

test('unavailable clipboard access gives manual-copy guidance without claiming success', async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {configurable: true, value: undefined});
  });
  await openBuilder(page);
  await fillRequiredFields(page);
  await page.getByRole('button', {name: 'Copy prompt'}).click();

  await expect(page.getByRole('alert')).toContainText('Clipboard access is unavailable');
  await expect(page.getByRole('alert')).toContainText(/copy the prompt below manually/i);
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('prompt builder remains within a narrow mobile viewport', async ({page}) => {
  await page.setViewportSize({width: 375, height: 812});
  await openBuilder(page);
  await page.getByRole('switch', {name: /Optional/}).click();

  expect(await page.locator('[class*="builder"]').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
