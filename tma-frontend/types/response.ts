import { z } from "zod";

// TODO: separate schemas for request and response
// TODO: separate schemas basic types

const ProjectOverviewSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    created_at: z.string().datetime({offset: true}).optional(),
    updated_at: z.string().datetime({offset: true}).optional(),
    num_members: z.number().optional(),
    num_tasks: z.number().optional(),
    members: z.array(z.number()).nullable().optional(), // TODO: remove optional
})
    
export const UserProjectsResponseSchema = z.object({
    user_id: z.number(),
    projects: z.array(ProjectOverviewSchema),
});

const TaskSchema = z.object({
    id: z.number(),
    created_by: z.number(),
    name: z.string(),
    content: z.string(),
    start_time: z.string().datetime({offset: true}),
    end_time: z.string().datetime({offset: true}),
    created_at: z.string().datetime({offset: true}),
    updated_at: z.string().datetime({offset: true}),
    status_id: z.number(),
    priority: z.number(),
    tag_ids: z.array(z.number()),
    assigned_to: z.array(z.number()),
})

const TagSchema = z.object({
    id: z.number(),
    name: z.string(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex color code (e.g. #FF0000 or #F00)"),
})

const StatusSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    color: z.string(),
})

const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    profilePicture: z.string().url().optional(),
})

const StatusMapSchema = z.record(z.string().transform(Number), StatusSchema)
const UserMapSchema = z.record(z.string().transform(Number), UserSchema)
const TagMapSchema = z.record(z.string().transform(Number), TagSchema)

const StatusMapOmitIdSchema = z.record(z.string().transform(Number), StatusSchema.omit({id: true}))
const TagMapOmitIdSchema = z.record(z.string().transform(Number), TagSchema.omit({id: true}))

export const ProjectDetailsResponseSchema = z.object({
    project: ProjectOverviewSchema,
    tasks: z.array(TaskSchema),
    tag_map: TagMapOmitIdSchema,
    status_map: StatusMapOmitIdSchema,
});

export const ProjectDetailsSchema = z.object({
    project: ProjectOverviewSchema,
    tasks: z.array(TaskSchema),
    tag_map: TagMapSchema,
    status_map: StatusMapSchema,
});

// Basic types
export type Task = z.infer<typeof TaskSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type User = z.infer<typeof UserSchema>;
export type ProjectOverview = z.infer<typeof ProjectOverviewSchema>;

// Maps
export type UserMap = z.infer<typeof UserMapSchema>;
export type TagMap = z.infer<typeof TagMapSchema>;
export type StatusMap = z.infer<typeof StatusMapSchema>;

export type UserProjectsResponse = z.infer<typeof UserProjectsResponseSchema>;
export type ProjectDetailsResponse = z.infer<typeof ProjectDetailsResponseSchema>;
export type ProjectDetails = z.infer<typeof ProjectDetailsSchema>;

export const LoginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const LoginResponseSchema = z.object({
    token: z.string(),
    user: UserSchema,
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const UsersResponseSchema = z.object({
    users: z.array(UserSchema),
});

export type UsersResponse = z.infer<typeof UsersResponseSchema>;

export const CreateProjectRequestSchema = z.object({
    name: z.string(),
    description: z.string(),
    members: z.array(z.number()),
});

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;

export const CreateProjectResponseSchema = z.object({
    id: z.number(),
});

export type CreateProjectResponse = z.infer<typeof CreateProjectResponseSchema>;

export const UpdateProjectRequestSchema = ProjectOverviewSchema.omit({
    num_members: true,
    num_tasks: true,
}).partial({
    name: true,
    description: true,
}).extend({
    members: z.array(z.number()).optional(),
});

export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;

export const UpdateProjectResponseSchema = z.object({
    id: z.number(),
});

export type UpdateProjectResponse = z.infer<typeof UpdateProjectResponseSchema>;

export const DeleteProjectResponseSchema = z.object({
    id: z.number(),
});

export type DeleteProjectResponse = z.infer<typeof DeleteProjectResponseSchema>;

export const CreateTaskRequestSchema = TaskSchema.omit({
    id: true,
    created_by: true,
    created_at: true,
    updated_at: true,
}).extend({
    project_id: z.number(),
})

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

export const CreateTaskResponseSchema = z.object({
    id: z.number(),
});

export type CreateTaskResponse = z.infer<typeof CreateTaskResponseSchema>;

export const UpdateTaskRequestSchema = TaskSchema.omit({
    created_by: true,
    created_at: true,
    updated_at: true,
}).partial({
    name: true,
    content: true,
    start_time: true,
    end_time: true,
    status_id: true,
    priority: true,
    tag_ids: true,
    assigned_to: true,
})

export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;

export const UpdateTaskResponseSchema = z.object({
    id: z.number(),
});

export type UpdateTaskResponse = z.infer<typeof UpdateTaskResponseSchema>;

export const DeleteTaskResponseSchema = z.object({
    id: z.number(),
});

export type DeleteTaskResponse = z.infer<typeof DeleteTaskResponseSchema>;

export const CreateUserRequestSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(1),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export const CreateUserResponseSchema = z.object({
    id: z.number(),
});

export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;


// Status

export const CreateStatusRequestSchema = StatusSchema.omit({
    id: true,
}).extend({
    project_id: z.number(),
});

export const CreateStatusResponseSchema = z.object({
    id: z.number(),
});

export type CreateStatusResponse = z.infer<typeof CreateStatusResponseSchema>;

export type CreateStatusRequest = z.infer<typeof CreateStatusRequestSchema>;

export const UpdateStatusRequestSchema = StatusSchema.partial({
    name: true,
    description: true,
    color: true,
}).extend({
    project_id: z.number(),
});

export type UpdateStatusRequest = z.infer<typeof UpdateStatusRequestSchema>;

export const UpdateStatusResponseSchema = z.object({
    id: z.number(),
});

export type UpdateStatusResponse = z.infer<typeof UpdateStatusResponseSchema>;

export const DeleteStatusResponseSchema = z.object({
    id: z.number(),
});

export type DeleteStatusResponse = z.infer<typeof DeleteStatusResponseSchema>;

// Tag

export const CreateTagRequestSchema = TagSchema.omit({
    id: true,
}).extend({
    project_id: z.number()
});

export type CreateTagRequest = z.infer<typeof CreateTagRequestSchema>;

export const CreateTagResponseSchema = z.object({
    id: z.number(),
});

export type CreateTagResponse = z.infer<typeof CreateTagResponseSchema>;

export const UpdateTagRequestSchema = TagSchema.partial({
    name: true,
    color: true,
});

export type UpdateTagRequest = z.infer<typeof UpdateTagRequestSchema>;

export const UpdateTagResponseSchema = z.object({
    id: z.number(),
});

export type UpdateTagResponse = z.infer<typeof UpdateTagResponseSchema>;

export const DeleteTagResponseSchema = z.object({
    id: z.number(),
});

export type DeleteTagResponse = z.infer<typeof DeleteTagResponseSchema>;
