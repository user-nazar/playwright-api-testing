import { test, expect } from '@playwright/test';
import { authenticate } from '../.auth/authHelper';

let articleSlug: string;

test.describe.serial('Create & Delete an Article using Serial', () => {
    test('create an article', async ({ request }) => {
        const userToken = await authenticate(request);

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
        articleSlug = createResponseBody.article?.slug;

        expect(createArticleResponse.status()).toBe(201);
        console.log('Article Created with Slug:', articleSlug);
    });

    test('delete the created article', async ({ request }) => {
        const userToken = await authenticate(request);

        // Use the slug from the previous test
        const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`, {
            headers: { Authorization: `Token ${userToken}` },
        });

        expect(deleteResponse.status()).toBe(204);
        console.log('Article Deleted with Slug:', articleSlug);
    });
});
