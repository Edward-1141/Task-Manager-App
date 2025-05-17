package com.shared.function.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "task_statuses")
public class TaskStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "status_name", nullable = false)
    private String statusName;

    @Column(name = "status_order", nullable = false)
    private Integer statusOrder;

    @Column(name = "description")
    private String description;

    @Column(name = "color", length = 7)
    private String color;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public TaskStatus(String statusName, Integer statusOrder, String description, String color, Project project) {
        this.statusName = statusName;
        this.statusOrder = statusOrder;
        this.description = description;
        this.color = color;
        this.project = project;
    }
    
} 