#!/usr/bin/env bash

# Check for port-forward connectivity once per second, up to 5 times.
COUNT=0
ATTEMPTS=5
until [[ `skupper link create ${TOKEN_PATH}` ]] || [[ $COUNT -eq $ATTEMPTS ]]; do
  sleep 1
  ((COUNT++))
done

exit 0