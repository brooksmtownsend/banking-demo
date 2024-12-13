resource "random_id" "postgres-suffix" {
  byte_length = 4
}

resource "azurerm_postgresql_flexible_server" "this" {
  for_each = { for k, v in var.instances : k => v if v.create_postgres }

  name                = "${var.prefix}-${random_id.postgres-suffix.hex}"
  location            = each.value.location
  resource_group_name = azurerm_kubernetes_cluster.this[each.value.id].name

  public_network_access_enabled = true

  version                = var.postgres_version
  administrator_login    = var.admin_login
  administrator_password = var.admin_password

  sku_name     = var.postgres_sku
  storage_mb   = var.postgres_storage_mb
  storage_tier = var.postgres_storage_tier

  lifecycle {
    ignore_changes = [
      zone,
      high_availability
    ]
  }
}

# In order to enable the uuid-ossp extension, we need to tell the server to allow it via azure.extensions
resource "azurerm_postgresql_flexible_server_configuration" "this" {
  for_each = azurerm_postgresql_flexible_server.this

  name      = "azure.extensions"
  server_id = each.value.id
  value     = "UUID-OSSP"

  depends_on = [ azurerm_postgresql_flexible_server.this ]
}

resource "azurerm_postgresql_flexible_server_database" "this" {
  for_each = azurerm_postgresql_flexible_server.this

  name      = var.database_name 
  server_id = each.value.id
  collation = "en_US.utf8"
  charset   = "utf8"

  depends_on = [ azurerm_postgresql_flexible_server.this ]
}


resource "azurerm_postgresql_flexible_server_firewall_rule" "inbound-aks" {
  for_each = data.azurerm_public_ip.outbound_ip

  name             = "inbound-from-aks-${each.key}"
  server_id        = azurerm_postgresql_flexible_server.this["primary"].id
  start_ip_address = each.value.ip_address
  end_ip_address   = each.value.ip_address

  depends_on = [ azurerm_postgresql_flexible_server.this, azurerm_kubernetes_cluster.this ]
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "inbound-external" {
  name             = "inbound-from-external"
  server_id        = azurerm_postgresql_flexible_server.this["primary"].id
  start_ip_address = var.allowed_ips
  end_ip_address   = var.allowed_ips

  depends_on = [ azurerm_postgresql_flexible_server.this ]
}

output "postgres_fqdn" {
  value = azurerm_postgresql_flexible_server.this["primary"].fqdn
}