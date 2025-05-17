package com.shared.function.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.Instant;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "task_name", nullable = false)
    private String taskName;

    @Column(name = "content")
    private String content;

    @Column(name = "start_time", nullable = false)
    private Instant startTime = Instant.now();

    @Column(name = "end_time", nullable = false)
    private Instant endTime = Instant.now();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @ManyToMany
    @JoinTable(
        name = "task_assignments",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> assignedTo;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private TaskStatus status;

    @Column(name = "priority")
    private Integer priority;

    @ManyToMany()
    @JoinTable(
        name = "task_tags",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<ProjectTag> tags;
}