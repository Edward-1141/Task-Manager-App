package com.openfaas.function;

import java.util.HashMap;
import java.util.Map;

import com.openfaas.model.IResponse;
import com.openfaas.model.IRequest;
import com.openfaas.model.Response;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.core.JsonProcessingException;

import com.shared.function.entity.*;
import com.shared.function.repository.*;
import com.shared.function.JwtUtil;
import com.shared.function.routing.BaseHandler;
import com.shared.function.routing.RouteHandler;

public class Handler extends BaseHandler {

    private final UserRepository userRepository = new UserRepository();

    public Handler() {
        super(true);
    }

    @Override
    public Map<String, RouteHandler> initializeRouteHandlers() {
        Map<String, RouteHandler> handlers = new HashMap<>();
        handlers.put("/login", new RouteHandler()
                .addMethod("POST", req -> handleLogin(req, new Response())));
        handlers.put("/register", new RouteHandler()
                .addMethod("POST", req -> handleRegister(req, new Response())));
        return handlers;
    }

    @Override
    public String determineRoute(Map<String, String> path) {
        if (path.containsKey("login")) {
            return "/login";
        }

        if (path.containsKey("register")) {
            return "/register";
        }

        return "/";
    }

    private IResponse handleLogin(IRequest req, Response res) {
        try {
            JsonNode credentials = objectMapper.readTree(req.getBody());
            String email = credentials.path("email").asText();
            String password = credentials.path("password").asText();

            // Validate input
            if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
                System.out.println("DEBUG: Validation failed - missing email or password");
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Email and password are required"
                )));
                return res;
            }

            User user = userRepository.findByEmail(email);
            
            if (user == null) {
                res.setStatusCode(401);
                res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Invalid email or password"
                )));
                return res;
            }

            if (!validatePassword(user, password)) {
                res.setStatusCode(401);
                res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Invalid email or password"
                )));
                return res;
            }

            String token = JwtUtil.generateToken(user);

            res.setStatusCode(200);
            res.setBody(toJson(Map.of(
                "success", true,
                "token", token,
                "user", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getUserName()
                )
            )));
            return res;
        } catch (JsonProcessingException e) {
            System.err.println("ERROR: JSON parsing failed: " + e.getMessage());
            e.printStackTrace();
            res.setStatusCode(400);
            res.setBody(toJson(Map.of(
                "success", false,
                "error", "Invalid request format: " + e.getMessage()
            )));
            return res;
        } catch (Exception e) {
            System.err.println("ERROR: Login failed: " + e.getMessage());
            e.printStackTrace();
            res.setStatusCode(500);
            res.setBody(toJson(Map.of(
                "success", false,
                "error", "Login failed: " + e.getMessage()
            )));
            return res;
        }
    }

    private IResponse handleRegister(IRequest req, Response res) {
        try {
            JsonNode credentials = objectMapper.readTree(req.getBody());
            
            String email = credentials.path("email").asText();
            String password = credentials.path("password").asText();
            String userName = credentials.path("name").asText();

            if (email == null || email.isEmpty() || password == null || password.isEmpty() || userName == null || userName.isEmpty()) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Email, password and userName are required"
                )));
                return res;
            }

            // validate email
            if (!isValidEmail(email)) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Invalid email format"
                )));
                return res;
            }

            // validate password
            if (!isValidPassword(password)) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "Password must be at least 8 characters long"
                )));
                return res;
            }
            
            // check if user already exists
            if (userRepository.findByEmail(email) != null) {
                res.setStatusCode(400);
                res.setBody(toJson(Map.of(
                    "success", false,
                    "error", "User already exists"
                )));
                return res;
            }

            // create user
            User user = new User();
            user.setEmail(email);
            user.setPassword(password);
            user.setUserName(userName);
            userRepository.createUser(user);

            res.setStatusCode(200);
            res.setBody(toJson(Map.of(
                "success", true,
                "message", "User registered successfully",
                "id", user.getId()
            )));
            return res;
        } catch (Exception e) {
            System.err.println("ERROR: Register failed: " + e.getMessage());
            e.printStackTrace();
            res.setStatusCode(500);
            res.setBody(toJson(Map.of(
                "success", false,
                "error", "Register failed: " + e.getMessage()
            )));
            return res;
        }
    }

    // Helper methods
    private boolean validatePassword(User user, String inputPassword) {
        // Implement your actual password validation logic
        return inputPassword.equals(user.getPassword());
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    private boolean isValidPassword(String password) {
        return password.length() >= 8;
    }

}
