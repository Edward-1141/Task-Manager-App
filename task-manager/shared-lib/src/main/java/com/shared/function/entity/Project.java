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
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "project_members",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members;

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private Set<Task> tasks;

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private Set<TaskStatus> taskStatuses;

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private Set<ProjectTag> tags;
}