#!/usr/bin/env bash

mkdir -p ./outputs/nsc

nsc -H ./outputs/nsc add operator --name WASMCLOUD
nsc -H ./outputs/nsc add account --name SYS
nsc -H ./outputs/nsc generate config --nats-resolver --sys-account SYS --config-file ./outputs/nsc/nats.conf

exit 0