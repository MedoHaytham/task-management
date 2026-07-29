// features/userSlice.js
//
// RTK Query endpoints for the logged-in user's own profile.
// getMe is the SINGLE SOURCE OF TRUTH for "who is logged in" across the
// whole app — AuthGate, GuestGuard, and useAuthGuard all read from it.

import apiSlice from '../api/apiSlice';

const userApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),

    updateMe: builder.mutation({
      query: body => ({
        url: '/users/updateMe',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Used by MembersModal to resolve an email to a userId before
    // calling addProjectMember. Lazy because it's triggered on submit,
    // not automatically on mount.
    lookupUserByEmail: builder.query({
      query: email => ({
        url: '/users/lookup',
        params: { email },
      }),
    }),
    // Admin endpoints
    getUsers: builder.query({
      query: params => ({
        url: '/users',
        params,
      }),
      providesTags: ['UsersList'],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['UsersList', 'User'],
    }),

    deleteUser: builder.mutation({
      query: id => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UsersList'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useLazyLookupUserByEmailQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice;
