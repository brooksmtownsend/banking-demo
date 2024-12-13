resource "azurerm_kubernetes_cluster" "this" {
  for_each = var.instances

  name                = "${var.prefix}-${each.value["id"]}"
  location            = each.value["location"]
  resource_group_name = azurerm_resource_group.this[each.value["id"]].name
  dns_prefix          = each.value["id"]

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = var.kubernetes_node_size

    # These are the default settings, they are set here so that terraform doesn't keep trying to change them.
    upgrade_settings {
      drain_timeout_in_minutes      = 0
      max_surge                     = "10%"
      node_soak_duration_in_minutes = 0
    }
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "${var.prefix}-${each.value["id"]}"
  }
}

resource "local_file" "kubeconfig" {
  for_each = var.instances

  content         = azurerm_kubernetes_cluster.this[each.value.id].kube_config_raw
  filename        = "${path.root}/kubeconfig_${each.value["id"]}"
  file_permission = "0700"

  depends_on = [azurerm_kubernetes_cluster.this]
}

// Used for outputs
data "local_file" "kubeconfig" {
  for_each = local_file.kubeconfig

  filename = each.value.filename

  depends_on = [local_file.kubeconfig]
}

data "azurerm_public_ip" "outbound_ip" {
  for_each = azurerm_kubernetes_cluster.this

  name                = split("/", tolist(each.value.network_profile[0].load_balancer_profile[0].effective_outbound_ips)[0])[8]
  resource_group_name = split("/", tolist(each.value.network_profile[0].load_balancer_profile[0].effective_outbound_ips)[0])[4]

  depends_on = [azurerm_kubernetes_cluster.this]
}

output "kubeconfig" {
  value = {
    for k, cluster in azurerm_kubernetes_cluster.this : k => local_file.kubeconfig[k].filename
  }
}

// output "kubeconfig_path" {
//   value = data.local_file.kubeconfig.filename
// }
// 
// output "outbound_ip" {
//   value = data.azurerm_public_ip.outbound_ip.ip_address
// }
