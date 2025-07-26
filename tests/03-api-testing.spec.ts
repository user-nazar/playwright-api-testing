import { test, expect } from '@playwright/test';
import { authenticate, loginUI } from '../.auth/authHelper';

let articleSlug: string;
let userToken: string;

test.describe.serial('Article Management', () => {
  test.beforeAll(async ({ request }) => {
    userToken = await authenticate(request); // Authenticate and get the token
  });

  test('create an article', async ({ request }) => {
    const createArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
      headers: { Authorization: `Token ${userToken}` }, // Include the token
      data: {
        article: {
          title: 'Dynamic Test Title',
          description: 'This is a dynamically generated test description.',
          body: 'This is a test body dynamically generated.',
          tagList: ['Test', 'dynamic'],
        },
      },
    });

    // Check if the response is successful
    if (createArticleResponse.status() !== 201) {
      console.error('Failed to create the article. Response:', await createArticleResponse.text());
      throw new Error('Article creation failed.');
    }

    // Parse the response and extract the slug
    const createResponseBody = await createArticleResponse.json();
    console.log('Create Article Response Body:', createResponseBody);

    // Ensure the article and slug exist
    if (!createResponseBody.article?.slug) {
      throw new Error('Article slug not found in the response.');
    }

    articleSlug = createResponseBody.article.slug; // Store the generated article slug
    expect(createArticleResponse.status()).toBe(201); // Validate the article was successfully created
  });



  /** Explanation: This test depends on the `create an article` test to provide the `articleSlug`.
    The `articleSlug` is dynamically generated during the creation process and must be shared
    between tests within the same test group. Running this test independently will fail because
    `articleSlug` will not have been assigned.
   */
  test('delete the created article', async ({ request }) => {

    const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`, {
      headers: { Authorization: `Token ${userToken}` } // Include the token
    });
    expect(deleteResponse.status()).toBe(204); // Validate the article was successfully deleted
  });

});


/**
 * THIS IS NOT API TESTING, FULL UI TESTING
 */
test('delete independently', async ({ page }) => {
  // Login to the application
  await loginUI(page);

  // Create a new article
  const articleTitle = 'Playwright Automation Title';
  await page.getByText('New Article').click();
  await page.getByPlaceholder('Article Title').fill(articleTitle);
  await page.getByPlaceholder("What's this article about?").fill('About the Playwright and Automation');
  await page.getByPlaceholder("Write your article (in markdown)").fill('This blog is about Playwright and Test Automation');
  await page.getByPlaceholder('Enter tags').fill('pw-test, testing, automation');
  await page.getByRole('button', { name: 'Publish Article' }).click();

  await page.waitForLoadState('networkidle'); // Wait for navigation to complete

  // Navigate to the home page and delete the article
  await page.locator('.navbar-brand').click(); // Navigate to the home page
  await page.getByText('Global Feed').click();
  await page.getByText(articleTitle).click();
  await page.getByRole('button', { name: 'Delete Article' }).first().click();

  // Validate that the article has been deleted
  await expect(page.locator('app-article-list h1').first()).not.toContainText(articleTitle);
});

