#!/usr/bin/env bash

COUNT=0
ATTEMPTS=5
until [[ `curl --silent -4 'https://cloudflare.com/cdn-cgi/trace' | grep ip | tr -d '(ip=|\n)' > $OUTPUT_PATH` ]] || [[ $COUNT -eq $ATTEMPTS ]]; do
  sleep 1
  ((COUNT++))
done

exit 0