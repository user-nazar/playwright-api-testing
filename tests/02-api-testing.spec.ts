import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json';
import { authenticate } from '../.auth/authHelper';

test.beforeEach(async ({ page, request }) => {
   await authenticate(request);
  await page.route('*/**/api/tags', async route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(tags),
    });
  });

  await page.goto('https://conduit.bondaracademy.com/');
  await page.waitForTimeout(500);  // Need to wait for mock api response in the browser

});


test('Intercepting API requests', async ({ page }) => {
  // Intercepting API requests to any endpoint matching '*/**/api/articles*'
  await page.route('*/**/api/articles*', async interceptedRoute => {
    const originalResponse = await interceptedRoute.fetch(); // Fetching the original response from the server
    const originalResponseBody = await originalResponse.json(); // Parsing the JSON response body

    // Modifying the second article's title and description in the response body
    originalResponseBody.articles[1].title = 'Welcome to MOCK Playwright';
    originalResponseBody.articles[1].description = 'Playwright Automation MOCK';

    // Fulfilling the intercepted request with the modified response
    await interceptedRoute.fulfill({
      status: 200, // Returning a successful status code
      body: JSON.stringify(originalResponseBody) // Sending the modified response body
    });
  });
 
  await page.getByText('Global Feed').click();   // Clicking on the "Global Feed" link on the page
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');   // Validating that the navbar brand text matches 'conduit'
  await expect(page.locator('app-article-list h1').nth(1)).toContainText('Welcome to MOCK Playwright');  // Checking that the second article's title matches the mocked title
  await expect(page.locator('app-article-list p').nth(1)).toContainText('Playwright Automation MOCK');  // Checking that the second article's description matches the mocked description
});
