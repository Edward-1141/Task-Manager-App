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

check_command helm
check_command kubectl

find_dir tma-proxy

helm upgrade --install tma-proxy ./tma-proxy || {
    print_status "Error: Failed to upgrade tma-proxy"
    exit 1
}

kubectl rollout restart deployment/tma-proxy || {
    print_status "Error: Failed to restart tma-proxy"
    exit 1
}