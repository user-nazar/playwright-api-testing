import { APIRequestContext, Page } from '@playwright/test';

/**
 * This function is to authentication the user when using API requests (API Authentication)
 * @param request 
 * @param page 
 * @returns 
 */
export async function authenticate(request: APIRequestContext): Promise<string> {
    const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: { user: { email: 'pw-test-said@test.com', password: 'Welcome123' } },
    });

    const loginResponseBody = await loginResponse.json();
    const userToken = loginResponseBody.user?.token;

    if (!userToken) {
        throw new Error('Authentication failed: No token received.');
    }

    console.log('Authentication successful.');

    return userToken;
}

/**
 * This function is to authenticate the user when using UI-based actions, not API. (UI-based login Authentication)
 * @param page 
 */
export async function loginUI(page: Page): Promise<void> {
    // Navigate to the application
    await page.goto('https://conduit.bondaracademy.com/');

    // Perform UI-based login
    await page.getByText('Sign in').click();
    await page.getByRole('textbox', { name: 'Email' }).fill('pw-test-said@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Welcome123');
    await page.getByRole('button').click();

    // Confirm login by checking for an element visible only after login
    await page.waitForSelector('text=New Article', { timeout: 5000 });
    console.log('UI login successful.');
}







