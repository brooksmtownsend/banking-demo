terraform {
  required_providers {
    helm = {
      source = "hashicorp/helm"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
    }
  }
}

#
# wadm
#
resource "kubernetes_secret_v1" "wadm_nats_creds" {
  count = var.deploy_service.wadm ? 1 : 0

  metadata {
    name = "wadm-nats-creds"
    namespace = "default"
  }

  data = {
    "nats.creds" = var.nats_creds.wadm
  }

  type = "Opaque"
}

resource "helm_release" "wadm" {
  count = var.deploy_service.wadm ? 1 : 0

  name       = "wadm"
  repository = "oci://ghcr.io/wasmcloud/charts"
  chart      = "wadm"
  version    = "0.2.4"
  wait       = false

  values = [
    "${file("${path.module}/files/wadm-values.yml")}"
  ]

  set {
    name = "wadm.config.nats.creds.secretName"
    value = "wadm-nats-creds"
  }

  depends_on = [ kubernetes_secret_v1.wadm_nats_creds ]
}

#
# wasmcloud-operator
#
resource "helm_release" "wasmcloud_operator" {
  provider = helm
  name = "wasmcloud-operator"

  repository = "oci://ghcr.io/wasmcloud/charts"
  chart = "wasmcloud-operator"
  version = "0.1.5"
  wait = true
}

#
# kubernetes-secrets backend
#
resource "null_resource" "generate_kubernetes_secrets_backend_seed" {
  count = var.deploy_service.secrets ? 1 : 0

  provisioner "local-exec" {
    command = "wash keys gen -o json curve | jq -r '.seed' > ${path.module}/tmp/kubernetes-secrets.seed"
  }
}

data "local_file" "kubernetes_secrets_backend_seed" {
  count = var.deploy_service.secrets ? 1 : 0

  filename = "${path.module}/tmp/kubernetes-secrets.seed"
  depends_on = [ null_resource.generate_kubernetes_secrets_backend_seed ]
}

resource "kubernetes_secret_v1" "kubernetes_secrets_nats_creds" {
  count = var.deploy_service.secrets ? 1 : 0

  metadata {
    name = "kubernetes-secrets-nats-creds"
    namespace = "default"
  }

  data = {
    "nats.creds" = var.nats_creds.secrets
  }

  type = "Opaque"
}

resource "helm_release" "kubernetes_secrets_backend" {
  count = var.deploy_service.secrets ? 1 : 0

  name     = "kubernetes-secrets"

  chart    = "./charts/secrets-kubernetes"
  version  = "0.1.0"
  wait     = true

  set {
    name  = "seed.value"
    value = data.local_file.kubernetes_secrets_backend_seed[0].content
  }

  set {
    name  = "nats.creds.secretName"
    value = kubernetes_secret_v1.kubernetes_secrets_nats_creds[0].metadata[0].name
  }

  depends_on = [ data.local_file.kubernetes_secrets_backend_seed, kubernetes_secret_v1.kubernetes_secrets_nats_creds ]
}

#
# wasmcloud-host
#
resource "kubernetes_secret_v1" "nats_leaf_creds" {
  metadata {
    name = "nats-leaf-creds"
    namespace = "default"
  }

  data = {
    "nats.creds" = var.nats_creds.leaf
  }

  type = "Opaque"
}

resource "helm_release" "wasmcloud_hosts_provider" {
  name = "wasmcloud-provider"
  namespace = "default"

  chart = "${path.module}/charts/wasmcloud-host"

  set {
    name = "labels.role"
    value = "provider"
  }

  set {
    name = "labels.cluster"
    value = var.host_labels.cluster
  }

  set {
    name = "labels.region"
    value = var.host_labels.region
  }

  set {
    name = "labels.cloud"
    value = var.host_labels.cloud
  }

  set {
    name = "replicas"
    value = "1"
  }

  set {
    name = "nats.secretName"
    value = kubernetes_secret_v1.nats_leaf_creds.metadata[0].name
  }

  depends_on = [ helm_release.wasmcloud_operator, kubernetes_secret_v1.nats_leaf_creds ]
}

resource "helm_release" "wasmcloud_hosts_component" {
  name = "wasmcloud-component"
  namespace = "default"

  chart = "${path.module}/charts/wasmcloud-host"

  set {
    name = "labels.role"
    value = "component"
  }

  set {
    name = "labels.cluster"
    value = var.host_labels.cluster
  }

  set {
    name = "labels.region"
    value = var.host_labels.region
  }

  set {
    name = "labels.cloud"
    value = var.host_labels.cloud
  }

  set {
    name = "replicas"
    value = "1"
  }

  set {
    name = "nats.secretName"
    value = kubernetes_secret_v1.nats_leaf_creds.metadata[0].name
  }

  depends_on = [ helm_release.wasmcloud_operator, kubernetes_secret_v1.nats_leaf_creds ]
}