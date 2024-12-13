variable "deploy_service" {
   type = object({
     secrets = bool
     wadm    = bool
   })
}

variable "host_labels" {
   type = object({
     cloud   = string
     cluster = string
     region  = string
   })
}

variable "nats_creds" {
  type = object({
    leaf    = string
    secrets = string
    wadm    = string
  })
}