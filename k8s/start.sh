#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CLUSTER_NAME="taskapp"
CLUSTER_CONTEXT="kind-${CLUSTER_NAME}"

install_kind() {
  if command -v kind >/dev/null 2>&1; then
    return
  fi

  curl -Lo /tmp/kind https://kind.sigs.k8s.io/dl/v0.29.0/kind-linux-amd64
  chmod +x /tmp/kind
  sudo mv /tmp/kind /usr/local/bin/kind
}

ensure_cluster() {
  if kind get clusters 2>/dev/null | grep -qx "${CLUSTER_NAME}"; then
    kubectl config use-context "${CLUSTER_CONTEXT}" >/dev/null
  else
    kind create cluster --name "${CLUSTER_NAME}"
  fi

  kubectl wait --for=condition=Ready node --all --timeout=180s
}

build_images() {
  docker build -t app-backend:latest "${REPO_ROOT}/app/backend"
  docker build -t app-frontend:latest "${REPO_ROOT}/app/frontend"
  kind load docker-image --name "${CLUSTER_NAME}" app-backend:latest
  kind load docker-image --name "${CLUSTER_NAME}" app-frontend:latest
}

deploy_app() {
  kubectl apply -f "${REPO_ROOT}/k8s/manifests/postgres-deployment.yaml"
  kubectl apply -f "${REPO_ROOT}/k8s/manifests/postgres-service.yaml"
  kubectl apply -f "${REPO_ROOT}/k8s/manifests/backend-deployment.yaml"
  kubectl apply -f "${REPO_ROOT}/k8s/manifests/backend-service.yaml"
  kubectl apply -f "${REPO_ROOT}/k8s/manifests/frontend-deployment.yaml"
  kubectl apply -f "${REPO_ROOT}/k8s/manifests/frontend-service.yaml"

  kubectl rollout status deployment/taskapp-postgres --timeout=180s
  kubectl rollout status deployment/taskapp-backend --timeout=180s
  kubectl rollout status deployment/taskapp-frontend --timeout=180s
}

start_codespaces_port_forward() {
  if [[ -z "${CODESPACES:-}" ]]; then
    return
  fi

  pkill -f "kubectl port-forward service/taskapp-frontend 8081:80" >/dev/null 2>&1 || true
  nohup kubectl port-forward service/taskapp-frontend 8081:80 >/tmp/taskapp-port-forward.log 2>&1 &
}

install_kind
ensure_cluster
build_images
deploy_app
start_codespaces_port_forward

kubectl get pods
kubectl get services

if [[ -n "${CODESPACES:-}" ]]; then
  echo "Aplicacion disponible en el puerto reenviado 8081 de Codespaces"
else
  echo "Aplicacion disponible en http://localhost:30080"
fi
