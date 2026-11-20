#!/bin/sh
# Loads the migration and seed into a throwaway local Postgres and runs the SQL tests.
set -e
export LC_ALL=C
cd "$(dirname "$0")"
DIR=$(mktemp -d /tmp/wd.XXXX) # short path: Postgres socket paths have a length limit
initdb -D "$DIR" -U postgres >/dev/null
pg_ctl -D "$DIR" -o "-p 54329 -k $DIR" -l "$DIR/log" start >/dev/null
trap 'pg_ctl -D "$DIR" stop >/dev/null; rm -rf "$DIR"' EXIT
PSQL="psql -h $DIR -p 54329 -U postgres -q -v ON_ERROR_STOP=1"
$PSQL -f stubs.sql
sed 's/^create extension if not exists pg_cron;//' ../migrations/0001_init.sql | $PSQL
$PSQL -c "grant usage on schema public to anon, authenticated; grant select on all tables in schema public to anon, authenticated;"
$PSQL -f ../seed.sql
$PSQL -f orders.test.sql
