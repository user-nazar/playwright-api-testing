import { test, expect } from '@playwright/test';
import { authenticate } from '../.auth/authHelper';

let articleTitle: string = 'Dynamic-Test-Title';

test('create an article', async ({ request }) => {
    const userToken = await authenticate(request);

    const createArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', {
        headers: { Authorization: `Token ${userToken}` },
        data: {
            article: {
                title: articleTitle,
                description: 'This is a dynamically generated test description.',
                body: 'This is a test body dynamically generated.',
                tagList: ['Test', 'dynamic'],
            },
        },
    });

    const createResponseBody = await createArticleResponse.json();

    // Validate the article creation response
    expect(createArticleResponse.status()).toBe(201);
    console.log('Article Created with Slug:', createResponseBody.article?.slug);
});

test('delete an article', async ({ request }) => {
    const userToken = await authenticate(request);

    const articleSlug = `${articleTitle}-18306`;  // Construct the slug by appending the known suffix

    const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`, {
        headers: { Authorization: `Token ${userToken}` },
    });

    // Validate the delete response
    expect(deleteResponse.status()).toBe(204);
    console.log('Article Deleted with Slug:', articleSlug);
});

