variable "global_lb_ip" {
  type = string
}

variable "instance" {
  type = string
}

variable "kubeconfig_path" {
  type    = string
  default = "value-not-set"
}

variable "postgres_config" {
  type = object({
    host     = string
    port     = string
    database = string
    user     = string
    password = string
  })
}

variable "setup" {
  type = object({
    app      = bool
    ollama   = bool
    postgres = bool
  })
}

variable "storage_access_key" {
  type = string
}
