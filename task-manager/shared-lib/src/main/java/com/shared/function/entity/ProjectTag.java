package com.shared.function.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "project_tags")
public class ProjectTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "tag_name", nullable = false)
    private String tagName;

    @Column(name = "color", length = 7)
    private String color;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @ManyToMany(mappedBy = "tags")
    private Set<Task> tasks;
} 