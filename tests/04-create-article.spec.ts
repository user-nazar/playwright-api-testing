import { test, expect } from '@playwright/test';
import { authenticate, loginUI } from '../.auth/authHelper';

/**
 * This is not a good combination scenario -- Using UI to login and create an article and then using API to delete newly created article. 
 */
test('create an article', async ({ page, request }) => {
    await loginUI(page);
    const articleTitle = 'Playwright Automation Title';

    // Create a new article
    await page.getByText('New Article').click();
    await page.getByPlaceholder('Article Title').fill(articleTitle);
    await page.getByPlaceholder("What's this article about?").fill('About the Playwright and Automation');
    await page.getByPlaceholder("Write your article (in markdown)").fill('This blog is about Playwright and Test Automation');
    await page.getByPlaceholder('Enter tags').fill('pw-test, testing, automation');
    await page.getByRole('button', { name: 'Publish Article' }).click();

    // Wait for the API response and validate it
    const createArticleResponse = await page.waitForResponse((response) =>
        response.url().includes('/api/articles/') && response.status() === 201
    );

    const createResponseBody = await createArticleResponse.json();

    // Debugging and validation
    console.log('Final Response Body:', createResponseBody);
    const articleSlug = createResponseBody.article?.slug;

    if (!articleSlug) {
        console.error('Response Body:', createResponseBody);
        throw new Error('Article slug not found in the response');
    }

    // Validate the article was successfully created
    await expect(page.locator('.banner h1')).toHaveText(articleTitle);



    // Delete the newly created article
    const userToken = await authenticate(request);
    const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`, {
        headers: { Authorization: `Token ${userToken}` }
    });
    expect(deleteResponse.status()).toBe(204);
});
