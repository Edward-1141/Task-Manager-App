# Postgresql notes

## Install client

```bash
sudo apt update && sudo apt install postgresql-client
```

## Connect to database

You will need to set up the database following the schema below.

```bash
psql "postgresql://<username>:<password>@<host>:<port>/<database>"
```

For instance, if you are using the default values for deployment, you can connect to the database with the following command:

```bash
kubectl port-forward svc/postgres 5432:5432
psql "postgresql://postgres:postgres@localhost:5432/postgres"
```

## Main tables

```sql
CREATE TABLE tasks (
    id SERIAL,
    project_id SERIAL REFERENCES projects(id) ON DELETE CASCADE,
    created_by SERIAL REFERENCES users(id),
    task_name VARCHAR(255) NOT NULL,
    content TEXT,
    start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status_id INTEGER REFERENCES task_statuses(id) ON DELETE RESTRICT,
    priority INTEGER,
    PRIMARY KEY (id)
);

CREATE TABLE users (
    id SERIAL,
    email TEXT UNIQUE NOT NULL,
    user_name TEXT NOT NULL,
    password TEXT NOT NULL, -- for simplicity at the moment
    -- password_hash TEXT NOT NULL,
    -- salt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE projects (
    id SERIAL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by SERIAL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id)
);
```

## Project members table

```sql
CREATE TABLE project_members (
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)  -- Composite primary key
);
```

## Task assignments table

```sql
CREATE TABLE task_assignments (
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, user_id)  -- Composite primary key
);
```

## Project-specific statuses table

```sql
CREATE TABLE task_statuses (
    id SERIAL,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    status_name VARCHAR(50) NOT NULL,
    status_order INTEGER NOT NULL,
    description TEXT,
    color VARCHAR(7),  -- For UI color representation (e.g., '#FF0000')
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id),
    UNIQUE(project_id, status_name)
);
```

## Project-specific tags table

```sql
CREATE TABLE project_tags (
    id SERIAL,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    color VARCHAR(7),  -- For UI color representation (e.g., '#FF0000')
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id),
    UNIQUE(project_id, tag_name)
);
```

## Task tags junction table

```sql
CREATE TABLE task_tags (
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES project_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);
```

## Indexes

```sql
-- Search for tasks by project id
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- Search for project members by user id
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
```

## Function to update updated_at timestamp (TODO: add this if wanted)
