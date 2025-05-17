#!/bin/bash

# Exit on any error
set -e

# Function to print status messages
print_status() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_status "Error: $1 is required but not installed."
        exit 1
    fi
}

# Function to find directory
find_dir() {
    local dir_name=$1
    local current_dir=$(pwd)
    local dir=""
    
    # Search for directory in current and parent directories
    while [[ "$current_dir" != "/" ]]; do
        if [[ -d "$current_dir/$dir_name" ]]; then
            dir="$current_dir/$dir_name"
            break
        fi
        current_dir=$(dirname "$current_dir")
    done
    
    if [[ -z "$dir" ]]; then
        print_status "Error: Could not find $dir_name directory"
        exit 1
    fi
    
    echo "$dir"
}

# Check required commands
check_command kubectl
check_command faas-cli

# Find required directories
SECRET_DIR=$(find_dir .secrets)
OPENFAAS_DIR=$(find_dir task-manager)
print_status "Found OpenFaaS directory at: $OPENFAAS_DIR"

# check if .env exists
if [ ! -f "$SECRET_DIR/.env" ]; then
    print_status "Error: .env file not found in $SECRET_DIR"
    exit 1
fi

source "$SECRET_DIR/.env"
export OPENFAAS_URL=$CLUSTER_MACHINE_IP:8080
PASSWORD=$(kubectl get secret -n openfaas basic-auth -o jsonpath="{.data.basic-auth-password}" | base64 --decode)
echo $PASSWORD | faas-cli login --username admin --password-stdin

# Check if postgresql-secret.env exists
if [ ! -f "$SECRET_DIR/postgresql-secret.env" ]; then
    print_status "Error: postgresql-secret.env file not found in $SECRET_DIR"
    exit 1
fi

# Source PostgreSQL environment variables
print_status "Loading PostgreSQL environment variables..."
source "$SECRET_DIR/postgresql-secret.env"

# Check if redis-secret.env exists
if [ ! -f "$SECRET_DIR/redis-secret.env" ]; then
    print_status "Error: redis-secret.env file not found in $SECRET_DIR"
    exit 1
fi

# Source Redis environment variables
print_status "Loading Redis environment variables..."
source "$SECRET_DIR/redis-secret.env"

# Source Auth environment variables
print_status "Loading Auth environment variables..."
source "$SECRET_DIR/auth-secret.env"
echo "$AUTH_SECRET_KEY" | faas-cli secret create auth-secret-key || {
    print_status "Error: Failed to create auth-secret-key secret"
    exit 1
}

# Create OpenFaaS secrets
print_status "Creating OpenFaaS secrets..."
faas-cli secret remove db-connection-string || true
DB_CONNECTION_STRING="jdbc:postgresql://postgres.default.svc.cluster.local:5432/postgres?user=$DB_USER&password=$DB_PASSWORD"
echo "$DB_CONNECTION_STRING" | faas-cli secret create db-connection-string || {
    print_status "Error: Failed to create db-connection-string secret"
    exit 1
}

faas-cli secret remove redis-password || true
echo "$REDIS_PASSWORD" | faas-cli secret create redis-password || {
    print_status "Error: Failed to create redis-password secret"
    exit 1
}

# Deploy OpenFaaS functions
print_status "Deploying OpenFaaS functions..."
cd "$OPENFAAS_DIR"
faas-cli up -f "$OPENFAAS_DIR/stack.yaml" || {
    print_status "Error: Failed to deploy OpenFaaS functions"
    exit 1
}
cd ..

print_status "OpenFaaS deployment completed successfully!"
print_status "You can check the status using: faas-cli list"
