#!/usr/bin/env bash
# wait-for-it.sh: Wait until a host:port is available
# Usage: ./wait-for-it.sh host:port -- command args

set -e

host=$(echo $1 | cut -d: -f1)
port=$(echo $1 | cut -d: -f2)
shift

while ! nc -z $host $port; do
  echo "Waiting for $host:$port..."
  sleep 2
done

echo "$host:$port is available!"
exec "$@"
