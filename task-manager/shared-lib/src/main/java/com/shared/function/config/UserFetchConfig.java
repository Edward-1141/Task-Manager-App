package com.shared.function.config;

import lombok.Getter;
import lombok.Setter;

/**
 * Configuration class for User entity fetch settings.
 * Controls which relationships should be eagerly loaded when fetching users.
 */
@Getter
@Setter
public class UserFetchConfig extends FetchConfig {
    private boolean fetchCreatedProjects;
    private boolean fetchMemberOfProjects;
    private boolean fetchCreatedTasks;
    private boolean fetchAssignedTasks;

    public UserFetchConfig() {
        super();
        this.fetchCreatedProjects = true;
        this.fetchMemberOfProjects = true;
        this.fetchCreatedTasks = true;
        this.fetchAssignedTasks = true;
    }

    public UserFetchConfig(boolean fetchAll) {
        super(fetchAll);
        this.fetchCreatedProjects = fetchAll;
        this.fetchMemberOfProjects = fetchAll;
        this.fetchCreatedTasks = fetchAll;
        this.fetchAssignedTasks = fetchAll;
    }

    public static UserFetchConfig all() {
        return new UserFetchConfig(true);
    }

    public static UserFetchConfig none() {
        return new UserFetchConfig(false);
    }

    /**
     * Builds the JOIN FETCH part of the query based on the fetch configuration.
     * @return A string containing all the necessary JOIN FETCH clauses.
     */
    public String buildJoinFetchClause() {
        StringBuilder joins = new StringBuilder();
        if (isFetchAll() || isFetchCreatedProjects()) joins.append("LEFT JOIN FETCH u.createdProjects ");
        if (isFetchAll() || isFetchMemberOfProjects()) joins.append("LEFT JOIN FETCH u.memberOfProjects ");
        if (isFetchAll() || isFetchCreatedTasks()) joins.append("LEFT JOIN FETCH u.createdTasks ");
        if (isFetchAll() || isFetchAssignedTasks()) joins.append("LEFT JOIN FETCH u.assignedTasks ");
        return joins.toString();
    }
} 