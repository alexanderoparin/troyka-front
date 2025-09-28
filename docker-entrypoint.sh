#!/bin/sh

echo "🚀 Starting TROYKA.AI application..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Seed the database if needed
echo "🌱 Seeding database..."
npx prisma db seed --preview-feature || echo "Seed skipped or failed"

# Start the Next.js application
echo "🎯 Starting Next.js server..."
exec node server.js
