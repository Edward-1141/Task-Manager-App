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
check_command helm

# Find required directories
REDIS_DIR=$(find_dir redis)
print_status "Found Redis directory at: $REDIS_DIR"
SECRET_DIR=$(find_dir .secrets)
print_status "Found secrets directory at: $SECRET_DIR"

# Check if redis-secret.env exists
if [ ! -f "$SECRET_DIR/redis-secret.env" ]; then
    print_status "Error: redis-secret.env file not found in $SECRET_DIR"
    exit 1
fi

# Check if redis-values.yaml exists
if [ ! -f "$REDIS_DIR/redis-values.yaml" ]; then
    print_status "Error: redis-values.yaml file not found in $REDIS_DIR"
    exit 1
fi

print_status "Creating Redis password secret..."
kubectl create secret generic redis-password --from-env-file="$SECRET_DIR/redis-secret.env" --dry-run=client -o yaml | kubectl apply -f - || {
    print_status "Error: Failed to create/update Redis password secret"
    exit 1
}

print_status "Deploying Redis using Helm..."
helm upgrade --install redis bitnami/redis --values "$REDIS_DIR/redis-values.yaml" || {
    print_status "Error: Failed to deploy Redis"
    exit 1
}

print_status "Waiting for Redis pods to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redis --timeout=300s || {
    print_status "Error: Redis pods failed to become ready within timeout"
    exit 1
}

print_status "Redis deployment completed successfully!"
print_status "You can check the status using: kubectl get pods -l app.kubernetes.io/name=redis"