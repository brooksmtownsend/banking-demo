variable "instances" {
  type = map(object({
      id = string,
      location = string,
  }))
}

variable "prefix" {
  type = string
}

variable "service_uids" {
  type = map(string)
}