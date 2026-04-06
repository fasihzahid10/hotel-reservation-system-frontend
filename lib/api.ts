/** Base URL for API calls (no trailing slash). Read per-request so dev env changes can apply after restart. */
function getApiBase(): string {
  let raw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? '';
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1).trim();
  }
  if (raw.startsWith('http')) {
    return raw.replace(/\/$/, '');
  }
  return (raw || '/api').replace(/\/$/, '') || '/api';
}

type ErrorBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  path?: string;
};

function formatApiErrorMessage(status: number, statusText: string, body: unknown): string {
  const b = body as ErrorBody | null;
  if (b && typeof b === 'object') {
    const { message, error } = b;
    if (Array.isArray(message)) {
      return message.filter(Boolean).join(' ');
    }
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    if (typeof error === 'string' && error.trim()) {
      return error;
    }
  }

  if (status === 401) {
    return 'Please sign in again.';
  }
  if (status === 403) {
    return 'You do not have permission for this action.';
  }
  if (status === 404) {
    return 'The requested resource was not found.';
  }
  if (status === 409) {
    return 'This conflicts with existing data (for example, a duplicate email or room number).';
  }
  if (status >= 500) {
    return 'The server had a problem. Please try again in a moment.';
  }
  if (status >= 400) {
    return statusText || 'The request could not be completed. Check your input and try again.';
  }

  return statusText || 'Something went wrong.';
}

async function parseResponse(response: Response) {
  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    const message = formatApiErrorMessage(response.status, response.statusText, body);
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${getApiBase()}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      credentials: 'include',
      cache: 'no-store',
    });

    return parseResponse(response) as Promise<T>;
  } catch (err) {
    if (err instanceof TypeError && (err.message === 'Failed to fetch' || err.message.includes('NetworkError'))) {
      throw new Error(
        'Cannot reach the API. Set NEXT_PUBLIC_API_URL to your backend /api URL (or use NEXT_PUBLIC_API_URL=/api with the API on port 4000), then restart the dev server.',
      );
    }
    throw err;
  }
}
