#!/usr/bin/env bash


helm uninstall setup-postgres
helm uninstall postgres
helm uninstall ollama
helm uninstall providers
helm uninstall components
helm uninstall kubernetes-secrets
helm uninstall wadm
helm uninstall nats

rm ./outputs/kubernetes-secrets.seed
rm ./outputs/postgres-password.txt