// features/authSlice.js
//
// RTK Query endpoints for auth routes:
//   POST /api/v1/users/signup
//   POST /api/v1/users/login
//   POST /api/v1/users/logout
//
// The backend sets/clears httpOnly accessToken/refreshToken cookies on
// these routes — that's why credentials: "include" is set in apiSlice.js.
// There is no separate "auth" Redux slice: the current user lives entirely
// in the RTK Query cache for the "getMe" query (see features/userSlice.js).

import apiSlice from '../api/apiSlice';

// Seed the getMe cache immediately after signup/login so the Header/UI
// updates without waiting for a background re-fetch.
function seedMeCache(dispatch, user) {
  if (!user) return;
  dispatch(
    apiSlice.util.upsertQueryData('getMe', undefined, {
      status: 'success',
      data: { data: user },
    })
  );
}

const authApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    signup: builder.mutation({
      query: credentials => ({
        url: '/users/signup',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          seedMeCache(dispatch, data?.data?.user);
        } catch {
          // handled by the caller via .unwrap()
        }
      },
      invalidatesTags: ['User', 'Project', 'Task', 'UsersList'],
    }),

    login: builder.mutation({
      query: credentials => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          seedMeCache(dispatch, data?.data?.user);
        } catch {
          // handled by the caller via .unwrap()
        }
      },
      invalidatesTags: ['User', 'Project', 'Task', 'UsersList'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/users/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            apiSlice.util.upsertQueryData('getMe', undefined, {
              status: 'success',
              data: { data: null },
            })
          );
        } catch {
          // ignore — logout failing shouldn't block the UI
        }
      },
      invalidatesTags: ['User', 'Project', 'Task'],
    }),
  }),
});

export const { useSignupMutation, useLoginMutation, useLogoutMutation } =
  authApiSlice;
