#!/bin/bash

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

SECRET_DIR=$(find_dir .secrets)

if [ ! -f "$SECRET_DIR/.env" ]; then
    print_status "Error: .env file not found in $SECRET_DIR"
    exit 1
fi

# Local Cluster IP
source .secrets/.env

find_dir tma-frontend

check_command docker
check_command kubectl

# Build with embedded API URL
docker build \
  --build-arg NEXT_PUBLIC_API_URL="${CLUSTER_MACHINE_IP}:5051" \
  -t edward1141/tma-frontend-app:latest ./tma-frontend

# push to docker hub
docker push edward1141/tma-frontend-app:latest

# Apply Kubernetes manifests
kubectl apply -f tma-frontend/deployment/

# Optional: Restart pods if already running
kubectl rollout restart deployment/tma-frontend || {
    print_status "Error: Failed to restart tma-frontend"
    exit 1
}

echo "Deployment of frontend complete"