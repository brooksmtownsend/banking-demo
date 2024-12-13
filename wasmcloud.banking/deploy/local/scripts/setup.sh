#!/usr/bin/env bash

check_prereq () {
    local tool_exists=$(command -v ${1} 2>/dev/null)
    if [[ -z "${tool_exists}" ]]; then
        echo "You are missing '${1}' binary, which can be installed following:"
        echo ""
        echo "${2}"
        echo ""
        exit 1
    fi
}

# Make sure we have pre-requisites to run the script
check_prereq "nsc" "https://github.com/nats-io/nsc"
check_prereq "kubectl" "https://kubernetes.io/docs/tasks/tools/#kubectl"
check_prereq "helm" "https://helm.sh/docs/intro/install/#helm"
check_prereq "wash" "https://wasmcloud.com/docs/installation"
check_prereq "jq" "https://jqlang.github.io/jq/download/"

current_context=$(kubectl config current-context 2>/dev/null | tr -d '\n' )
if [[ ! -n "${SKIP_KIND}" && (-z "${current_context}" || "${current_context}" != "kind-kind" )]]; then
    echo "It is recommended to run this script against kind, but it looks like you are not currently configured to talk to kind, your kubectl currently points to: '${current_context}'"
    echo ""
    echo "1. Start a kind cluster with:"
    echo ""
    echo "   kind create cluster"
    echo ""
    echo ""
    echo "2. Switch to the already running cluster with:"
    echo ""
    echo "   kubectl config use-context kind-kind"
    echo ""
    echo ""
    echo "3. If you would prefer to not use kind, you can set SKIP_KIND=1 and run the script again"
    echo "   SKIP_KIND=1 ${0}"
    echo ""
    exit 1
fi

#
# NATS
#
nats_repo=$(helm repo list | grep 'https://nats-io.github.io/k8s/helm/charts/')
if [[ ! -n "${nats_repo}" ]]; then
    helm repo add nats https://nats-io.github.io/k8s/helm/charts/
fi

echo ""
echo "Deploying NATS:"
echo ""

helm install nats -f helm/values/nats.yaml --version 1.2.0 nats/nats

echo ""
# Wait for NATS to become ready
kubectl rollout status deploy,sts -l app.kubernetes.io/instance=nats

#
# wadm
#

echo ""
echo "Deploying wadm:"
echo ""

helm install wadm -f helm/values/wadm.yaml --version 0.2.4 oci://ghcr.io/wasmcloud/charts/wadm

echo ""
# Wait for wadm to become ready
kubectl rollout status deploy -l app.kubernetes.io/instance=wadm

#
# Kubernetes Secrets backend
#

# Generate a seed to be passed into the kubernetes secrets backend
mkdir -p ./outputs

wash_keys_gen=$(wash keys gen curve -o json)

if [[ ! -e "./outputs/kubernetes-secrets.seed" ]]; then
    echo $wash_keys_gen | jq -Mr '.seed' | tr -d '\n' > ./outputs/kubernetes-secrets.seed
fi
if [[ ! -e "./outputs/postgres-password.txt" ]]; then
    echo $wash_keys_gen | jq -Mr '.public_key' | tr -d '\n' > ./outputs/postgres-password.txt
fi

echo ""
echo "Deploying kubernetes-secrets backend:"
echo ""

helm install kubernetes-secrets --set-file=seed.value=./outputs/kubernetes-secrets.seed ./helm/charts/secrets-kubernetes

echo ""
# Wait for kubernetes-secrets to become ready
kubectl rollout status deploy -l app.kubernetes.io/instance=kubernetes-secrets

#
# wasmcloud-host
#

echo ""
echo "Deploying kubernetes-secrets backend:"
echo ""

# TODO: switch to upstream chart once the fix from https://github.com/wasmCloud/wasmCloud/pull/2891 ships:
# https://github.com/wasmCloud/wasmCloud/pkgs/container/charts%2Fwasmcloud-host
# helm install components -f helm/values/host-components.yaml --version 0.8.1 oci://ghcr.io/wasmcloud/charts/wasmcloud-host
# helm install providers -f helm/values/host-providers.yaml --version 0.8.1 oci://ghcr.io/wasmcloud/charts/wasmcloud-host

helm install components -f helm/values/host-components.yaml ./helm/charts/wasmcloud-host
helm install providers -f helm/values/host-providers.yaml ./helm/charts/wasmcloud-host

echo ""
# Wait for wasmcloud-hosts to become ready
kubectl rollout status deploy -l app.kubernetes.io/instance=components
kubectl rollout status deploy -l app.kubernetes.io/instance=providers

#
# ollama
#

echo ""
echo "Deploying ollama:"
echo ""

helm install ollama ./helm/charts/ollama

echo ""
# Wait for ollama to become ready
kubectl rollout status deploy -l app.kubernetes.io/instance=ollama

#
# Install postgres
#

echo ""
echo "Deploying postgres:"
echo ""

helm install postgres -f helm/values/postgres.yaml --set-file=global.postgresql.auth.password=./outputs/postgres-password.txt --version 15.5.26 oci://registry-1.docker.io/bitnamicharts/postgresql

echo ""
# Wait for postgres to become ready
kubectl rollout status sts -l app.kubernetes.io/instance=postgres

#
# Preload postgres with appropriate config
#

echo ""
echo "Preloading postgres with application dependencies:"
echo ""

helm install setup-postgres ./helm/charts/setup-postgres

echo ""
# Wait for setup job to complete
kubectl wait --for=condition=complete --timeout=60s job/setup-postgres

if [[ ! "$(lsof -i :4242)" ]]; then
    kubectl port-forward svc/nats 4242:4222 > /dev/null 2>&1 &
    kubectl_port_forward_pid=$!
    trap '{
        kill $kubectl_port_forward_pid
    }' EXIT

    i=0
    until [[ $i -eq 15 ]]
    do
        if [[ "$(lsof -i :4242)" ]]; then
            break
        fi
        sleep 1
        ((i++))
    done

    WASMCLOUD_CTL_PORT=4242 wash app deploy wadm.yaml
else
    echo ""
    echo "Something is already listening on port 4242, please stop that process and then run:"
    echo ""
    echo "kubectl port-forward svc/nats 4222 &"
    echo "wash -p 4242 app deploy wadm.yaml"
    echo ""
fi

echo ""
echo ""
echo ""
echo "You are now ready to access the wasmcloud application by running:"
echo ""
echo "  kubectl port-forward \$(kubectl get pod -l app.kubernetes.io/instance=providers,app.kubernetes.io/name=wasmcloud-host -o jsonpath='{.items[0].metadata.name}') 8080"
echo ""
echo "Then open up a browser to localhost:8080"
echo ""