package com.shared.function.repository;

import com.shared.function.JpaUtil;
import com.shared.function.entity.User;
import com.shared.function.entity.Project;
import com.shared.function.entity.Task;
import com.shared.function.config.ProjectFetchConfig;
import com.shared.function.config.TaskFetchConfig;
import com.shared.function.config.UserFetchConfig;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.PersistenceException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.EntityExistsException;

import java.util.List;

public class UserRepository {
    /**
     * Find a user by their ID with configurable fetch settings.
     * @param id The ID of the user to find.
     * @param fetchConfig Configuration for which relationships to fetch.
     * @return The user with the given ID, or null if they do not exist.
     */
    public User findById(Integer id, UserFetchConfig fetchConfig) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.createQuery("SELECT u FROM User u " + fetchConfig.buildJoinFetchClause() + "WHERE u.id = :id", User.class)
                    .setParameter("id", id)
                    .getSingleResult();
        }
    }

    /**
     * Find a user by their ID.
     * @param id The ID of the user to find.
     * @return The user with the given ID, or null if they do not exist.
     */
    public User findById(Integer id) {
        return findById(id, UserFetchConfig.all());
    }

    public List<User> findAllById(List<Integer> ids) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.createQuery("SELECT u FROM User u WHERE u.id IN :ids", User.class)
                    .setParameter("ids", ids)
                    .getResultList();
        }
    }

    /**
     * Create a new user in the database.
     * @param user The user to create.
     * @return The created user instance.
     * @throws PersistenceException if the creation fails
     * @throws EntityExistsException if a user with the same ID already exists
     */
    public User createUser(User user) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();
            
            // Check if user already exists
            if (user.getId() != null && em.find(User.class, user.getId()) != null) {
                tx.rollback();
                throw new EntityExistsException("User with id " + user.getId() + " already exists");
            }
            
            em.persist(user);
            tx.commit();
            return user;
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error creating user: " + e.getMessage(), e);
        }
    }

    /**
     * Update an existing user in the database.
     * @param user The user to update.
     * @return The updated user instance.
     * @throws PersistenceException if the update fails
     * @throws EntityNotFoundException if the user does not exist
     */
    public User updateUser(User user) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();
            
            // Check if user exists
            if (user.getId() == null || em.find(User.class, user.getId()) == null) {
                tx.rollback();
                throw new EntityNotFoundException("User with id " + user.getId() + " not found");
            }
            
            User updatedUser = em.merge(user);
            tx.commit();
            return updatedUser;
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error updating user: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a user by their ID from the database.
     * @param id The ID of the user to delete.
     * @throws PersistenceException if the deletion fails
     * @throws jakarta.persistence.EntityNotFoundException if the user does not exist
     */
    public void deleteUser(Integer id) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();
            User user = em.find(User.class, id);
            if (user == null) {
                tx.rollback();
                throw new EntityNotFoundException("User with id " + id + " not found");
            }
            em.remove(user);
            tx.commit();
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error deleting user: " + e.getMessage(), e);
        }
    }
    
    /**
     * Find a user by their email address with configurable fetch settings.
     * @param email The email address to search for.
     * @param fetchConfig Configuration for which relationships to fetch.
     * @return The user with the given email, or null if not found.
     */
    public User findByEmail(String email, UserFetchConfig fetchConfig) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            List<User> users = em.createQuery("SELECT u FROM User u " + fetchConfig.buildJoinFetchClause() + "WHERE u.email = :email", User.class)
                    .setParameter("email", email)
                    .getResultList();
            return users.isEmpty() ? null : users.get(0);
        }
    }

    /**
     * Find a user by their email address.
     * @param email The email address to search for.
     * @return The user with the given email, or null if not found.
     */
    public User findByEmail(String email) {
        return findByEmail(email, UserFetchConfig.none());
    }

    public List<User> findAll() {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.createQuery("SELECT u FROM User u", User.class)
                    .getResultList();
        } catch (Exception e) {
            throw new PersistenceException("Error retrieving all users: " + e.getMessage(), e);
        }
    }
}
