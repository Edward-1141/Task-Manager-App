package com.shared.function.config;

import lombok.Getter;
import lombok.Setter;

/**
 * Configuration class for Task entity fetch settings.
 * Controls which relationships should be eagerly loaded when fetching tasks.
 */
@Getter
@Setter
public class TaskFetchConfig extends FetchConfig {
    private boolean fetchProject;
    private boolean fetchCreatedBy;
    private boolean fetchStatus;
    private boolean fetchAssignedTo;
    private boolean fetchTags;

    public TaskFetchConfig() {
        super();
        this.fetchProject = true;
        this.fetchCreatedBy = true;
        this.fetchStatus = true;
        this.fetchAssignedTo = true;
        this.fetchTags = true;
    }

    public TaskFetchConfig(boolean fetchAll) {
        super(fetchAll);
        this.fetchProject = fetchAll;
        this.fetchCreatedBy = fetchAll;
        this.fetchStatus = fetchAll;
        this.fetchAssignedTo = fetchAll;
        this.fetchTags = fetchAll;
    }

    public static TaskFetchConfig all() {
        return new TaskFetchConfig(true);
    }

    public static TaskFetchConfig none() {
        return new TaskFetchConfig(false);
    }

    /**
     * Builds the JOIN FETCH part of the query based on the fetch configuration.
     * @return A string containing all the necessary JOIN FETCH clauses.
     */
    public String buildJoinFetchClause() {
        StringBuilder joins = new StringBuilder();
        if (isFetchAll() || isFetchProject()) joins.append("LEFT JOIN FETCH t.project ");
        if (isFetchAll() || isFetchCreatedBy()) joins.append("LEFT JOIN FETCH t.createdBy ");
        if (isFetchAll() || isFetchStatus()) joins.append("LEFT JOIN FETCH t.status ");
        if (isFetchAll() || isFetchAssignedTo()) joins.append("LEFT JOIN FETCH t.assignedTo ");
        if (isFetchAll() || isFetchTags()) joins.append("LEFT JOIN FETCH t.tags ");
        return joins.toString();
    }
} 