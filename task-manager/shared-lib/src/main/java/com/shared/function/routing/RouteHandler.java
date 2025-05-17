package com.shared.function.routing;

import com.openfaas.model.IRequest;
import com.openfaas.model.IResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

public class RouteHandler {
    private final Map<String, Function<IRequest, IResponse>> methods = new HashMap<>();

    public RouteHandler addMethod(String method, Function<IRequest, IResponse> handler) {
        methods.put(method.toUpperCase(), handler);
        return this;
    }

    public Function<IRequest, IResponse> getHandler(String method) {
        return methods.get(method.toUpperCase());
    }

    public boolean supportsMethod(String method) {
        return methods.containsKey(method.toUpperCase());
    }
} 