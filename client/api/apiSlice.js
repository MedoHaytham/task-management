// api/apiSlice.js
//
// Browser calls hit relative /api/v1/... paths.
// next.config.mjs rewrites /api/:path* → API_BASE_URL/api/:path*
// so the browser stays same-origin and the httpOnly cookie just works
// (no CORS credentials dance needed).

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  credentials: 'include',
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  // if a refresh is already running, wait for it to finish first
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === 'string' ? args : args.url;

  const isAuthRoute =
    url === '/users/login' ||
    url === '/users/signup' ||
    url === '/users/refreshToken';

  if (result.error?.status === 401 && !isAuthRoute) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshResult = await rawBaseQuery(
          { url: '/users/refreshToken', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // the backend already rotated the accessToken httpOnly cookie
          result = await rawBaseQuery(args, api, extraOptions);
        }
      } finally {
        release();
      }
    } else {
      // another request reached here first — wait for its refresh, then retry
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Project', 'Task', 'UsersList'],
  endpoints: () => ({}),
});

export default apiSlice;
