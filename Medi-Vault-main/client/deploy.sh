#!/bin/bash

# MediVault Deployment Script
# This script helps build and deploy the MediVault application

echo "🏥 MediVault Deployment Script 🏥"
echo "====================================="

# Check if we're in the right directory
if [ ! -d "./client" ]; then
  echo "❌ Error: Run this script from the project root (where the 'client' directory is located)"
  exit 1
fi

cd client

# Check for Node.js and npm
if ! command -v npm &> /dev/null; then
  echo "❌ Error: npm is not installed. Please install Node.js and npm first."
  exit 1
fi

# Choose deployment target
echo "Select deployment target:"
echo "1) Vercel (recommended)"
echo "2) Netlify"
echo "3) Firebase"
echo "4) Just build locally"
read -p "Enter choice (1-4): " deployment_choice

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ Error: Failed to install dependencies"
  exit 1
fi

# Build the application
echo "🔨 Building application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Error: Build failed"
  exit 1
fi
echo "✅ Build completed successfully!"

case $deployment_choice in
  1)
    # Vercel deployment
    echo "🚀 Deploying to Vercel..."
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
      echo "Installing Vercel CLI..."
      npm install -g vercel
    fi
    
    # Deploy with Vercel
    echo "Running Vercel deployment..."
    vercel --prod
    ;;
  2)
    # Netlify deployment
    echo "🚀 Deploying to Netlify..."
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
      echo "Installing Netlify CLI..."
      npm install -g netlify-cli
    fi
    
    # Deploy with Netlify
    echo "Running Netlify deployment..."
    netlify deploy --prod
    ;;
  3)
    # Firebase deployment
    echo "🚀 Deploying to Firebase..."
    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
      echo "Installing Firebase CLI..."
      npm install -g firebase-tools
    fi
    
    # Check if firebase.json exists, if not, initialize
    if [ ! -f "firebase.json" ]; then
      echo "Firebase configuration not found. Running setup..."
      firebase login
      firebase init hosting
    fi
    
    # Deploy to Firebase
    echo "Running Firebase deployment..."
    firebase deploy --only hosting
    ;;
  4)
    # Local build only
    echo "✅ Application built successfully in the 'build' directory."
    echo "You can deploy this build directory to any static hosting service."
    ;;
  *)
    echo "❌ Invalid choice. Exiting."
    exit 1
    ;;
esac

echo "====================================="
echo "🎉 Deployment process completed!"
echo "Note: Check the deployment URL provided above to access your application." 