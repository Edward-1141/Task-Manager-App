package com.shared.function.repository;

import com.shared.function.entity.ProjectTag;
import com.shared.function.JpaUtil;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;
import jakarta.persistence.EntityTransaction;

public class ProjectTagRepository {

    public ProjectTag findById(Integer id) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.find(ProjectTag.class, id);
        }
    }

    public ProjectTag createTag(ProjectTag tag) {
        if (tag.getId() != null) {
            throw new IllegalArgumentException("Tag ID must be null when creating a new tag");
        }

        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            em.persist(tag);
            tx.commit();
            return tag;
        } catch (PersistenceException e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error creating tag: " + e.getMessage(), e);
        }
    }

    public ProjectTag updateTag(ProjectTag tag) {
        if (tag.getId() == null) {
            throw new IllegalArgumentException("Tag ID must not be null when updating a tag");
        }

        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            em.merge(tag);
            tx.commit();
            return tag;
        } catch (PersistenceException e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error updating tag: " + e.getMessage(), e);
        }
    }
    public void deleteTag(Integer id) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            ProjectTag tag = em.find(ProjectTag.class, id);
            if (tag == null) {
                throw new IllegalArgumentException("Tag not found");
            }

            em.remove(tag);
            tx.commit();
        } catch (PersistenceException e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error deleting tag: " + e.getMessage(), e);
        }
    }
    
}