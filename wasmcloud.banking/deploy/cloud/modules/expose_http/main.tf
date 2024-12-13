data "azurerm_resource_group" "global" {
  name = "${var.prefix}-global"
}

data "azurerm_lb" "cross_region" {
  name = "${var.prefix}-cross-region"
  resource_group_name = data.azurerm_resource_group.global.name
}

data "azurerm_resource_group" "managed" {
  for_each = var.instances

  name = "mc_${var.prefix}-${each.value.id}_${var.prefix}-${each.value.id}_${each.value.location}"
}

data "azurerm_lb" "managed" {
  for_each = var.instances

  name                = "kubernetes"
  resource_group_name = data.azurerm_resource_group.managed[each.value.id].name
}

resource "azurerm_lb_backend_address_pool" "cross_region" {
  loadbalancer_id = data.azurerm_lb.cross_region.id
  name            = "BackEndAddressPool"
}

resource "azurerm_lb_backend_address_pool_address" "cross_region" {
  for_each                            = var.instances

  name                                = "regional-lb-${each.value.id}"
  backend_address_pool_id             = azurerm_lb_backend_address_pool.cross_region.id
  backend_address_ip_configuration_id = format("%s/frontendIPConfigurations/%s", data.azurerm_lb.managed[each.value.id].id, var.service_uids[each.value.id])
}

resource "azurerm_lb_rule" "cross_region" {
  loadbalancer_id                = data.azurerm_lb.cross_region.id
  name                           = "LBRule"
  protocol                       = "Tcp"
  frontend_port                  = 80
  backend_port                   = 80
  enable_floating_ip             = true
  frontend_ip_configuration_name = data.azurerm_lb.cross_region.frontend_ip_configuration[0].name
  backend_address_pool_ids       = [
    azurerm_lb_backend_address_pool.cross_region.id
  ]
}