package com.shared.function.repository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.shared.function.JpaUtil;
import com.shared.function.entity.Task;
import com.shared.function.entity.TaskStatus;
import com.shared.function.entity.User;
import com.shared.function.config.TaskFetchConfig;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.PersistenceException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.EntityExistsException;

public class TaskRepository {
    /**
     * Find a task by its ID.
     * @param id The ID of the task to find.
     * @return The task with the given ID, or null if it does not exist.
     */
    public Task findById(Integer id, TaskFetchConfig fetchConfig) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.createQuery("SELECT t FROM Task t " + fetchConfig.buildJoinFetchClause() + "WHERE t.id = :id", Task.class)
                    .setParameter("id", id)
                    .getSingleResult();
        }
    }

    /**
     * Find a task by its ID.
     * @param id The ID of the task to find.
     * @return The task with the given ID, or null if it does not exist.
     */
    public Task findById(Integer id) {
        return findById(id, TaskFetchConfig.all());
    }

    /**
     * Create a new task in the database.
     * @param task The task to create.
     * @return The created task instance.
     * @throws PersistenceException if the creation fails
     * @throws EntityExistsException if a task with the same ID already exists
     */
    public Task createTask(Task task) {
        EntityManager em = null;
        EntityTransaction tx = null;
        try {
            em = JpaUtil.getEntityManager();
            tx = em.getTransaction();
            tx.begin();

            // Check if task already exists
            if (task.getId() != null && em.find(Task.class, task.getId()) != null) {
                tx.rollback();
                throw new EntityExistsException("Task with id " + task.getId() + " already exists");
            }
            
            em.persist(task);
            tx.commit();
            return task;
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error creating task: " + e.getMessage(), e);
        } finally {
            if (em != null && em.isOpen()) {
                em.close();
            }
        }
    }

    /**
     * Update an existing task in the database.
     * @param task The task to update.
     * @return The updated task instance.
     * @throws PersistenceException if the update fails
     * @throws EntityNotFoundException if the task does not exist
     */
    public Task updateTask(Task task) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();
            
            // Check if task exists
            if (task.getId() == null || em.find(Task.class, task.getId()) == null) {
                tx.rollback();
                throw new EntityNotFoundException("Task with id " + task.getId() + " not found");
            }
            
            Task updatedTask = em.merge(task);
            tx.commit();
            return updatedTask;
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error updating task: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a task by its ID from the database.
     * @param id The ID of the task to delete.
     * @throws PersistenceException if the deletion fails
     * @throws EntityNotFoundException if the task does not exist
     */
    public void deleteTask(Integer id) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();
            Task task = em.find(Task.class, id);
            if (task == null) {
                tx.rollback();
                throw new EntityNotFoundException("Task with id " + id + " not found");
            }
            em.remove(task);
            tx.commit();
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error deleting task: " + e.getMessage(), e);
        }
    }

    /**
     * Find all tasks in a project with configurable fetch settings.
     * @param projectId The ID of the project.
     * @param fetchConfig Configuration for which relationships to fetch.
     * @return A list of tasks in the project.
     */
    public List<Task> findByProject(Integer projectId, TaskFetchConfig fetchConfig) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.createQuery("SELECT DISTINCT t FROM Task t " + fetchConfig.buildJoinFetchClause() + "WHERE t.project.id = :projectId", Task.class)
                    .setParameter("projectId", projectId)
                    .getResultList();
        }
    }

    /**
     * Find all tasks in a project.
     * @param projectId The ID of the project.
     * @return A list of tasks in the project.
     */
    public List<Task> findByProject(Integer projectId) {
        return findByProject(projectId, TaskFetchConfig.none());
    }

    /**
     * Find all tasks assigned to a user.
     * @param userId The ID of the user.
     * @return A list of tasks assigned to the user.
     */
    public List<Task> findByAssignedUser(Integer userId, TaskFetchConfig fetchConfig) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.createQuery("SELECT DISTINCT t FROM Task t " + fetchConfig.buildJoinFetchClause() + "JOIN t.assignedTo a WHERE a.id = :userId", Task.class)
                    .setParameter("userId", userId)
                    .getResultList();
        }
    }

    /**
     * Find all tasks assigned to a user.
     * @param userId The ID of the user.
     * @return A list of tasks assigned to the user.
     */
    public List<Task> findByAssignedUser(Integer userId) {
        return findByAssignedUser(userId, TaskFetchConfig.none());
    }

    /**
     * Find all tasks created by a user.
     * @param userId The ID of the user.
     * @return A list of tasks created by the user.
     */
    public List<Task> findByCreatedBy(Integer userId, TaskFetchConfig fetchConfig) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.createQuery("SELECT DISTINCT t FROM Task t " + fetchConfig.buildJoinFetchClause() + "WHERE t.createdBy.id = :userId", Task.class)
                    .setParameter("userId", userId)
                    .getResultList();
        }
    }
    /**
     * Find all tasks created by a user.
     * @param userId The ID of the user.
     * @return A list of tasks created by the user.
     */
    public List<Task> findByCreatedBy(Integer userId) {
        return findByCreatedBy(userId, TaskFetchConfig.none());
    }

    /**
     * Assign a task to a user.
     * @param taskId The ID of the task.
     * @param userId The ID of the user to assign the task to.
     * @throws EntityNotFoundException if either the task or user does not exist
     */
    public void assignTask(Integer taskId, Integer userId) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            Task task = em.find(Task.class, taskId);
            if (task == null) {
                throw new EntityNotFoundException("Task with id " + taskId + " not found");
            }

            User user = em.find(User.class, userId);
            if (user == null) {
                throw new EntityNotFoundException("User with id " + userId + " not found");
            }

            task.getAssignedTo().add(user);
            em.merge(task);
            tx.commit();
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error assigning task: " + e.getMessage(), e);
        }
    }

    /**
     * Remove a user from a task's assignees.
     * @param taskId The ID of the task.
     * @param userId The ID of the user to remove from assignees.
     * @throws EntityNotFoundException if either the task or user does not exist
     */
    public void unassignTask(Integer taskId, Integer userId) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            Task task = em.find(Task.class, taskId);
            if (task == null) {
                throw new EntityNotFoundException("Task with id " + taskId + " not found");
            }

            User user = em.find(User.class, userId);
            if (user == null) {
                throw new EntityNotFoundException("User with id " + userId + " not found");
            }

            task.getAssignedTo().remove(user);
            em.merge(task);
            tx.commit();
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error unassigning task: " + e.getMessage(), e);
        }
    }

    public Task updateTaskAssignments(Integer taskId, List<Integer> newUserIds) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            // Get the task
            Task task = em.find(Task.class, taskId);
            if (task == null) {
                throw new EntityNotFoundException("Task with id " + taskId + " not found");
            }

            // Get the current assignments
            Set<User> currentAssignments = task.getAssignedTo();

            // Create a set of new user IDs for efficient lookup
            Set<Integer> newUserIdSet = new HashSet<>(newUserIds);

            // Remove users that are no longer assigned
            currentAssignments.removeIf(user -> !newUserIdSet.contains(user.getId()));

            // Add new users
            for (Integer userId : newUserIds) {
                if (currentAssignments.stream().noneMatch(user -> user.getId().equals(userId))) {
                    User user = em.find(User.class, userId);
                    if (user == null) {
                        throw new EntityNotFoundException("User with id " + userId + " not found");
                    }
                    currentAssignments.add(user);
                }
            }
            
            // Update the task with the new assignments
            task.setAssignedTo(currentAssignments);
            em.merge(task);
            tx.commit();

            return task;
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error updating task assignments: " + e.getMessage(), e);
        }
    }
}
