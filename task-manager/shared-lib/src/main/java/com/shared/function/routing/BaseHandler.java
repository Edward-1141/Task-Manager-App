package com.shared.function.routing;

import java.util.Map;

import com.openfaas.model.IRequest;
import com.openfaas.model.IResponse;
import com.openfaas.model.Response;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.util.StdDateFormat;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.shared.function.JpaUtil;
import com.shared.function.JwtUtil;
import com.shared.function.RedisCacheClient;
import com.shared.function.Secret;

public abstract class BaseHandler extends com.openfaas.model.AbstractHandler {
    protected final ObjectMapper objectMapper;
    protected final Map<String, RouteHandler> routeHandlers;
    private final Secret secret = new Secret();
    protected final boolean isPublicApi;
    protected RedisCacheClient redisCacheClient;

    protected BaseHandler() {
        this(false);
    }

    protected BaseHandler(boolean isPublicApi) {
        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .configure(SerializationFeature.WRITE_DATES_WITH_ZONE_ID, false)
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .setDateFormat(new StdDateFormat().withColonInTimeZone(true));
        this.routeHandlers = initializeRouteHandlers();
        this.isPublicApi = isPublicApi;

        String redisHost = System.getenv("redis-host");
        String redisPort = System.getenv("redis-port");
        String redisPassword = secret.getSecret("redis-password");

        try {
            redisCacheClient = new RedisCacheClient(redisHost, redisPort, redisPassword);
        } catch (Exception e) {
            System.err.println("Error initializing RedisCacheClient: " + e.getMessage());
            redisCacheClient = null;
        }

        JpaUtil.ping();
    }

    public abstract Map<String, RouteHandler> initializeRouteHandlers();

    protected String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            System.err.println("ERROR: JSON serialization failed: " + e.getMessage());
            return "{\"error\":\"Failed to serialize response\",\"message\":\"Internal server error\"}";
        }
    }

    protected String getHttpMethod(IRequest req) {
        String method;
        if (req.getHeaders().get("X-Http-Method-Override") != null) {
            method = req.getHeaders().get("X-Http-Method-Override");
        } else if (req.getHeaders().get("X-http-method-override") != null) {
            method = req.getHeaders().get("X-http-method-override");
        } else {
            method = "GET";
        }

        System.out.println("X-Http-Method-Override: " + method);
        return method.toUpperCase();
    }

    protected Response invalidToken(String invalidToken, Response res) {
        res.setStatusCode(401);
        if (invalidToken == null) {
            res.setBody(toJson(Map.of("error", "Unauthorized", "message", "No token provided")));
        } else {
            res.setBody(toJson(Map.of("error", "Unauthorized", "message", "Invalid token")));
        }
        return res;
    }

    protected Response methodNotAllowed(Response res) {
        res.setStatusCode(405);
        res.setBody(toJson(Map.of("error", "Method not allowed")));
        return res;
    }

    public abstract String determineRoute(Map<String, String> path);

    public IResponse Handle(IRequest req) {
        Response res = new Response();
        res.setHeader("Content-Type", "application/json");

        try {
            // Get HTTP method from either header or request method
            String method = getHttpMethod(req);

            // Validate request has token and is valid
            if (!isPublicApi) {
                String token = req.getHeaders().get("Authorization");
                if (token == null || !JwtUtil.validateToken(token.substring(7))) {
                    return invalidToken(token, res);
                }
            }

            // Determine the route
            String route = determineRoute(req.getPath());
            RouteHandler handler = routeHandlers.get(route);

            System.out.println("INFO: Received request to " + route + " with method " + method + " and body "
                    + req.getBody());

            if (handler == null) {
                res.setStatusCode(404);
                res.setBody(toJson(Map.of("error", "Not Found", "message", "Route not found")));
                return res;
            }

            if (!handler.supportsMethod(method)) {
                return methodNotAllowed(res);
            }

            // Execute the handler and append header content-type to the response
            IResponse response = handler.getHandler(method).apply(req);
            response.setHeader("Content-Type", "application/json");
            return response;

        } catch (Exception e) {
            res.setStatusCode(500);
            res.setBody(toJson(Map.of("error", e.getMessage())));
            return res;
        }
    }

    public <T> T validateQueryParam(IRequest req, Response res, String key, Class<T> clazz) {
        try {
            Map<String, String> queryParams = req.getQuery();
            if (queryParams.containsKey(key)) {
                return objectMapper.convertValue(queryParams.get(key), clazz);
            } else {
                res.setStatusCode(400);
                res.setBody(toJson(
                        Map.of("error", "Bad Request", "message", "Missing required parameter", "details", key)));
                return null;
            }
        } catch (IllegalArgumentException e) {
            res.setStatusCode(400);
            res.setBody(toJson(Map.of("error", "Bad Request", "message", "Invalid format for " + key)));
            return null;
        }
    }
}