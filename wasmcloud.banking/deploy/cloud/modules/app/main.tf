
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
# ollama
#
resource "helm_release" "ollama" {
  count = var.setup.ollama ? 1 : 0

  name      = "ollama"
  namespace = "default"

  chart = "${path.module}/charts/ollama"
}

#
# setup-postgres
#
resource "kubernetes_secret_v1" "postgres_access" {
  metadata {
    name      = "postgres-access"
    namespace = "default"
  }

  data = {
    "postgres-host"     = var.postgres_config.host
    "postgres-port"     = var.postgres_config.port
    "postgres-database" = var.postgres_config.database
    "postgres-user"     = var.postgres_config.user
    "postgres-password" = var.postgres_config.password
    "postgres-ssl-mode" = "require"
  }

  type = "Opaque"
}

resource "null_resource" "copy_tasks_sql" {
  count = var.setup.postgres ? 1 : 0

  provisioner "local-exec" {
    command = "git rev-parse --show-toplevel | xargs -I{} find {} -name 'tasks.sql' | xargs cat > ${path.module}/tmp/tasks.sql"
  }
}

data "local_file" "tasks_sql" {
  count = var.setup.postgres ? 1 : 0

  filename = "${path.module}/tmp/tasks.sql"

  depends_on = [null_resource.copy_tasks_sql]
}

resource "kubernetes_config_map_v1" "tasks_sql" {
  count = var.setup.postgres ? 1 : 0

  metadata {
    name      = "tasks-sql"
    namespace = "default"
  }

  data = {
    "tasks.sql" = data.local_file.tasks_sql[0].content
  }

  depends_on = [data.local_file.tasks_sql]
}

resource "helm_release" "setup_postgres" {
  count = var.setup.postgres ? 1 : 0

  name      = "setup-postgres"
  namespace = "default"

  chart = "${path.module}/charts/setup-postgres"
}

#
# Storage account secret
#
resource "kubernetes_secret_v1" "azure_creds" {
  metadata {
    name      = "azure-creds"
    namespace = "default"
  }

  data = {
    "storage-access-key" = var.storage_access_key
  }

  type = "Opaque"
}

#
# External HTTP access
#
resource "kubernetes_service_v1" "http_router" {
  metadata {
    name = "http-router"
    namespace = "default"

    annotations = {
      "service.beta.kubernetes.io/azure-additional-public-ips" = var.global_lb_ip
    }
  }
  spec {
    selector = {
      "host-label.k8s.wasmcloud.dev/workload" = "provider"
    }

    port {
      port = 80
      target_port = 8080
      protocol = "TCP"
    }

    type = "LoadBalancer"
  }
}

// Give the loadbalancer service entry chance to register
resource "time_sleep" "wait" {
  create_duration = "15s"

  depends_on = [ kubernetes_service_v1.http_router ]
}

resource "null_resource" "wait" {
  depends_on = [ time_sleep.wait ]
}

data "kubernetes_service_v1" "http_router" {
  metadata {
    name = "http-router"
    namespace = "default"
  }

  depends_on = [ null_resource.wait ]
}

resource "null_resource" "extract_service_uid" {
  provisioner "local-exec" {
    command = "${path.module}/scripts/extract-service-uid.sh"
    environment = {
      "KUBECONFIG" = var.kubeconfig_path
      "OUTPUT_PATH" = "${path.module}/tmp/service-uid-${var.instance}"
    }
  }
}

data "local_file" "service_uid" {
  filename = "${path.module}/tmp/service-uid-${var.instance}"

  depends_on = [ null_resource.extract_service_uid ]
}

output "service_uid" {
  value = data.local_file.service_uid.content
}

#
# wash app deploy
#
resource "random_integer" "random_port" {
  min = 30000
  max = 60000
}

resource "null_resource" "deploy" {
  count = var.setup.app ? 1 : 0

  provisioner "local-exec" {
    command = "${path.module}/scripts/deploy-app.sh"
    environment = {
      "KUBECONFIG" = var.kubeconfig_path
      "LOCAL_PORT" = random_integer.random_port.result
      "WASH_CTL_CREDS" = "${path.root}/outputs/nsc/creds/WASMCLOUD/DEMO/edge.creds"
      "WADM_MANIFEST_PATH" = abspath("${path.root}/../../wadm.remote.yaml")
    }
  }
}