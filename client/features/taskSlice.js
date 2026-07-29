// features/taskSlice.js
//
// RTK Query endpoints for tasks (nested under a project):
//   GET    /api/v1/projects/:projectId/tasks?status=&priority=&assignee=
//   GET    /api/v1/projects/:projectId/tasks/:id
//   POST   /api/v1/projects/:projectId/tasks
//   PATCH  /api/v1/projects/:projectId/tasks/:id
//   DELETE /api/v1/projects/:projectId/tasks/:id

import apiSlice from '../api/apiSlice';

const taskApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getTasks: builder.query({
      // params: { projectId, status, priority, assignee }
      query: ({ projectId, ...filters }) => ({
        url: `/projects/${projectId}/tasks`,
        params: filters,
      }),
      providesTags: (result, error, { projectId }) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ _id }) => ({
                type: 'Task',
                id: _id,
              })),
              { type: 'Task', id: `LIST-${projectId}` },
            ]
          : [{ type: 'Task', id: `LIST-${projectId}` }],
    }),

    createTask: builder.mutation({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/tasks`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Task', id: `LIST-${projectId}` },
      ],
    }),

    updateTask: builder.mutation({
      query: ({ projectId, id, ...body }) => ({
        url: `/projects/${projectId}/tasks/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Task', id: `LIST-${projectId}` },
      ],
    }),

    deleteTask: builder.mutation({
      query: ({ projectId, id }) => ({
        url: `/projects/${projectId}/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Task', id: `LIST-${projectId}` },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApiSlice;
