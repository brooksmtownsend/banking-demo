# Ask Cloudflare what is the IP for the machine running the terraform so that
# we can add that to the Azure firewall
resource "null_resource" "what_is_my_ip" {
  provisioner "local-exec" {
    command = "${path.module}/scripts/what-is-my-ip.sh"

    environment = {
      "OUTPUT_PATH" = "${path.module}/tmp/what-is-my-ip"
    }
  }
}

data "local_file" "what_is_my_ip" {
  filename = "${path.module}/tmp/what-is-my-ip"

  depends_on = [ null_resource.what_is_my_ip ]
}

output "ip" {
  value = data.local_file.what_is_my_ip.content
}