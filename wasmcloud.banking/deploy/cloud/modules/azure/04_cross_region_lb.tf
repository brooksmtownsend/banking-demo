#
# Cross-Region Load Balancer
#
resource "azurerm_resource_group" "global" {
  for_each = { for k, v in var.instances : "global" => v if v.create_global_lb }

  name     = "${var.prefix}-global"
  location = each.value.location
}
 
resource "random_id" "dns-name" {
  byte_length = 4
}

resource "azurerm_public_ip" "cross_region" {
  name                = "${var.prefix}-cross-region"
  location            = azurerm_resource_group.global["global"].location
  resource_group_name = azurerm_resource_group.global["global"].name
  allocation_method   = "Static"
  sku                 = "Standard"
  sku_tier            = "Global"
  ddos_protection_mode = "VirtualNetworkInherited"
  domain_name_label   = "lb-global-${random_id.dns-name.hex}"
  depends_on          = [
    azurerm_resource_group.global
  ]
}

resource "azurerm_lb" "cross_region" {
  name                = "${var.prefix}-cross-region"
  location            = azurerm_resource_group.global["global"].location
  resource_group_name = azurerm_resource_group.global["global"].name
  sku                 = "Standard"
  sku_tier            = "Global"

  frontend_ip_configuration {
    name                 = "PublicIPAddress"
    public_ip_address_id = azurerm_public_ip.cross_region.id
  }
}

output "global_lb_id" {
  value = azurerm_lb.cross_region.id
}

output "global_lb_ip" {
  value = azurerm_public_ip.cross_region.ip_address
}