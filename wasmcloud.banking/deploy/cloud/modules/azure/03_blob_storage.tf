#
# Azure blob storage
#
resource "random_id" "bucket-suffix" {
  byte_length = 4
}

resource "azurerm_storage_account" "this" {
  for_each = { for k, v in var.instances : k => v if v.create_blob_storage }

  name                = format("%s%s", replace(var.prefix, "-", ""), random_id.bucket-suffix.hex)

  resource_group_name = azurerm_resource_group.this[each.value.id].name
  location            = azurerm_resource_group.this[each.value.id].location

  account_kind        = "BlobStorage"
  account_tier        = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "wasmcloud_space" {
  for_each = { for k, v in var.instances : k => v if v.create_blob_storage }

  name                  = replace(var.prefix, "-", "")
  storage_account_name  = azurerm_storage_account.this[each.value.id].name
  container_access_type = "blob"
}

output "storage_account_name" {
  value = azurerm_storage_account.this["primary"].name
}

output "storage_access_key" {
  value = {
    "primary" = azurerm_storage_account.this["primary"].primary_access_key
    "secondary" = azurerm_storage_account.this["primary"].secondary_access_key
  }
}