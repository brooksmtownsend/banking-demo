variable "admin_login" {
    type = string
}

variable "admin_password" {
  type = string
}

variable "database_name" {
  type = string
}

variable "prefix" {
  type = string
}

variable "allowed_ips" {
  type = string
}

variable "kubernetes_node_size" {
  type = string
}

variable "postgres_sku" {
  type = string
}

variable "postgres_storage_mb" {
  type = number
}

variable "postgres_storage_tier" {
  type = string
}

variable "postgres_version" {
  type = string
}

variable "instances" {
  type = map(object({
      id = string,
      location = string,
      create_postgres = bool,
      create_blob_storage = bool,
      create_global_lb = bool,
  }))
}