// features/projectSlice.js
//
// RTK Query endpoints for projects:
//   GET    /api/v1/projects
//   GET    /api/v1/projects/:id
//   POST   /api/v1/projects
//   PATCH  /api/v1/projects/:id
//   DELETE /api/v1/projects/:id
//   POST   /api/v1/projects/:id/members
//   DELETE /api/v1/projects/:id/members

import apiSlice from '../api/apiSlice';

const projectApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: result =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ _id }) => ({
                type: 'Project',
                id: _id,
              })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),

    getProject: builder.query({
      query: id => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),

    createProject: builder.mutation({
      query: body => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    updateProject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }],
    }),

    deleteProject: builder.mutation({
      query: id => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    addProjectMember: builder.mutation({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/members`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
      ],
    }),

    removeProjectMember: builder.mutation({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/members`,
        method: 'DELETE',
        body: { userId },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
} = projectApiSlice;
