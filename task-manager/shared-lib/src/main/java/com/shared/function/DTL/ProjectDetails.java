package com.shared.function.DTL;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.shared.function.entity.Project;
import com.shared.function.entity.Task;
import com.shared.function.entity.User;
import com.shared.function.entity.ProjectTag;
import com.shared.function.entity.TaskStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectDetails {
    private ProjectMetadata project;
    private List<TaskDetails> tasks;
    @JsonProperty("tag_map")
    private Map<Integer, TagDetails> tagMap;
    @JsonProperty("status_map")
    private Map<Integer, StatusDetails> statusMap;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class ProjectMetadata {
        private Integer id;
        private String name;
        private String description;
        @JsonProperty("created_at")
        private Instant createdAt;
        @JsonProperty("updated_at")
        private Instant updatedAt;
        private List<Integer> members;

        public ProjectMetadata(Project project, boolean includeMembers) {
            this.id = project.getId();
            this.name = project.getName();
            this.description = project.getDescription();
            this.createdAt = project.getCreatedAt();
            this.updatedAt = project.getUpdatedAt();
            if (includeMembers) {
                this.members = project.getMembers().stream().map(User::getId).toList();
            } else {
                this.members = null;
            }
        }
    }

    @Getter
    @Setter
    public static class TaskDetails {
        private Integer id;
        @JsonProperty("created_by")
        private Integer createdBy;
        private String name;
        private String content;
        @JsonProperty("start_time")
        private Instant startTime;
        @JsonProperty("end_time")
        private Instant endTime;
        @JsonProperty("created_at")
        private Instant createdAt;
        @JsonProperty("updated_at")
        private Instant updatedAt;
        @JsonProperty("status_id")
        private Integer statusId;
        private Integer priority;
        @JsonProperty("tag_ids")
        private List<Integer> tagIds;
        @JsonProperty("assigned_to")
        private List<Integer> assignedTo;

        public TaskDetails(Task task) {
            this.id = task.getId();
            this.createdBy = task.getCreatedBy().getId();
            this.name = task.getTaskName();
            this.content = task.getContent();
            this.startTime = task.getStartTime();
            this.endTime = task.getEndTime();
            this.createdAt = task.getCreatedAt();
            this.updatedAt = task.getUpdatedAt();
            this.statusId = task.getStatus().getId();
            this.priority = task.getPriority();
            this.tagIds = task.getTags().stream().map(ProjectTag::getId).toList();
            this.assignedTo = task.getAssignedTo().stream().map(User::getId).toList();
        }
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class TagDetails {
        private String name;
        private String color;
    }

    public Map<Integer, TagDetails> getTagMap(List<ProjectTag> tags) {
        return tags.stream().collect(Collectors.toMap(ProjectTag::getId, tag -> new TagDetails(
                tag.getTagName(),
                tag.getColor())));
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class StatusDetails {
        private String name;
        private String description;
        private String color;
    }

    public Map<Integer, StatusDetails> getStatusMap(List<TaskStatus> statuses) {
        return statuses.stream().collect(Collectors.toMap(TaskStatus::getId,
                status -> new StatusDetails(
                        status.getStatusName(),
                        status.getDescription(),
                        status.getColor())));
    }

    public ProjectDetails(Project project) {
        this.project = new ProjectMetadata(project, true);
        this.tasks = project.getTasks().stream().map(TaskDetails::new).toList();
        this.tagMap = getTagMap(project.getTags().stream().toList());
        this.statusMap = getStatusMap(project.getTaskStatuses().stream().toList());
    }
}
