package com.shared.function.repository;

import com.shared.function.entity.TaskStatus;
import com.shared.function.JpaUtil;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;
import jakarta.persistence.EntityTransaction;

public class TaskStatusRepository {

    public TaskStatus findById(Integer id) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.find(TaskStatus.class, id);
        }
    }

    public TaskStatus createStatus(TaskStatus status) {
        if (status.getId() != null) {
            throw new IllegalArgumentException("Status ID must be null when creating a new status");
        }

        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            em.persist(status);
            tx.commit();
            return status;
        } catch (PersistenceException e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error creating status: " + e.getMessage(), e);
        }
    }

    public TaskStatus updateStatus(TaskStatus status) {
        if (status.getId() == null) {
            throw new IllegalArgumentException("Status ID must not be null when updating a status");
        }

        if (status.getProject() == null) {
            throw new IllegalArgumentException("Project must not be null when updating a status");
        }

        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            em.merge(status);
            tx.commit();
            return status;
        } catch (PersistenceException e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error updating status: " + e.getMessage(), e);
        }
    }

    public void deleteStatus(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Status ID must not be null when deleting a status");
        }

        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            TaskStatus status = em.find(TaskStatus.class, id);
            if (status == null) {
                throw new IllegalArgumentException("Status not found");
            }

            em.remove(status);
            tx.commit();
        } catch (PersistenceException e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error deleting status: " + e.getMessage(), e);
        }
    }
}