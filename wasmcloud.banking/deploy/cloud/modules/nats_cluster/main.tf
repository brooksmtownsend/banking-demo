terraform {
  required_providers {
    helm = {
      source = "hashicorp/helm"
    }
  }
}

resource "helm_release" "nats" {
  name      = "nats-${var.cluster_name}"
  namespace = "default"

  repository = "https://nats-io.github.io/k8s/helm/charts/"
  chart      = "nats"
  version    = "1.2.2"

  wait = false

  values = [
    "${templatefile("${path.module}/templates/nats-values.yml.tftpl", {
      cluster_name = "nats-${var.cluster_name}",
      operator_jwt = var.operator_jwt,
      sys_account_id = var.sys_account_id,
      sys_account_jwt = var.sys_account_jwt
    })}",
  ]
}

resource "random_integer" "random_port" {
  min = 30000
  max = 60000
  keepers = {
    # Generate a new integer each time we switch to a new listener ARN
    cluster = var.cluster_name
  }
}

# Push accounts
resource "null_resource" "push-accounts" {
  provisioner "local-exec" {
    command = "${path.module}/scripts/push-accounts.sh"
    environment = {
      "KUBECONFIG" = var.kubeconfig_path
      "CLUSTER" = random_integer.random_port.keepers.cluster,
      "LOCAL_PORT" = random_integer.random_port.result
    }
  }
}