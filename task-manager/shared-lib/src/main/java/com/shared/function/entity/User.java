package com.shared.function.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Set;


@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Integer id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @JsonProperty("name")
    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "password", nullable = false)
    private String password;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "createdBy")
    private Set<Project> createdProjects;

    @JsonIgnore
    @ManyToMany(mappedBy = "members")
    private Set<Project> memberOfProjects;

    @JsonIgnore
    @OneToMany(mappedBy = "createdBy")
    private Set<Task> createdTasks;

    @JsonIgnore
    @ManyToMany(mappedBy = "assignedTo")
    private Set<Task> assignedTasks;
}