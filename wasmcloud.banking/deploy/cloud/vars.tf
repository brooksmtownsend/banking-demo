variable "azure_sub_id" {
  type = string
}

variable "kubernetes_node_size" {
  type = string
  # 2 vCPU / 8gb / 4 data disks / 3750 iops / 75gib local storage
  default = "Standard_D2ds_v4"
}

variable "postgres_sku" {
  type = string
  default = "B_Standard_B1ms"
}

variable "postgres_storage_mb" {
  type = number
  default = 32768
}

variable "postgres_storage_tier" {
  type = string
  default = "P15"
}

variable "postgres_version" {
  type = string
  default = "16"
}

variable "postgres_user" {
  type = string
  default = "terithetardigrade"
}

variable "postgres_database" {
  type = string
  default = "demo"
}

variable "postgres_password" {
  type = string
}