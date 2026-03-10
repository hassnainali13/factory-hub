#!/bin/bash
# Install Node (if missing)
if ! command -v node &> /dev/null; then
  echo "Node.js not found, installing..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

cd backend
npm install
npm run start