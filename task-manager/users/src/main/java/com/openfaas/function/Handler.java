package com.openfaas.function;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

import com.openfaas.model.IResponse;
import com.openfaas.model.IRequest;
import com.openfaas.model.Response;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.shared.function.entity.User;
import com.shared.function.DTL.UserOverview;
import com.shared.function.repository.UserRepository;
import com.shared.function.JwtUtil;
import com.shared.function.routing.BaseHandler;
import com.shared.function.routing.RouteHandler;

public class Handler extends BaseHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UserRepository userRepository = new UserRepository();

    @Override
    public Map<String, RouteHandler> initializeRouteHandlers() {
        Map<String, RouteHandler> handlers = new HashMap<>();
        handlers.put("/", new RouteHandler()
                .addMethod("GET", req -> handleGetAllUsers(req, new Response()))
                .addMethod("POST", req -> handleUpdateUser(req, new Response(), req.getHeader("Authorization").substring(7))));
        return handlers;
    }

    @Override
    public String determineRoute(Map<String, String> path) {
        return "/";
    }

    private IResponse handleGetAllUsers(IRequest req, Response res) {
        try {
            List<UserOverview> users = userRepository.findAll().stream()
                .map(UserOverview::new)
                .toList();

            res.setStatusCode(200);
            res.setBody(toJson(Map.of(
                "success", true,
                "users", users
            )));
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of(
                "success", false,
                "error", "Failed to retrieve users: " + e.getMessage()
            )));
        }
        return res;
    }

    private IResponse handleUpdateUser(IRequest req, Response res, String token) {
        try {
            Integer userId = validateQueryParam(req, res, "uId", Integer.class);
            if (userId == null) {
                return res;
            }
            // parse request body
            JsonNode requestBody = objectMapper.readTree(req.getBody());
            String userName = requestBody.path("name").asText();
            String email = requestBody.path("email").asText();
            String password = requestBody.path("password").asText();

            if (userId == null || userId <= 0) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Invalid user ID"
                )));
                return res;
            }

            // get user id from jwt token
            Integer tokenUserId = Integer.parseInt(JwtUtil.getUserIdFromToken(token));

            if (!tokenUserId.equals(userId)) {
                res.setStatusCode(403);
                res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "You are not authorized to update this user"
                )));
                return res;
            }

            // update user
            User user = userRepository.findById(userId);
            if (email != null && !email.isEmpty()) {
                user.setEmail(email);
            }
            if (password != null && !password.isEmpty()) {
                user.setPassword(password);
            }
            if (userName != null && !userName.isEmpty()) {
                user.setUserName(userName);
            }
            userRepository.updateUser(user);

            res.setStatusCode(200);
            res.setBody(toJson(Map.of(
                "success", true,
                "message", "User updated successfully",
                "id", user.getId()
            )));
            return res;
        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of(
                "success", false,
                "error", "Failed to update user: " + e.getMessage()
            )));
        }
        return res;
    }
}