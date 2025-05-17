package com.openfaas.function;

import java.util.HashMap;
import java.util.Map;

import com.openfaas.model.IResponse;
import com.openfaas.model.IRequest;
import com.openfaas.model.Response;
import com.fasterxml.jackson.databind.ObjectMapper;

// import com.shared.function.*; // shared lib

public class Handler extends com.openfaas.model.AbstractHandler {

    // private final TestHepler testHepler = new TestHepler(); // shared lib
    private final ObjectMapper objectMapper = new ObjectMapper();

    public IResponse Handle(IRequest req) {
        Response res = new Response();

        // Create a Map to hold the response data
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("message", "Hello from OpenFaaS Java Function!");
        // responseMap.put("testString", testHepler.getTestString()); // shared lib
        responseMap.put("timestamp", System.currentTimeMillis());

        // Add request path to response if any
        if (req.getPath() != null && !req.getPath().isEmpty()) {
            responseMap.put("path", req.getPath());
        }

        // Add request body to response if any
        if (req.getBody() != null && !req.getBody().isEmpty()) {
            responseMap.put("request_body", req.getBody());
        }

        try {
            // Convert the Map to JSON string
            String jsonResponse = objectMapper.writeValueAsString(responseMap);
            res.setBody(jsonResponse);
            res.setHeader("Content-Type", "application/json");
        } catch (Exception e) {
            res.setBody("{\"error\":\"Failed to serialize response\"}");
            res.setHeader("Content-Type", "application/json");
        }

        return res;
    }
}
