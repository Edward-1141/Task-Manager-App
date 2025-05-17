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
check_command envsubst

# Find required directories
SECRET_DIR=$(find_dir .secrets)

if [ ! -f "$SECRET_DIR/postgresql-secret.env" ]; then
    print_status "Error: postgresql-secret.env file not found in $SECRET_DIR"
    exit 1
fi

source "$SECRET_DIR/postgresql-secret.env"

# create namespace if not exists
kubectl create namespace postgres || true

# apply pvc
kubectl apply -f postgresql/postgres-pvc.yaml

# apply deployment
export POSTGRES_PASSWORD=$DB_PASSWORD
envsubst < postgresql/postgres-deployment.yaml | kubectl apply -f -

# apply service
kubectl apply -f postgresql/postgres-service.yaml