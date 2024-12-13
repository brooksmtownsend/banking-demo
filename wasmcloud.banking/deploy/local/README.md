# wasmCloud.space running on a local Kubernetes cluster:

## Pre-requisites:

* Kubernetes cluster (prefer [kind](https://kind.sigs.k8s.io/docs/user/quick-start#installation))
* [nsc](https://github.com/nats-io/nsc)
* [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
* [helm](https://helm.sh/docs/intro/install/#helm)
* [wash](https://wasmcloud.com/docs/installation)

## Quickstart:

```shell
kind create cluster

./scripts/setup.sh

kubectl port-forward deploy/providers-wasmcloud-host 8080

# ...

./scripts/teardown.sh

kind delete cluster
```