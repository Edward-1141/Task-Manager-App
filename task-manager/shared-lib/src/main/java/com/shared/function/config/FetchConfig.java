package com.shared.function.config;

/**
 * Base class for fetch configurations.
 * Contains common methods and fields for all fetch configurations.
 */
public abstract class FetchConfig {
    protected boolean fetchAll;

    public FetchConfig() {
        this.fetchAll = false;
    }

    public FetchConfig(boolean fetchAll) {
        this.fetchAll = fetchAll;
    }

    public boolean isFetchAll() {
        return fetchAll;
    }

    public void setFetchAll(boolean fetchAll) {
        this.fetchAll = fetchAll;
    }
} 