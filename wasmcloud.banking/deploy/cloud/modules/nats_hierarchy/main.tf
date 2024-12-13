resource "null_resource" "generate_operator" {
  provisioner "local-exec" {
    command = "${path.module}/scripts/generate-operator.sh"
  }
}

resource "null_resource" "generate_account_hierarchy" {
  provisioner "local-exec" {
    command = "${path.module}/scripts/generate-account-hierarchy.sh"
  }

  depends_on = [ null_resource.generate_operator ]
}

data "local_file" "nats_conf" {
  filename = "${path.root}/outputs/nsc/nats.conf"
  depends_on = [ null_resource.generate_operator ]
}

locals {
  file_lines = split("\n", data.local_file.nats_conf.content)

  operator_line = tolist([
    for line in local.file_lines : line
    if startswith(line, "operator:")
  ])
  operator_jwt = one([
    for line in local.operator_line :
    replace(line, "/operator: /", "")
  ])

  sys_account_line = tolist([
    for line in local.file_lines : line
    if startswith(line, "system_account:")
  ])
  sys_account_id = one([
    for line in local.sys_account_line :
    replace(line, "/system_account: /", "")
  ])

  account_preload_line = tolist([
    for line in local.file_lines : trimsuffix(trimspace(line), ",")
    if startswith(trimspace(line), "${local.sys_account_id}:")
  ])
  sys_account_jwt = one([
    for line in local.account_preload_line :
    trimspace(replace(line, "/${local.sys_account_id}: /", ""))
  ])
}

output "operator_jwt" {
  value = local.operator_jwt
}

output "sys_account_id" {
  value = local.sys_account_id
}

output "sys_account_jwt" {
  value = local.sys_account_jwt
}

data "local_file" "leaf_creds" {
  filename = "${path.root}/outputs/nsc/creds/WASMCLOUD/DEMO/leaf.creds"

  depends_on = [ null_resource.generate_account_hierarchy ]
}

data "local_file" "kubernetes_secrets_creds" {
  filename = "${path.root}/outputs/nsc/creds/WASMCLOUD/DEMO/kubernetes-secrets.creds"

  depends_on = [ null_resource.generate_account_hierarchy ]
}

data "local_file" "wadm_creds" {
  filename = "${path.root}/outputs/nsc/creds/WASMCLOUD/DEMO/wadm.creds"

  depends_on = [ null_resource.generate_account_hierarchy ]
}

output "creds" {
  value = {
    leaf = data.local_file.leaf_creds.content
    secrets = data.local_file.kubernetes_secrets_creds.content
    wadm = data.local_file.wadm_creds.content
  }
}