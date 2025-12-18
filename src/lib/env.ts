const isDev = process.env.NODE_ENV === 'development';

export const env = {
  API_BASE_URL: isDev
    ? 'http://localhost:8000'
    : 'https://api.mbtimate.com',
  FRONTEND_URL: isDev
    ? 'http://localhost:3000'
    : 'https://mbtimate.com',
} as const;