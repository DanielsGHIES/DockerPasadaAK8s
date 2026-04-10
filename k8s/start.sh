#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CLUSTER_NAME="taskapp"
CLUSTER_CONTEXT="kind-${CLUSTER_NAME}"

find_kubectl() {
  if command -v kubectl >/dev/null 2>&1; then
    command -v kubectl
    return
  fi

  if command -v kubectl.exe >/dev/null 2>&1; then
    command -v kubectl.exe
    return
  fi

  if [[ -x "/c/Program Files/Docker/Docker/resources/bin/kubectl.exe" ]]; then
    printf '%s\n' "/c/Program Files/Docker/Docker/resources/bin/kubectl.exe"
    return
  fi

  if [[ -x "/mnt/c/Program Files/Docker/Docker/resources/bin/kubectl.exe" ]]; then
    printf '%s\n' "/mnt/c/Program Files/Docker/Docker/resources/bin/kubectl.exe"
    return
  fi

  return 1
}

KUBECTL_BIN="$(find_kubectl || true)"

kubectl_cmd() {
  if [[ -z "${KUBECTL_BIN}" ]]; then
    echo "kubectl no esta instalado o no es accesible desde bash." >&2
    echo "Instalalo o abre una terminal donde kubectl/kubectl.exe este en PATH." >&2
    exit 1
  fi

  "${KUBECTL_BIN}" "$@"
}

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
    kind export kubeconfig --name "${CLUSTER_NAME}" >/dev/null 2>&1 || true
    kubectl_cmd config use-context "${CLUSTER_CONTEXT}" >/dev/null
  else
    kind create cluster --name "${CLUSTER_NAME}"
    kind export kubeconfig --name "${CLUSTER_NAME}" >/dev/null
    kubectl_cmd config use-context "${CLUSTER_CONTEXT}" >/dev/null
  fi

  kubectl_cmd wait --for=condition=Ready node --all --timeout=180s
}

build_images() {
  docker build -t app-backend:latest "${REPO_ROOT}/app/backend"
  docker build -t app-frontend:latest "${REPO_ROOT}/app/frontend"
  kind load docker-image --name "${CLUSTER_NAME}" app-backend:latest
  kind load docker-image --name "${CLUSTER_NAME}" app-frontend:latest
}

deploy_app() {
  kubectl_cmd apply -f "${REPO_ROOT}/k8s/manifests/postgres-deployment.yaml"
  kubectl_cmd apply -f "${REPO_ROOT}/k8s/manifests/postgres-service.yaml"
  kubectl_cmd apply -f "${REPO_ROOT}/k8s/manifests/backend-deployment.yaml"
  kubectl_cmd apply -f "${REPO_ROOT}/k8s/manifests/backend-service.yaml"
  kubectl_cmd apply -f "${REPO_ROOT}/k8s/manifests/frontend-deployment.yaml"
  kubectl_cmd apply -f "${REPO_ROOT}/k8s/manifests/frontend-service.yaml"

  kubectl_cmd rollout status deployment/taskapp-postgres --timeout=180s
  kubectl_cmd rollout status deployment/taskapp-backend --timeout=180s
  kubectl_cmd rollout status deployment/taskapp-frontend --timeout=180s
}

start_port_forward() {
  pkill -f "kubectl(.exe)? port-forward service/taskapp-frontend 8081:80" >/dev/null 2>&1 || true
  nohup "${KUBECTL_BIN}" port-forward service/taskapp-frontend 8081:80 >/tmp/taskapp-port-forward.log 2>&1 &
}

install_kind
ensure_cluster
build_images
deploy_app
start_port_forward

kubectl_cmd get pods
kubectl_cmd get services

if [[ -n "${CODESPACES:-}" ]]; then
  echo "Aplicacion disponible en el puerto reenviado 8081 de Codespaces"
else
  echo "Aplicacion disponible en http://localhost:8081"
fi
