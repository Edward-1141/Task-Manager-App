package com.openfaas.function;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.Spliterators;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import java.util.List;

import com.openfaas.model.IResponse;
import com.openfaas.model.IRequest;
import com.openfaas.model.Response;
import com.fasterxml.jackson.databind.JsonNode;
import com.shared.function.JwtUtil;
import com.shared.function.config.ProjectFetchConfig;
import com.shared.function.entity.*;
import com.shared.function.repository.*;
import com.shared.function.routing.BaseHandler;
import com.shared.function.routing.RouteHandler;

// import com.shared.function.*; // shared lib

public class Handler extends BaseHandler {
    private final TaskRepository taskRepository = new TaskRepository();
    private final ProjectRepository projectRepository = new ProjectRepository();

    @Override
    public Map<String, RouteHandler> initializeRouteHandlers() {
        Map<String, RouteHandler> handlers = new HashMap<>();
        handlers.put("/", new RouteHandler()
                .addMethod("POST", req -> handleCreateTask(req, new Response(), req.getHeader("Authorization").substring(7)))
                .addMethod("PUT", req -> handleUpdateTask(req, new Response(), req.getHeader("Authorization").substring(7)))
                .addMethod("DELETE", req -> handleDeleteTask(req, new Response(), req.getHeader("Authorization").substring(7))));
        return handlers;
    }

    @Override
    public String determineRoute(Map<String, String> path) {
        return "/";
    }

    private IResponse handleCreateTask(IRequest req, Response res, String token) {
        try {
            Integer projectId = validateQueryParam(req, res, "pId", Integer.class);
            if (projectId == null) {
                return res;
            }

            // get user id from token
            User user;
            try{
                Integer userId = Integer.parseInt(JwtUtil.getUserIdFromToken(token));
                user = projectRepository.findMemberById(userId, projectId);
                if (user == null) {
                    res.setStatusCode(401);
                    res.setBody(toJson(Map.of(
                            "error", "Unauthorized",
                            "message", "User is not a member of the project")));
                    return res;
                }
            } catch (NumberFormatException e) {
                res.setStatusCode(401);
                res.setBody(toJson(Map.of(
                        "error", "Unauthorized",
                        "message", "Invalid token")));
                return res;
            }

            ProjectFetchConfig projectFetchConfig = new ProjectFetchConfig();
            projectFetchConfig.setFetchMembers(true);
            projectFetchConfig.setFetchTags(true);
            projectFetchConfig.setFetchTaskStatuses(true);
            projectFetchConfig.setFetchTasks(false);
            projectFetchConfig.setFetchCreatedBy(false);

            Project project = projectRepository.findById(projectId, projectFetchConfig);
            if (project == null) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                        "error", "Bad Request",
                        "message", "Invalid project ID")));
                return res;
            }

            JsonNode rootNode = objectMapper.readTree(req.getBody());

            String taskName = rootNode.path("name").asText();
            String content = rootNode.path("content").asText();
            Integer priority = rootNode.path("priority").asInt();
            Integer statusId = rootNode.path("status_id").asInt();
            Instant startTime = null;
            Instant endTime = null;
            try {
                startTime = Instant.parse(rootNode.path("start_time").asText());
                endTime = Instant.parse(rootNode.path("end_time").asText());
            } catch (DateTimeParseException e) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                        "error", "Bad Request",
                        "message", "Invalid time format for start_time or end_time")));
                return res;
            }

            if (taskName == null || taskName.isEmpty() ||
                    content == null || content.isEmpty() ||
                    startTime == null || endTime == null ||
                    priority == null || priority <= 0 ||
                    statusId == null) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                        "error", "Bad Request",
                        "message", "Missing required fields")));
                return res;
            }

            JsonNode tagsNode = rootNode.path("tag_ids");
            JsonNode assignedToNode = rootNode.path("assigned_to");

            // validate status
            TaskStatus status;
            Set<TaskStatus> statuses = project.getTaskStatuses();
            status = statuses.stream().filter(s -> s.getId() == statusId).findFirst().orElse(null);
            if (status == null) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                        "error", "Bad Request",
                        "message", "Invalid status ID")));
                return res;
            }

            // filter tags if not a tag of the project
            Set<ProjectTag> tags = new HashSet<>();
            if (tagsNode.isArray()) {
                List<Integer> tagIds = StreamSupport
                        .stream(Spliterators.spliteratorUnknownSize(tagsNode.iterator(), 0), false)
                        .map(JsonNode::asInt)
                        .filter(id -> id > 0)
                        .toList();
                tags = projectRepository.findAllTagsById(tagIds, projectId)
                        .stream()
                        .collect(Collectors.toSet());
            }

            // filter assigned users if not a member of the project
            Set<User> assignedUsers = new HashSet<>();
            if (assignedToNode.isArray()) {
                List<Integer> assignedUserIds = StreamSupport
                        .stream(Spliterators.spliteratorUnknownSize(assignedToNode.iterator(), 0), false)
                        .map(JsonNode::asInt)
                        .filter(id -> id > 0)
                        .toList();
                assignedUsers = projectRepository.findAllUsersById(assignedUserIds, projectId).stream()
                        .collect(Collectors.toSet());
            }

            Task newTask = new Task();
            newTask.setProject(project);
            newTask.setTaskName(taskName);
            newTask.setContent(content);
            newTask.setStartTime(startTime);
            newTask.setEndTime(endTime);
            newTask.setPriority(priority);
            newTask.setStatus(status);
            newTask.setTags(tags);
            newTask.setAssignedTo(assignedUsers);
            newTask.setCreatedBy(user);

            Task createdTask = taskRepository.createTask(newTask);

            res.setStatusCode(201);
            res.setBody(toJson(Map.of(
                    "success", true,
                    "message", "Task created successfully",
                    "id", createdTask.getId())));
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Failed to create task: " + e.getMessage())));
        }
        return res;
    }

    private IResponse handleUpdateTask(IRequest req, Response res, String token) {
        try {
            Integer taskId = validateQueryParam(req, res, "tId", Integer.class);
            if (taskId == null) {
                return res;
            }

            Task existingTask = taskRepository.findById(taskId);
            if (existingTask == null) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of(
                        "error", "Bad Request",
                        "message", "Invalid task ID")));
                return res;
            }
            Integer projectId = existingTask.getProject().getId();

            // get user id from token
            User user;
            try{
                Integer userId = Integer.parseInt(JwtUtil.getUserIdFromToken(token));
                user = projectRepository.findMemberById(userId, projectId);
                if (user == null) {
                    res.setStatusCode(401);
                    res.setBody(toJson(Map.of(
                            "error", "Unauthorized",
                            "message", "User is not a member of the project")));
                    return res;
                }
            } catch (NumberFormatException e) {
                res.setStatusCode(401);
                res.setBody(toJson(Map.of(
                        "error", "Unauthorized",
                        "message", "Invalid token")));
                return res;
            }

            // general metadata of a task
            JsonNode rootNode = objectMapper.readTree(req.getBody());
            if (rootNode.has("name") && !rootNode.path("name").asText().isEmpty()) {
                existingTask.setTaskName(rootNode.path("name").asText());
            }
            if (rootNode.has("content") && !rootNode.path("content").asText().isEmpty()) {
                existingTask.setContent(rootNode.path("content").asText());
            }
            if (rootNode.has("start_time") && !rootNode.path("start_time").asText().isEmpty()) {
                try {
                    existingTask.setStartTime(Instant.parse(rootNode.path("start_time").asText()));
                } catch (DateTimeParseException e) {
                    res.setStatusCode(400);
                    res.setBody(toJson(Map.of(
                            "error", "Bad Request",
                            "message", "Invalid start time format")));
                    return res;
                }
            }
            if (rootNode.has("end_time") && !rootNode.path("end_time").asText().isEmpty()) {
                try {
                    existingTask.setEndTime(Instant.parse(rootNode.path("end_time").asText()));
                } catch (DateTimeParseException e) {
                    res.setStatusCode(400);
                    res.setBody(toJson(Map.of(
                            "error", "Bad Request",
                            "message", "Invalid end time format")));
                    return res;
                }
            }
            if (rootNode.has("priority") && rootNode.path("priority").asInt() > 0) {
                existingTask.setPriority(rootNode.path("priority").asInt());
            }

            // JsonNode tagsNode = rootNode.path("tag_ids");
            // JsonNode assignedToNode = rootNode.path("assigned_to");
            
            // validate status
            Integer statusId = rootNode.path("status_id").asInt();
            if (statusId > 0) {
                TaskStatus status = projectRepository.findStatusById(statusId, projectId);
                if (status == null) {
                    res.setStatusCode(400);
                    res.setBody(toJson(Map.of(
                            "error", "Bad Request",
                            "message", "Invalid status ID")));
                    return res;
                }
                existingTask.setStatus(status);
            }

            // filter tags if not a tag of the project
            if (rootNode.has("tag_ids") && rootNode.path("tag_ids").isArray()){
                Set<ProjectTag> tags = new HashSet<>();
                List<Integer> tagIds = StreamSupport
                    .stream(Spliterators.spliteratorUnknownSize(rootNode.path("tag_ids").iterator(), 0), false)
                    .map(JsonNode::asInt)
                    .filter(id -> id > 0)
                    .toList();
                tags = projectRepository.findAllTagsById(tagIds, projectId)
                    .stream()
                    .collect(Collectors.toSet());
                existingTask.setTags(tags);
            }

            // filter assigned users if not a member of the project
            if (rootNode.has("assigned_to") && rootNode.path("assigned_to").isArray()){
                Set<User> assignedUsers = new HashSet<>();
                List<Integer> assignedUserIds = StreamSupport
                        .stream(Spliterators.spliteratorUnknownSize(rootNode.path("assigned_to").iterator(), 0), false)
                        .map(JsonNode::asInt)
                        .filter(id -> id > 0)
                        .toList();
                assignedUsers = projectRepository.findAllUsersById(assignedUserIds, projectId).stream()
                        .collect(Collectors.toSet());
                existingTask.setAssignedTo(assignedUsers);
            }

            Task updatedTask = taskRepository.updateTask(existingTask);

            res.setStatusCode(200);
            res.setBody(toJson(Map.of(
                    "success", true,
                    "message", "Task updated successfully",
                    "id", updatedTask.getId())));

        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Failed to update task: " + e.getMessage())));
        }
        return res;
    }

    private IResponse handleDeleteTask(IRequest req, Response res, String token) {
        try {
            Integer taskId = validateQueryParam(req, res, "tId", Integer.class);
            if (taskId == null) {
                return res;
            }

            // Check if task exists
            Task existingTask = taskRepository.findById(taskId);
            if (existingTask == null) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of(
                        "error", "Bad Request",
                        "message", "Invalid task ID")));
                return res;
            }

            Integer projectId = existingTask.getProject().getId();
            // get user id from token
            User user;
            try{
                Integer userId = Integer.parseInt(JwtUtil.getUserIdFromToken(token));
                user = projectRepository.findMemberById(userId, projectId);
                if (user == null) {
                    res.setStatusCode(401);
                    res.setBody(toJson(Map.of(
                            "error", "Unauthorized",
                            "message", "User is not a member of the project")));
                    return res;
                }
            } catch (NumberFormatException e) {
                res.setStatusCode(401);
                res.setBody(toJson(Map.of(
                        "error", "Unauthorized",
                        "message", "Invalid token")));
                return res;
            }

            // Delete the task
            taskRepository.deleteTask(taskId);

            res.setStatusCode(200);
            res.setBody(toJson(Map.of(
                    "success", true,
                    "message", "Task deleted successfully",
                    "id", taskId)));

        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Failed to delete task: " + e.getMessage())));
        }
        return res;
    }
}
