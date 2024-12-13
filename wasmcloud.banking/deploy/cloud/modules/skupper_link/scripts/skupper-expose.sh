#!/usr/bin/env bash

# Check for port-forward connectivity once per second, up to 5 times.
COUNT=0
ATTEMPTS=5
until [[ `skupper expose statefulset $EXPOSE_TARGET --port 6222,7222 --headless` ]] || [[ $COUNT -eq $ATTEMPTS ]]; do
  sleep 1
  ((COUNT++))
done

exit 0