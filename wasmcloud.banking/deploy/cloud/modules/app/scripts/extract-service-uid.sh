#!/usr/bin/env bash

# This script grabs the `.metadata.uid` from the http-router service so
# that it can be used to expose the service via the cross-region
# loadbalancer.
#
# I can't claim that I fully understand how these UIDs come to be in this
# format, but it didn't seem like there was an easy alternative for how to
# wire up the AKS managed service type loadbalancer into the cross-region
# loadbalancer without these tricks.
#
# 1. Removes all dashes
# 2. Prepends `a` in the beginning of the string
# 3. Removes the last character
# 4. Writes it into a file it can be used by another resource
kubectl get svc/http-router -o jsonpath='{.metadata}' | jq -Mr '.uid | sub("-";"";"g") | "a" + .[:-1]' | tr -d '\n' > $OUTPUT_PATH

exit 0