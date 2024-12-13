# Deploying wasmcloud.space demo on Azure

## Pre-requisites:

* [Azure account for the Azure provider][azure-provider]
* [nsc](https://github.com/nats-io/nsc)
* [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
* [helm](https://helm.sh/docs/intro/install/#helm)
* [wash](https://wasmcloud.com/docs/installation)
* [Authenticating with ghcr.io][docker-login-ghcr]

[azure-provider]: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs#authenticating-to-azure
[docker-login-ghcr]: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-with-a-personal-access-token-classic

## Quickstart

```shell
TF_VAR_azure_sub_id=<your-azure-subscription-id> terraform apply

# Wait for terraform to provision everything

# In a separate window, start a port-forward into the cluster:
KUBECONFIG=kubeconfig_primary kubectl port-forward svc/nats 4222

# Provide configuration for the postgres provider:
WASH_CTL_CREDS=outputs/nsc/creds/WASMCLOUD/DEMO/edge.creds wash config put pg-task-db \
POSTGRES_HOST=$(terraform output --raw postgres_host) \
POSTGRES_PORT=$(terraform output --raw postgres_port) \
POSTGRES_USERNAME=$(terraform output --raw postgres_user) \
POSTGRES_DATABASE=$(terraform output --raw postgres_database) \
POSTGRES_TLS_REQUIRED=true

# Provide configuration for the blobstore provider:
WASH_CTL_CREDS=outputs/nsc/creds/WASMCLOUD/DEMO/edge.creds wash config put blobstore-config \
STORAGE_ACCOUNT=$(terraform output --raw storage_account_name)
```