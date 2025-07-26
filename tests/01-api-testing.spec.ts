import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json';
import { authenticate } from '../.auth/authHelper';

test.beforeEach(async ({ page, request }) => {

   // Authenticate and set the token in localStorage
   await authenticate(request);

  // Mock the tags API response
  await page.route('*/**/api/tags', async route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(tags),
    });
  });


  // Mock the articles API and modify the second article's data
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[1].title = 'Welcome to Playwright';       // Assigning this title to the second article
    responseBody.articles[1].description = 'Playwright Automation';

    await route.fulfill({
      status: 200,
      body: JSON.stringify(responseBody)
    });
  });

  // Navigate to the application
  await page.goto('https://conduit.bondaracademy.com/');
  await page.waitForTimeout(500);  // Wait for mock API response in the browser

});


test('get started link', async ({ page }) => {
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').nth(1)).toContainText('Welcome to Playwright');
  await expect(page.locator('app-article-list p').nth(1)).toContainText('Playwright Automation');
});

/* After successful test: 
Popular Tags change to:: 
    Automation, Playwright 
Second Article change to: 
    Title: Welcome to Playwright
    Body: Playwright Automation
*/
