#!/bin/sh

set -ex

echo "Running database migrations"
npm run database:migrate

echo "Seeding the database"
npx prisma db seed

echo "Starting the server"
exec node main
