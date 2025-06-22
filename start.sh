#!/bin/bash

# Load environment variables
source .env

# Initialize database
echo "Initializing database..."
psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f scripts/init-db.sql

# Start WebSocket server
echo "Starting WebSocket server..."
node lib/websocket.js &

# Start Next.js development server
echo "Starting Next.js development server..."
pnpm dev 