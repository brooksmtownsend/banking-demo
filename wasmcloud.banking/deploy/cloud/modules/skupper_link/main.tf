resource "time_sleep" "wait" {
  create_duration = "15s"
}

resource "null_resource" "wait" {
  depends_on = [ time_sleep.wait ]
}

resource "null_resource" "skupper_init" {
  for_each = var.kubeconfig_paths

  provisioner "local-exec" {
    command = "skupper init"
    environment = {
      KUBECONFIG = each.value
    }
  }

  depends_on = [ time_sleep.wait, null_resource.wait ]
}

resource "null_resource" "skupper_token_create" {
  provisioner "local-exec" {
    command = "${path.module}/scripts/skupper-create-token.sh"

    environment = {
      KUBECONFIG = var.kubeconfig_paths["primary"]
      TOKEN_PATH = "${path.module}/tmp/skupper.token"
    }
  }

  depends_on = [ null_resource.skupper_init ]
}

resource "null_resource" "skupper_link_create" {
  provisioner "local-exec" {
    command = "${path.module}/scripts/skupper-create-link.sh"

    environment = {
      KUBECONFIG = var.kubeconfig_paths["secondary"]
      TOKEN_PATH = "${path.module}/tmp/skupper.token"
    }
  }

  depends_on = [ null_resource.skupper_token_create ]
}

resource "null_resource" "skupper_expose" {
  for_each = var.kubeconfig_paths

  provisioner "local-exec" {
    command = "${path.module}/scripts/skupper-expose.sh"
    environment = {
      KUBECONFIG = each.value
      EXPOSE_TARGET = "nats-${each.key}"
    }
  }

  depends_on = [
    null_resource.wait,
    null_resource.skupper_token_create,
    null_resource.skupper_link_create,
  ]
}