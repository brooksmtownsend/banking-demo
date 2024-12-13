#!/usr/bin/env bash

# Check for port-forward connectivity, up to 30 times.
COUNT=0
ATTEMPTS=30
while [[ `lsof -i :$LOCAL_PORT` ]] || [[ $COUNT -lt $ATTEMPTS ]]; do
  sleep 1
  ((COUNT++))
done

# Ensure we kill the background port-forward on exit
trap cleanup EXIT
cleanup() {
    ps aux | grep "port-forward svc/nats ${LOCAL_PORT}:4222" | grep -v grep | awk '{ print $2 }' | xargs kill
}

# Port-forward for access to the server
kubectl port-forward "svc/nats" "${LOCAL_PORT}:4222" &

# Check for port-forward connectivity once per second, up to 30 seconds.
COUNT=0
ATTEMPTS=30
until [[ `lsof -i :$LOCAL_PORT` ]] || [[ $COUNT -eq $ATTEMPTS ]]; do
  sleep 1
  ((COUNT++))
done

nsc -H outputs/nsc push -a DEMO -u "nats://127.0.0.1:${LOCAL_PORT}" --system-account SYS

exit 0