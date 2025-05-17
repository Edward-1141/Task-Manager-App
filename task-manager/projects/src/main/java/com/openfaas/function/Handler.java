package com.openfaas.function;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Spliterators;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import com.openfaas.model.IResponse;
import com.openfaas.model.IRequest;
import com.openfaas.model.Response;
import com.fasterxml.jackson.databind.JsonNode;
import com.shared.function.repository.*;
import com.shared.function.routing.BaseHandler;
import com.shared.function.routing.RouteHandler;
import com.shared.function.DTL.ProjectDetails;
import com.shared.function.DTL.ProjectDetails.ProjectMetadata;
import com.shared.function.config.ProjectFetchConfig;

import jakarta.persistence.EntityNotFoundException;

import com.shared.function.entity.*;
import com.shared.function.JwtUtil;

public class Handler extends BaseHandler {
    private static class StatusData {
        public String name;
        public String color;
        public int order;
        public String description;

        public StatusData(String name, String color, int order, String description) {
            this.name = name;
            this.color = color;
            this.order = order;
            this.description = description;
        }
    }

    private static final StatusData[] DEFAULT_STATUSES = {
        new StatusData("To Do", "#EB7A34", 1, "To Do"),
        new StatusData("In Progress", "#53B3DB", 2, "In Progress"),
        new StatusData("Done", "#58E701", 3, "Done")
    };

    private final ProjectRepository projectRepository = new ProjectRepository();
    private final UserRepository userRepository = new UserRepository();
    private final TaskStatusRepository taskStatusRepository = new TaskStatusRepository();
    private final ProjectTagRepository projectTagRepository = new ProjectTagRepository();

    @Override
    public Map<String, RouteHandler> initializeRouteHandlers() {
        Map<String, RouteHandler> handlers = new HashMap<>();

        // Root route handlers
        handlers.put("/", new RouteHandler()
                .addMethod("POST",
                        req -> handleCreateProject(req, new Response(),
                                req.getHeaders().get("Authorization").substring(7)))
                .addMethod("PUT",
                        req -> handleUpdateProject(req, new Response(),
                                req.getHeaders().get("Authorization").substring(7)))
                .addMethod("DELETE", req -> handleDeleteProject(req, new Response(),
                        req.getHeaders().get("Authorization").substring(7))));

        // /users route handlers
        handlers.put("/users", new RouteHandler()
                .addMethod("GET", req -> getProjectsByUserId(req, new Response(),
                        req.getHeaders().get("Authorization").substring(7))));

        // /details route handlers
        handlers.put("/details", new RouteHandler()
                .addMethod("GET", req -> getProjectDetails(req, new Response(),
                        req.getHeaders().get("Authorization").substring(7))));

        // /status route handlers
        handlers.put("/status", new RouteHandler()
                .addMethod("POST", req -> handleCreateStatus(req, new Response(),
                        req.getHeaders().get("Authorization").substring(7)))
                .addMethod("PUT", req -> handleUpdateStatus(req, new Response(),
                        req.getHeaders().get("Authorization").substring(7)))
                .addMethod("DELETE", req -> handleDeleteStatus(req, new Response(),
                        req.getHeaders().get("Authorization").substring(7))));

        // /tag route handlers
        handlers.put("/tag", new RouteHandler()
                .addMethod("POST", req -> handleCreateTag(req, new Response(),
                        req.getHeaders().get("Authorization").substring(7)))
                .addMethod("PUT", req -> handleUpdateTag(req, new Response(),
                        req.getHeaders().get("Authorization").substring(7)))
                .addMethod("DELETE", req -> handleDeleteTag(req, new Response(),
                        req.getHeaders().get("Authorization").substring(7))));

        return handlers;
    }

    @Override
    public String determineRoute(Map<String, String> path) {
        if (path == null || path.isEmpty()) {
            return "/";
        }

        if (path.containsKey("users")) {
            return "/users";
        }

        if (path.containsKey("details")) {
            return "/details";
        }

        if (path.containsKey("status")) {
            return "/status";
        }

        if (path.containsKey("tag")) {
            return "/tag";
        }

        return "/";
    }

    private IResponse getProjectDetails(IRequest req, Response res, String token) {
        // e.g. openfaas -> http://<ip_addr>:<port>/function/project/details?pId=1

        // Parse and validate pId
        try {
            Integer pId = validateQueryParam(req, res, "pId", Integer.class);
            if (pId == null) {
                return res;
            }

            Project project = projectRepository.getProjectDetails(pId);
            if (project == null) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of(
                        "error", "Not Found",
                        "message", "Project not found")));
                return res;
            }

            ProjectDetails projectDetails = new ProjectDetails(project);

            res.setStatusCode(200);
            res.setBody(toJson(projectDetails));

        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of(
                    "error", "Internal Server Error",
                    "message", "Unexpected error occurred",
                    "details", e.getMessage())));
        }

        return res;
    }

    private IResponse getProjectsByUserId(IRequest req, Response res, String token) {
        try {
            // e.g. openfaas -> http://<ip_addr>:<port>/function/project/
            // local -> http://<ip_addr>:8082/

            // Parse and validate userId
            Integer userId;
            try {
                userId = Integer.parseInt(JwtUtil.getUserIdFromToken(token));
                if (userId <= 0) {
                    throw new NumberFormatException("userId must be positive");
                }
            } catch (NumberFormatException e) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                        "error", "Bad Request",
                        "message", "Invalid userId format",
                        "details", "userId must be a positive integer")));
                return res;
            }

            System.out.println("userId retrieved: " + userId);

            // Retrieve projects from repository
            List<ProjectMetadata> projectList;
            try {
                projectList = projectRepository.findByMember(userId).stream().map(p -> new ProjectMetadata(p, false)).toList();
            } catch (Exception e) {
                System.err.println("ERROR: Database operation failed: " + e.getMessage());
                res.setStatusCode(503);
                res.setBody(toJson(Map.of(
                        "error", "Service Unavailable",
                        "message", "Failed to retrieve projects",
                        "details", "Database operation failed")));
                return res;
            }

            // Handle empty result
            if (projectList == null || projectList.isEmpty()) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of(
                        "error", "Not Found",
                        "message", "No projects found",
                        "details", "No projects found for the specified userId")));
                return res;
            }

            // Return successful response
            String jsonResponse = toJson(Map.of(
                    "status", "success",
                    "user_id", userId,
                    "projects", projectList));

            res.setBody(jsonResponse);
            return res;

        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error in getProjectsByUserId: " + e.getMessage());
            res.setStatusCode(500);
            res.setBody(toJson(Map.of(
                    "error", "Internal Server Error",
                    "message", "Unexpected error occurred",
                    "details", e.getMessage())));
            return res;
        }
    }

    private IResponse handleCreateProject(IRequest req, Response res, String token) {
        try {
            JsonNode rootNode = objectMapper.readTree(req.getBody());

            // validate the name and description are not empty
            if (rootNode.path("name").isMissingNode() || rootNode.path("description").isMissingNode()
                    || rootNode.path("name").asText().isEmpty() || rootNode.path("description").asText().isEmpty()) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of("error", "Bad Request", "message", "Name and description cannot be empty")));
                return res;
            }

            // Get the userId from the token
            Integer userId = Integer.parseInt(JwtUtil.getUserIdFromToken(token));
            User createdBy = userRepository.findById(userId);
            if (createdBy == null) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of("error", "Bad Request", "message", "User not found")));
                return res;
            }

            // Create the project
            Project newProject = new Project();
            newProject.setName(rootNode.path("name").asText());
            newProject.setDescription(rootNode.path("description").asText());
            newProject.setCreatedBy(createdBy);

            // Get the members from the request
            JsonNode membersNode = rootNode.path("members");
            Set<User> members = new HashSet<>();
            if (membersNode.isArray() && membersNode.size() > 0) {
                List<Integer> memberIds = StreamSupport
                        .stream(Spliterators.spliteratorUnknownSize(membersNode.iterator(), 0), false)
                        .map(JsonNode::asInt)
                        .filter(id -> id > 0 && id != userId)
                        .toList();

                members = userRepository.findAllById(memberIds).stream().collect(Collectors.toSet());
            } 
            members.add(createdBy);
            newProject.setMembers(members);

            
            Project createdProject = projectRepository.createProject(newProject);

            // Set the default status
            Arrays.stream(DEFAULT_STATUSES).forEach(status -> {
                TaskStatus defaultStatus = new TaskStatus(status.name, status.order, status.description, status.color, createdProject);
                taskStatusRepository.createStatus(defaultStatus);
            });

            res.setStatusCode(201);
            res.setBody(toJson(Map.of("success", true,
                    "message", "Project created successfully",
                    "id", createdProject.getId())));

        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Failed to create project: " + e.getMessage())));
            System.err.println("ERROR: Failed to create project: " + e.getMessage() + " " + e.getStackTrace());
        }
        return res;
    }

    private IResponse handleUpdateProject(IRequest req, Response res, String token) {
        System.out.println("Updating project endpoint hit!");

        try {
            Integer pId = validateQueryParam(req, res, "pId", Integer.class);
            if (pId == null) {
                return res;
            }
            Project existingProject = projectRepository.findById(pId);

            if (existingProject == null) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of("error", "Project not found with ID: " + pId)));
                return res;
            }

            JsonNode rootNode = objectMapper.readTree(req.getBody());

            if (rootNode.has("name")) {
                existingProject.setName(rootNode.path("name").asText());
            }

            if (rootNode.has("description")) {
                existingProject.setDescription(rootNode.path("description").asText());
            }

            if (rootNode.has("members")) {
                JsonNode memberNode = rootNode.path("members");
                if (memberNode.isArray()) {
                    List<Integer> memberIds = StreamSupport
                            .stream(Spliterators.spliteratorUnknownSize(memberNode.iterator(), 0), false)
                            .map(JsonNode::asInt)
                            .filter(id -> id > 0)
                            .toList();
                    try {
                        projectRepository.updateProjectMembers(pId, memberIds);
                    } catch (EntityNotFoundException e) {
                        res.setStatusCode(400);
                        res.setBody(toJson(Map.of("error", e.getMessage())));
                        return res;
                    } catch (Exception e) {
                        res.setStatusCode(500);
                        res.setBody(toJson(Map.of("error", "Failed to assign users: " + e.getMessage())));
                        return res;
                    }
                } else {
                    res.setStatusCode(400);
                    res.setBody(toJson(Map.of("error", "members should be an array of user IDs")));
                    return res;
                }
            }
            Project updatedProject = projectRepository.updateProject(existingProject);

            res.setStatusCode(200);
            res.setBody(toJson(Map.of("success", true, "message", "Project updated successfully", "id", updatedProject.getId())));
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of("error", "Failed to update project: " + e.getMessage())));
        }
        return res;
    }

    private IResponse handleDeleteProject(IRequest req, Response res, String token) {
        System.out.println("Delete project endpoint hit!");

        try {
            // Validate query parameters exist
            if (req.getQuery() == null || req.getQuery().isEmpty()) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                        "error", "Bad Request",
                        "message", "Missing query parameters",
                        "details", "pId parameter is required")));
                return res;
            }

            // Validate pId parameter exists
            if (!req.getQuery().containsKey("pId")) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                        "error", "Bad Request",
                        "message", "Missing required parameter",
                        "details", "pId parameter is required")));
                return res;
            }

            // Parse and validate pId
            Integer pId;
            try {
                pId = Integer.parseInt(req.getQuery().get("pId"));
                if (pId <= 0) {
                    throw new NumberFormatException("pId must be positive");
                }
            } catch (NumberFormatException e) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                        "error", "Bad Request",
                        "message", "Invalid pId format",
                        "details", "pId must be a positive integer")));
                return res;
            }

            System.out.println("Attempting to delete p with ID: " + pId);

            // Check if project exists
            Project existingProject = projectRepository.findById(pId);
            if (existingProject == null) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of("error", "Project not found with ID: " + pId)));
                return res;
            }

            // Delete the project
            projectRepository.deleteProject(pId);

            // Prepare success response
            res.setStatusCode(200);
            res.setBody(toJson(Map.of("success", true, "message", "Project deleted successfully", "id", pId)));

        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of("error", "Failed to delete project: " + e.getMessage())));
        }
        return res;
    }

    private IResponse handleCreateStatus(IRequest req, Response res, String token) {
        try {
            // e.g. openfaas -> http://<ip_addr>:<port>/function/project/status

            // Parse and validate pId
            Integer pId = validateQueryParam(req, res, "pId", Integer.class);
            if (pId == null) {
                return res;
            }

            JsonNode rootNode = objectMapper.readTree(req.getBody());

            // validate the name and color are not empty
            if (rootNode.path("name").isMissingNode() || rootNode.path("color").isMissingNode()
                    || rootNode.path("name").asText().isEmpty() || rootNode.path("color").asText().isEmpty()) {
                res.setStatusCode(400);
                res.setBody(toJson(
                        Map.of("error", "Bad Request", "message", "Name and color cannot be empty")));
                return res;
            }

            // validate the color is a valid hex color
            if (!rootNode.path("color").asText().matches("^#([0-9a-fA-F]{6})$")) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of("error", "Bad Request", "message", "Color must be a valid hex color")));
                return res;
            }

            // Find the project
            Project project = projectRepository.findById(pId, ProjectFetchConfig.none());
            if (project == null) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of("error", "Not Found", "message", "Project not found")));
                return res;
            }

            // Create the status
            TaskStatus status = new TaskStatus();
            status.setStatusName(rootNode.path("name").asText());
            status.setDescription(rootNode.path("description").asText());
            status.setColor(rootNode.path("color").asText());
            status.setStatusOrder(1); // deprecated, keep it 1 for now

            status.setProject(project);

            TaskStatus createdStatus = taskStatusRepository.createStatus(status);

            res.setStatusCode(201);
            res.setBody(toJson(
                    Map.of("success", true, "message", "Status created successfully", "id", createdStatus.getId())));
            return res;
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of("error", "Internal Server Error", "message", e.getMessage())));
            return res;
        }
    }

    private IResponse handleUpdateStatus(IRequest req, Response res, String token) {
        try {
            // e.g. openfaas -> http://<ip_addr>:<port>/function/project/status
            JsonNode rootNode = objectMapper.readTree(req.getBody());

            // parse and validate statusId
            Integer statusId = validateQueryParam(req, res, "sId", Integer.class);
            if (statusId == null) {
                return res;
            }

            // Find the status
            TaskStatus status = taskStatusRepository.findById(statusId);
            if (status == null) {
                res.setStatusCode(404);
                res.setBody(
                        toJson(Map.of("error", "Not Found", "message", "Status with id " + statusId + " not found")));
                return res;
            }

            // validate the color is a valid hex color if it is provided which is optional
            if (rootNode.has("color")) {
                if (!rootNode.path("color").asText().matches("^#([0-9a-fA-F]{6})$")) {
                    res.setStatusCode(400);
                    res.setBody(toJson(Map.of("error", "Bad Request", "message", "Color must be a valid hex color")));
                    return res;
                } else {
                    status.setColor(rootNode.path("color").asText());
                }
            }

            if (rootNode.has("name")) {
                status.setStatusName(rootNode.path("name").asText());
            }

            if (rootNode.has("description")) {
                status.setDescription(rootNode.path("description").asText());
            }

            TaskStatus updatedStatus = taskStatusRepository.updateStatus(status);

            res.setStatusCode(200);
            res.setBody(toJson(
                    Map.of("success", true, "message", "Status updated successfully", "id", updatedStatus.getId())));
            return res;
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of("error", "Internal Server Error", "message", e.getMessage())));
            return res;
        }
    }

    private IResponse handleDeleteStatus(IRequest req, Response res, String token) {
        try {
            Integer statusId = validateQueryParam(req, res, "sId", Integer.class);
            if (statusId == null) {
                return res;
            }

            try {
                taskStatusRepository.deleteStatus(statusId);
            } catch (IllegalArgumentException e) {
                res.setStatusCode(404);
                res.setBody(
                        toJson(Map.of("error", "Not Found", "message", "Status with id " + statusId + " not found")));
                return res;
            }

            res.setStatusCode(200);
            res.setBody(toJson(Map.of("success", true, "message", "Status deleted successfully", "id", statusId)));
            return res;
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of("error", "Internal Server Error", "message", e.getMessage())));
            return res;
        }
    }

    private IResponse handleCreateTag(IRequest req, Response res, String token) {
        try {
            // e.g. openfaas -> http://<ip_addr>:<port>/function/project/tag

            // Parse and validate pId
            Integer pId = validateQueryParam(req, res, "pId", Integer.class);
            if (pId == null) {
                return res;
            }

            JsonNode rootNode = objectMapper.readTree(req.getBody());

            // validate the name and color are not empty
            if (rootNode.path("name").isMissingNode() || rootNode.path("color").isMissingNode()
                    || rootNode.path("name").asText().isEmpty() || rootNode.path("color").asText().isEmpty()) {
                res.setStatusCode(400);
                res.setBody(toJson(
                        Map.of("error", "Bad Request", "message", "Name, description and color cannot be empty")));
                return res;
            }

            // validate the color is a valid hex color
            if (!rootNode.path("color").asText().matches("^#([0-9a-fA-F]{6})$")) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of("error", "Bad Request", "message", "Color must be a valid hex color")));
                return res;
            }

            // Find the project
            Project project = projectRepository.findById(pId, ProjectFetchConfig.none());
            if (project == null) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of("error", "Not Found", "message", "Project not found")));
                return res;
            }

            // Create the tag
            ProjectTag tag = new ProjectTag();
            tag.setTagName(rootNode.path("name").asText());
            tag.setColor(rootNode.path("color").asText());

            tag.setProject(project);

            ProjectTag createdTag = projectTagRepository.createTag(tag);

            res.setStatusCode(201);
            res.setBody(
                    toJson(Map.of("success", true, "message", "Tag created successfully", "id", createdTag.getId())));
            return res;
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of("error", "Internal Server Error", "message", e.getMessage())));
            return res;
        }
    }

    private IResponse handleUpdateTag(IRequest req, Response res, String token) {
        try {
            Integer tagId = validateQueryParam(req, res, "tId", Integer.class);
            if (tagId == null) {
                return res;
            }

            ProjectTag tag = projectTagRepository.findById(tagId);
            if (tag == null) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of("error", "Not Found", "message", "Tag with id " + tagId + " not found")));
                return res;
            }

            JsonNode rootNode = objectMapper.readTree(req.getBody());

            if (rootNode.has("name")) {
                tag.setTagName(rootNode.path("name").asText());
            }

            if (rootNode.has("color")) {
                if (!rootNode.path("color").asText().matches("^#([0-9a-fA-F]{6})$")) {
                    res.setStatusCode(400);
                    res.setBody(toJson(Map.of("error", "Bad Request", "message", "Color must be a valid hex color")));
                    return res;
                } else {
                    tag.setColor(rootNode.path("color").asText());
                }
            }

            ProjectTag updatedTag = projectTagRepository.updateTag(tag);

            res.setStatusCode(200);
            res.setBody(
                    toJson(Map.of("success", true, "message", "Tag updated successfully", "id", updatedTag.getId())));
            return res;
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of("error", "Internal Server Error", "message", e.getMessage())));
            return res;
        }
    }

    private IResponse handleDeleteTag(IRequest req, Response res, String token) {
        try {
            Integer tagId = validateQueryParam(req, res, "tId", Integer.class);
            if (tagId == null) {
                return res;
            }

            try {
                projectTagRepository.deleteTag(tagId);
            } catch (IllegalArgumentException e) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of("error", "Not Found", "message", "Tag with id " + tagId + " not found")));
                return res;
            }

            res.setStatusCode(200);
            res.setBody(toJson(Map.of("success", true, "message", "Tag deleted successfully", "id", tagId)));
            return res;
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of("error", "Internal Server Error", "message", e.getMessage())));
            return res;
        }
    }
}