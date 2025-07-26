import { test, expect } from '@playwright/test';
import { authenticate } from '../.auth/authHelper';

test('create and delete an article', async ({ request }) => {
    // Authenticate and get the user token
    const userToken = await authenticate(request);

    // Create an article
    const createArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
        headers: { Authorization: `Token ${userToken}` },
        data: {
            article: {
                title: 'Dynamic Test Title',
                description: 'This is a dynamically generated test description.',
                body: 'This is a test body dynamically generated.',
                tagList: ['Test', 'dynamic'],
            },
        },
    });

    const createResponseBody = await createArticleResponse.json();
    const articleSlug = createResponseBody.article?.slug; // Retrieve the slug directly

    // Validate the article creation response
    expect(createArticleResponse.status()).toBe(201);
    console.log('Article Created with Slug:', articleSlug);

    // Use the slug to delete the article
    const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`, {
        headers: { Authorization: `Token ${userToken}` },
    });

    // Validate the delete response
    expect(deleteResponse.status()).toBe(204);
    console.log('Article Deleted with Slug:', articleSlug);
});
