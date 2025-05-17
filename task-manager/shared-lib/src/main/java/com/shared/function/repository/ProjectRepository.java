package com.shared.function.repository;

import com.shared.function.JpaUtil;
import com.shared.function.entity.Project;
import com.shared.function.entity.ProjectTag;
import com.shared.function.entity.TaskStatus;
import com.shared.function.entity.User;
import com.shared.function.config.ProjectFetchConfig;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.EntityExistsException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


public class ProjectRepository {
    /**
     * Find a project by its ID with configurable fetch settings.
     * 
     * @param id          The ID of the project to find.
     * @param fetchConfig Configuration for which relationships to fetch.
     * @return The project with the given ID, or null if it does not exist.
     */
    public Project findById(Integer id, ProjectFetchConfig fetchConfig) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em
                    .createQuery("SELECT p FROM Project p " + fetchConfig.buildJoinFetchClause() + "WHERE p.id = :id",
                            Project.class)
                    .setParameter("id", id)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    /**
     * Find a project by its ID.
     * 
     * @param id The ID of the project to find.
     * @return The project with the given ID, or null if it does not exist.
     */
    public Project findById(Integer id) {
        return findById(id, ProjectFetchConfig.none());
    }

    public Project getProjectDetails(Integer id) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.createQuery(
                    "SELECT p FROM Project p " +
                            "LEFT JOIN FETCH p.members " +
                            "LEFT JOIN FETCH p.tags " +
                            "LEFT JOIN FETCH p.taskStatuses " +
                            "LEFT JOIN FETCH p.createdBy " +
                            "LEFT JOIN FETCH p.tasks t " +
                            "LEFT JOIN FETCH t.tags " +
                            "LEFT JOIN FETCH t.assignedTo " +
                            "WHERE p.id = :id",
                    Project.class)
                    .setParameter("id", id)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    /**
     * Create a new project in the database.
     * 
     * @param project The project to create.
     * @return The created project instance.
     * @throws PersistenceException  if the creation fails
     * @throws EntityExistsException if a project with the same ID already exists
     */
    public Project createProject(Project project) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            // Check if project already exists
            if (project.getId() != null && em.find(Project.class, project.getId()) != null) {
                tx.rollback();
                throw new EntityExistsException("Project with id " + project.getId() + " already exists");
            }

            em.persist(project);
            tx.commit();
            return project;
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error creating project: " + e.getMessage(), e);
        }
    }

    /**
     * Update an existing project in the database.
     * 
     * @param project The project to update.
     * @return The updated project instance.
     * @throws PersistenceException    if the update fails
     * @throws EntityNotFoundException if the project does not exist
     */
    public Project updateProject(Project project) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            // Check if project exists
            if (project.getId() == null || em.find(Project.class, project.getId()) == null) {
                tx.rollback();
                throw new EntityNotFoundException("Project with id " + project.getId() + " not found");
            }

            Project updatedProject = em.merge(project);
            tx.commit();
            return updatedProject;
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error updating project: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a project by its ID from the database.
     * 
     * @param id The ID of the project to delete.
     * @throws PersistenceException    if the deletion fails
     * @throws EntityNotFoundException if the project does not exist
     */
    public void deleteProject(Integer id) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();
            Project project = em.find(Project.class, id);
            if (project == null) {
                tx.rollback();
                throw new EntityNotFoundException("Project with id " + id + " not found");
            }
            em.remove(project);
            tx.commit();
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error deleting project: " + e.getMessage(), e);
        }
    }

    /**
     * Find all projects where a user is a member with configurable fetch settings.
     * 
     * @param userId      The ID of the user.
     * @param fetchConfig Configuration for which relationships to fetch.
     * @return A list of projects where the user is a member.
     */
    public List<Project> findByMember(Integer userId, ProjectFetchConfig fetchConfig) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em
                    .createQuery("SELECT DISTINCT p FROM Project p " + fetchConfig.buildJoinFetchClause()
                            + "JOIN p.members m WHERE m.id = :userId", Project.class)
                    .setParameter("userId", userId)
                    .getResultList();
        }
    }

    /**
     * Find all projects where a user is a member.
     * 
     * @param userId The ID of the user.
     * @return A list of projects where the user is a member.
     */
    public List<Project> findByMember(Integer userId) {
        return findByMember(userId, ProjectFetchConfig.none());
    }

    /**
     * Add a member to a project.
     * 
     * @param projectId The ID of the project.
     * @param userId    The ID of the user to add as a member.
     * @throws EntityNotFoundException if either the project or user does not exist
     */
    public void addMember(Integer projectId, Integer userId) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            Project project = em.find(Project.class, projectId);
            if (project == null) {
                throw new EntityNotFoundException("Project with id " + projectId + " not found");
            }

            User user = em.find(User.class, userId);
            if (user == null) {
                throw new EntityNotFoundException("User with id " + userId + " not found");
            }

            project.getMembers().add(user);
            em.merge(project);
            tx.commit();
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error adding member to project: " + e.getMessage(), e);
        }
    }

    /**
     * Remove a member from a project.
     * 
     * @param projectId The ID of the project.
     * @param userId    The ID of the user to remove from members.
     * @throws EntityNotFoundException if either the project or user does not exist
     */
    public void removeMember(Integer projectId, Integer userId) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            Project project = em.find(Project.class, projectId);
            if (project == null) {
                throw new EntityNotFoundException("Project with id " + projectId + " not found");
            }

            User user = em.find(User.class, userId);
            if (user == null) {
                throw new EntityNotFoundException("User with id " + userId + " not found");
            }

            project.getMembers().remove(user);
            em.merge(project);
            tx.commit();
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error removing member from project: " + e.getMessage(), e);
        }
    }

    /**
     * Overwrites the existing members of a project with a new set of members.
     * 
     * @param projectId  The ID of the project to update
     * @param newUserIds List of user IDs that will be the new members
     * @throws EntityNotFoundException if either the project or any user does not
     *                                 exist
     */
    public void updateProjectMembers(Integer projectId, List<Integer> newUserIds) {
        EntityTransaction tx = null;
        try (EntityManager em = JpaUtil.getEntityManager()) {
            tx = em.getTransaction();
            tx.begin();

            // Find the project
            Project project = em.find(Project.class, projectId);
            if (project == null) {
                throw new EntityNotFoundException("Project with id " + projectId + " not found");
            }

            Set<User> newMembers = em.createQuery("SELECT u FROM User u WHERE u.id IN :userIds", User.class)
                    .setParameter("userIds", newUserIds)
                    .getResultList()
                    .stream()
                    .collect(Collectors.toSet());
            
            project.setMembers(newMembers);

            em.merge(project);
            tx.commit();
        } catch (Exception e) {
            if (tx != null && tx.isActive()) {
                tx.rollback();
            }
            throw new PersistenceException("Error overwriting project members: " + e.getMessage(), e);
        }
    }

    public User findMemberById(Integer userId, Integer projectId) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.createQuery("SELECT u FROM User u " +
                    "JOIN u.memberOfProjects p " +
                    "WHERE u.id = :userId AND p.id = :projectId", User.class)
                    .setParameter("userId", userId)
                    .setParameter("projectId", projectId)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public List<ProjectTag> findAllTagsById(List<Integer> ids, Integer projectId) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em
                    .createQuery("SELECT t FROM ProjectTag t WHERE t.id IN :ids AND t.project.id = :projectId",
                            ProjectTag.class)
                    .setParameter("ids", ids)
                    .setParameter("projectId", projectId)
                    .getResultList();
        }
    }

    public List<User> findAllUsersById(List<Integer> ids, Integer projectId) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em.createQuery("SELECT u FROM User u " +
                    "JOIN u.memberOfProjects p " +
                    "WHERE u.id IN :ids AND p.id = :projectId", User.class)
                    .setParameter("ids", ids)
                    .setParameter("projectId", projectId)
                    .getResultList();
        }
    }

    public TaskStatus findStatusById(Integer id, Integer projectId) {
        try (EntityManager em = JpaUtil.getEntityManager()) {
            return em
                    .createQuery("SELECT s FROM TaskStatus s WHERE s.id = :id AND s.project.id = :projectId",
                            TaskStatus.class)
                    .setParameter("id", id)
                    .setParameter("projectId", projectId)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }
}
