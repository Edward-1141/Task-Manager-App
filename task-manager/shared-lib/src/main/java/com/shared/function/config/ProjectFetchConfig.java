package com.shared.function.config;

import lombok.Getter;
import lombok.Setter;

/**
 * Configuration class for Project entity fetch settings.
 * Controls which relationships should be eagerly loaded when fetching projects.
 */
@Getter
@Setter
public class ProjectFetchConfig extends FetchConfig {
    private boolean fetchCreatedBy;
    private boolean fetchMembers;
    private boolean fetchTasks;
    private boolean fetchTaskStatuses;
    private boolean fetchTags;

    public ProjectFetchConfig() {
        super();
        this.fetchCreatedBy = true;
        this.fetchMembers = true;
        this.fetchTasks = true;
        this.fetchTaskStatuses = true;
        this.fetchTags = true;
    }

    public ProjectFetchConfig(boolean fetchAll) {
        super(fetchAll);
        this.fetchCreatedBy = fetchAll;
        this.fetchMembers = fetchAll;
        this.fetchTasks = fetchAll;
        this.fetchTaskStatuses = fetchAll;
        this.fetchTags = fetchAll;
    }

    public static ProjectFetchConfig all() {
        return new ProjectFetchConfig(true);
    }

    public static ProjectFetchConfig none() {
        return new ProjectFetchConfig(false);
    }

    /**
     * Builds the JOIN FETCH part of the query based on the fetch configuration.
     * @return A string containing all the necessary JOIN FETCH clauses.
     */
    public String buildJoinFetchClause() {
        StringBuilder joins = new StringBuilder();
        if (isFetchAll() || isFetchCreatedBy()) joins.append("LEFT JOIN FETCH p.createdBy ");
        if (isFetchAll() || isFetchMembers()) joins.append("LEFT JOIN FETCH p.members ");
        if (isFetchAll() || isFetchTasks()) joins.append("LEFT JOIN FETCH p.tasks ");
        if (isFetchAll() || isFetchTaskStatuses()) joins.append("LEFT JOIN FETCH p.taskStatuses ");
        if (isFetchAll() || isFetchTags()) joins.append("LEFT JOIN FETCH p.tags ");
        return joins.toString();
    }
} 