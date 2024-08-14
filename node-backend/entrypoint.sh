#!/bin/sh

# Run migrations
npx sequelize-cli db:migrate --config database/config/config.js

# Start the application
exec "$@"
