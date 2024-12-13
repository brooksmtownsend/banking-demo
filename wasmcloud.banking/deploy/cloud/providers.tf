terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.115.0"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "=2.15.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "=2.32.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "=3.6.2"
    }
  }
}

provider "azurerm" {
  features { }

  # This is only required when the User, Service Principal, or Identity running Terraform lacks the permissions to register Azure Resource Providers.
  skip_provider_registration = true 

  subscription_id = var.azure_sub_id
}

provider "helm" {
  alias = "primary"
  kubernetes {
    config_path = module.azure.kubeconfig["primary"]
  }
}

provider "kubernetes" {
  alias = "primary"
  config_path = module.azure.kubeconfig["primary"]
}

provider "helm" {
  alias = "secondary"
  kubernetes {
    config_path = module.azure.kubeconfig["secondary"]
  }
}

provider "kubernetes" {
  alias = "secondary"
  config_path = module.azure.kubeconfig["secondary"]
}