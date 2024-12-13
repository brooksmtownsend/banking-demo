locals {
  instances = {
    primary = {
      id                  = "primary"
      location            = "eastus"
      create_postgres     = true,
      create_blob_storage = true,
      create_global_lb    = false,
    }
    secondary = {
      id                  = "secondary",
      location            = "eastus2"
      create_postgres     = false,
      create_blob_storage = false,
      create_global_lb    = true,
    }
  }

  prefix = "wasmcloud-space"

  postgres = {
    username = var.postgres_user
    password = var.postgres_password
    database = var.postgres_database
  }
}

module "what_is_my_ip" {
  source = "./modules/what_is_my_ip"
}

module "nats_hierarchy" {
  source = "./modules/nats_hierarchy"
}

module "azure" {
  instances = local.instances
  prefix    = local.prefix

  admin_login    = local.postgres.username
  admin_password = local.postgres.password
  database_name  = local.postgres.database

  allowed_ips = module.what_is_my_ip.ip

  kubernetes_node_size = var.kubernetes_node_size

  postgres_sku          = var.postgres_sku
  postgres_storage_mb   = var.postgres_storage_mb
  postgres_storage_tier = var.postgres_storage_tier
  postgres_version      = var.postgres_version

  depends_on = [module.what_is_my_ip]

  source = "./modules/azure"
}

module "nats_cluster_primary" {
  cluster_name    = "primary"
  kubeconfig_path = module.azure.kubeconfig["primary"]
  operator_jwt    = module.nats_hierarchy.operator_jwt
  sys_account_id  = module.nats_hierarchy.sys_account_id
  sys_account_jwt = module.nats_hierarchy.sys_account_jwt

  depends_on = [module.azure]

  source = "./modules/nats_cluster"
  providers = {
    helm = helm.primary
  }
}

module "nats_cluster_secondary" {
  cluster_name    = "secondary"
  kubeconfig_path = module.azure.kubeconfig["secondary"]
  operator_jwt    = module.nats_hierarchy.operator_jwt
  sys_account_id  = module.nats_hierarchy.sys_account_id
  sys_account_jwt = module.nats_hierarchy.sys_account_jwt

  depends_on = [module.azure]

  source = "./modules/nats_cluster"
  providers = {
    helm = helm.secondary
  }
}

module "skupper_link" {
  kubeconfig_paths = module.azure.kubeconfig

  depends_on = [module.nats_cluster_primary, module.nats_cluster_secondary]

  source = "./modules/skupper_link"
}

module "wasmcloud_primary" {
  source = "./modules/wasmcloud"

  nats_creds = {
    leaf    = module.nats_hierarchy.creds.leaf,
    secrets = module.nats_hierarchy.creds.secrets,
    wadm    = module.nats_hierarchy.creds.wadm,
  }

  deploy_service = {
    secrets = true,
    wadm    = true,
  }

  host_labels = {
    cloud   = "azure"
    cluster = "primary"
    region  = "east-us"
  }

  depends_on = [module.nats_cluster_primary]

  providers = {
    helm       = helm.primary
    kubernetes = kubernetes.primary
  }
}

module "wasmcloud_secondary" {
  source = "./modules/wasmcloud"

  nats_creds = {
    leaf    = module.nats_hierarchy.creds.leaf,
    secrets = module.nats_hierarchy.creds.secrets,
    wadm    = module.nats_hierarchy.creds.wadm,
  }

  deploy_service = {
    secrets = false,
    wadm    = false,
  }

  host_labels = {
    cloud   = "azure"
    cluster = "secondary"
    region  = "east-us2"
  }

  depends_on = [module.nats_cluster_secondary]

  providers = {
    helm       = helm.secondary
    kubernetes = kubernetes.secondary
  }
}


module "app_primary" {
  source = "./modules/app"

  instance = "primary"

  global_lb_ip = module.azure.global_lb_ip

  kubeconfig_path = module.azure.kubeconfig["primary"]

  setup = {
    app      = true,
    ollama   = true,
    postgres = true,
  }

  postgres_config = {
    host     = module.azure.postgres_fqdn,
    port     = "5432",
    database = local.postgres.database,
    user     = local.postgres.username,
    password = local.postgres.password,
  }

  storage_access_key = module.azure.storage_access_key["primary"]

  depends_on = [module.azure, module.wasmcloud_primary]

  providers = {
    helm       = helm.primary
    kubernetes = kubernetes.primary
  }
}

module "app_secondary" {
  source = "./modules/app"

  instance = "secondary"

  global_lb_ip = module.azure.global_lb_ip

  kubeconfig_path = module.azure.kubeconfig["secondary"]

  setup = {
    app      = false,
    ollama   = true,
    postgres = false,
  }

  postgres_config = {
    host     = "",
    port     = "",
    database = "",
    user     = "",
    password = "",
  }

  storage_access_key = module.azure.storage_access_key["secondary"]

  depends_on = [module.azure, module.wasmcloud_secondary]

  providers = {
    helm       = helm.secondary
    kubernetes = kubernetes.secondary
  }
}

module "expose_http" {
  source = "./modules/expose_http"

  instances = local.instances
  prefix    = local.prefix

  service_uids = tomap({
    primary   = module.app_primary.service_uid
    secondary = module.app_secondary.service_uid
  })

  depends_on = [module.azure, module.app_primary, module.app_secondary]
}

output "global_loadbalancer_ip" {
  value = module.azure.global_lb_ip
}

output "postgres_host" {
  value = module.azure.postgres_fqdn
}

output "postgres_port" {
  value = "5432"
}

output "postgres_user" {
  value = var.postgres_user
}

output "postgres_database" {
  value = var.postgres_database
}

output "storage_account_name" {
  value = module.azure.storage_account_name
}