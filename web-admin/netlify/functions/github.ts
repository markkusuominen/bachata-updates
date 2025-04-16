/**
 * Netlify Function: GitHub File Manager (Partial)
 * Handles listing and reading JSON files in a GitHub repo directory.
 *
 * Actions:
 * - GET /?action=list           List all JSON files in the directory
 * - GET /?action=get&file=F     Get contents of a file
 *
 * Requires Authorization: Bearer <token> header from frontend
 */

const OWNER = 'markkusuominen'; // TODO: Set your GitHub username/org
const REPO = 'bachata-updates';  // TODO: Set your repo name
const DIR = 'whats-new';           // TODO: Set your updates directory
const GITHUB_API = 'https://api.github.com';

function getToken(event: any): string | null {
  const auth = event.headers['authorization'] || event.headers['Authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    return auth.replace('Bearer ', '');
  }
  return null;
}

async function listFiles(token: string) {
  const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${DIR}`, {
    headers: { Authorization: `token ${token}` }
  });
  if (!res.ok) throw new Error('Failed to list files');
  const files = await res.json();
  return files.filter((f: any) => f.type === 'file' && f.name.endsWith('.json'));
}

async function getFile(token: string, file: string) {
  const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${DIR}/${file}`, {
    headers: { Authorization: `token ${token}` }
  });
  if (!res.ok) throw new Error('Failed to get file');
  const data = await res.json();
  return {
    ...data,
    content: Buffer.from(data.content, 'base64').toString('utf8'),
  };
}

/**
 * Save (create/update) a JSON file in the repo
 */
async function saveFile(token: string, file: string, content: string, message: string) {
  // Try to get current file SHA (if exists)
  let sha = undefined;
  const getRes = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${DIR}/${file}`, {
    headers: { Authorization: `token ${token}` }
  });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }
  const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${DIR}/${file}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      sha,
    }),
  });
  if (!res.ok) throw new Error('Failed to save file');
  return await res.json();
}

/**
 * Delete a JSON file in the repo
 */
async function deleteFile(token: string, file: string, message: string) {
  // Get current file SHA
  const getRes = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${DIR}/${file}`, {
    headers: { Authorization: `token ${token}` }
  });
  if (!getRes.ok) throw new Error('File not found');
  const data = await getRes.json();
  const sha = data.sha;
  const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${DIR}/${file}`, {
    method: 'DELETE',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      sha,
    }),
  });
  if (!res.ok) throw new Error('Failed to delete file');
  return await res.json();
}

export async function handler(event: any) {
  try {
    const token = getToken(event);
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Missing or invalid token' }) };
    }
    const action = event.queryStringParameters?.action;
    if (event.httpMethod === 'GET' && action === 'list') {
      const files = await listFiles(token);
      return {
        statusCode: 200,
        body: JSON.stringify({ files }),
        headers: { 'Access-Control-Allow-Origin': '*' },
      };
    } else if (event.httpMethod === 'GET' && action === 'get') {
      const file = event.queryStringParameters?.file;
      if (!file) return { statusCode: 400, body: JSON.stringify({ error: 'Missing file param' }) };
      const data = await getFile(token, file);
      return {
        statusCode: 200,
        body: JSON.stringify({ file: data }),
        headers: { 'Access-Control-Allow-Origin': '*' },
      };
    } else if (event.httpMethod === 'POST') {
      // Save (create/update) file
      const body = JSON.parse(event.body || '{}');
      const { file, content, message } = body;
      if (!file || !content || !message) return { statusCode: 400, body: JSON.stringify({ error: 'Missing params' }) };
      const data = await saveFile(token, file, content, message);
      return {
        statusCode: 200,
        body: JSON.stringify({ result: data }),
        headers: { 'Access-Control-Allow-Origin': '*' },
      };
    } else if (event.httpMethod === 'DELETE') {
      // Delete file
      const body = JSON.parse(event.body || '{}');
      const { file, message } = body;
      if (!file || !message) return { statusCode: 400, body: JSON.stringify({ error: 'Missing params' }) };
      const data = await deleteFile(token, file, message);
      return {
        statusCode: 200,
        body: JSON.stringify({ result: data }),
        headers: { 'Access-Control-Allow-Origin': '*' },
      };
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action or method' }) };
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: { 'Access-Control-Allow-Origin': '*' },
    };
  }
}
