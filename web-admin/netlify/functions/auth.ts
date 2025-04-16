/**
 * GitHub OAuth Authentication Function
 * 
 * Handles the OAuth code exchange to obtain GitHub access tokens
 * for authenticated API requests to GitHub. The token allows the app
 * to perform operations on behalf of the authenticated user.
 */
import { Handler } from '@netlify/functions';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5173';

/**
 * Netlify serverless function handler for GitHub OAuth
 * @param event - The Netlify function event object
 * @returns Response with access token or error
 */
const handler: Handler = async (event) => {
  // Get the code from GitHub OAuth redirect
  const code = event.queryStringParameters?.code;
  
  if (!code) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Missing code parameter' }),
    };
  }

  try {
    // Exchange code for access token
    const response = await fetch(`https://github.com/login/oauth/access_token`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        code,
        redirect_uri: `${REDIRECT_URI}/api/auth/callback`
      }),
    });
    
    const data = await response.json();

    if (data.error) {
      console.error('GitHub OAuth error:', data.error);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: data.error }),
      };
    }

    // Return the access token with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        access_token: data.access_token,
        token_type: data.token_type,
        scope: data.scope
      }),
    };
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to exchange code for token' }),
    };
  }
};

export { handler };