#!/usr/bin/env bash

nsc -H outputs/nsc add account -n DEMO
nsc -H outputs/nsc edit account -n DEMO --js-enable=1
nsc -H outputs/nsc add user -a DEMO -n wadm
nsc -H outputs/nsc add user -a DEMO -n kubernetes-secrets
nsc -H outputs/nsc add user -a DEMO -n leaf
nsc -H outputs/nsc add user -a DEMO -n edge

exit 0