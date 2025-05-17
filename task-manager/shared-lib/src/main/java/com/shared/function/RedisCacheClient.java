package com.shared.function;

import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;

public class RedisCacheClient {
    private static final long DEFAULT_TTL_SECONDS = 300; // 5 minutes
    private static final int MAX_RETRIES = 3; // Set your desired maximum retry limit
    private static final Duration RETRY_DELAY = Duration.ofMinutes(10); // 10 minute

    private Instant lastConnectionAttempt;
    private int retryCount = 0;

    private RedisClient redisClient;
    private StatefulRedisConnection<String, String> connection;
    private RedisCommands<String, String> syncCommands;
    private final ObjectMapper objectMapper;
    private final String redisUri;

    public RedisCacheClient(String redisUri) {
        this.redisUri = redisUri;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        initializeClient();
    }

    public RedisCacheClient(String host, String port, String password) {
        this("redis://:" + password + "@" + host + ":" + port);
    }

    public RedisCacheClient(String host, String port) {
        this("redis://" + host + ":" + port);
    }

    private void initializeClient() {
        if (lastConnectionAttempt == null) {
            lastConnectionAttempt = Instant.now();
        }

        if (retryCount > MAX_RETRIES && Instant.now().isBefore(lastConnectionAttempt.plus(RETRY_DELAY))) {
            System.out.println("Skipping connection attempt due to retry delay");
            return;
        } else if (retryCount > MAX_RETRIES) {
            System.out.println("Resetting retry count");
            lastConnectionAttempt = Instant.now();
            retryCount = 0;
        }
        retryCount++;

        if (redisClient != null) {
            try {
                redisClient.shutdown();
            } catch (Exception e) {
                // Ignore shutdown errors
            }
        }
        redisClient = RedisClient.create(redisUri);
        connect();
    }

    private void connect() {
        try {
            if (connection != null) {
                try {
                    connection.close();
                } catch (Exception e) {
                    // Ignore close errors
                }
            }
            connection = redisClient.connect();
            syncCommands = connection.sync();
            retryCount = 0; // Reset retry counter on successful connection
        } catch (Exception e) {
            // If connection fails, try to reinitialize the client
            initializeClient();
            if (retryCount > MAX_RETRIES) {
                System.out.println("Failed to connect to Redis after " + MAX_RETRIES + " attempts");
                return;
            }
        }
    }

    private void ensureConnection() {
        try {
            // Try to ping Redis to check connection
            syncCommands.ping();
        } catch (Exception e) {
            // If connection is lost or event executor is terminated, reinitialize everything
            initializeClient();
        }
    }

    /**
     * Store object in Redis with TTL (Time-To-Live in seconds)
     * @param key
     * @param value
     * @param ttlSeconds
     */
    public void set(String key, Object value, long ttlSeconds) {
        ensureConnection();
        try {
            String jsonValue = objectMapper.writeValueAsString(value);
            syncCommands.set(key, jsonValue);
            if (ttlSeconds > 0) {
                syncCommands.expire(key, Duration.ofSeconds(ttlSeconds));
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to serialize object for Redis" + e.getMessage(), e);
        }
    }

    public void set(String key, Object value) {
        set(key, value, DEFAULT_TTL_SECONDS);
    }

    /**
     * Get object from Redis
     * @param key
     * @param clazz
     * @return object from Redis or null if key does not exist
     */
    public <T> T get(String key, Class<T> clazz) {
        ensureConnection();
        String jsonValue = syncCommands.get(key);
        if (jsonValue == null) {
            return null;
        }
        try {
            return objectMapper.readValue(jsonValue, clazz);
        } catch (IOException e) {
            throw new RuntimeException("Failed to deserialize object from Redis", e);
        }
    }

    /**
     * Delete key from Redis
     * @param key
     */
    public void delete(String key) {
        ensureConnection();
        syncCommands.del(key);
    }

    /**
     * Check if key exists
     * @param key
     * @return true if key exists, false otherwise
     */
    public boolean exists(String key) {
        ensureConnection();
        return syncCommands.exists(key) > 0;
    }

    /**
     * Check if Redis connection is alive
     * @return true if connection is alive, false otherwise
     */
    public boolean isConnected() {
        try {
            syncCommands.ping();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Close connection (call this when your function shuts down)
     */
    public void shutdown() {
        try {
            if (connection != null) {
                connection.close();
            }
        } catch (Exception e) {
            // Ignore close errors
        }
        try {
            if (redisClient != null) {
                redisClient.shutdown();
            }
        } catch (Exception e) {
            // Ignore shutdown errors
        }
    }
}