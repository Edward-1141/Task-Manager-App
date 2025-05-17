# Task Manager

## Overview

Simple notes for development with OpenFaas and Java.

## OpenFaas Template

This project is built with a custom template.

```bash
# Pull the template
faas-cli template pull https://github.com/Edward-1141/openfaas-templates

# Create a new function
faas-cli new <function-name> --lang tmajava21 --append stack.yaml
```

## Set the secrets

```bash
# Create a secret
echo "<secret-value>" | faas-cli secret create <secret-name>

# Example
echo "xxxx" | faas-cli secret create db-connection-string
```

## Build and Deploy the function

```bash
# Build the function
faas-cli build -f stack.yaml

# Push the function (push the docker image)
faas-cli push -f stack.yaml

# Deploy the function
faas-cli deploy -f stack.yaml
```

``` bash
# Or use up to build, push and deploy the function
faas-cli up -f stack.yaml
```

## Test the function

```bash
# Test the function
curl -X POST http://127.0.0.1:8080/function/<function-name>

# Example
curl -X POST http://127.0.0.1:8080/function/test-function
```
