locals {
  prefix = "wasmcloud-space"
}

resource "azurerm_resource_group" "this" {
  for_each = var.instances

  name     = "${local.prefix}-${each.key}"
  location = each.value.location
}
