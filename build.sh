#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building Next.js app..."
cd apps/web
npm run build
cd ../..

echo "Build successful!"
