package com.shared.function;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

import java.util.HashMap;
import java.util.Map;

public class JpaUtil {
    private static final EntityManagerFactory emf;
    private static final Secret secret = new Secret();

    static {
        try {
            // Read OpenFaaS secrets
            String jdbcUrl = secret.getSecret("db-connection-string");
            
            // JPA properties
            Map<String, String> properties = new HashMap<>();
            properties.put("jakarta.persistence.jdbc.url", jdbcUrl);

            emf = Persistence.createEntityManagerFactory("serverless-pu", properties);

        } catch (Exception e) {
            throw new RuntimeException("JPA initialization failed", e);
        }
    }

    public static EntityManager getEntityManager() {
        return emf.createEntityManager();
    }

    public static void ping() {
        try {
            getEntityManager().createNativeQuery("SELECT 1").getSingleResult();
        } catch (Exception e) {
            System.err.println("JPA ping failed");
            throw new RuntimeException("JPA ping failed", e);
        }
    }

    public static void shutdown() {
        if (emf != null && emf.isOpen()) {
            emf.close();
        }
    }
}

