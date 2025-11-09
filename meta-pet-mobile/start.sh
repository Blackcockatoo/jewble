#!/bin/bash
# B$S Meta-Pet Mobile - Quick Start Script

set -e

echo "🚀 Starting B$S Meta-Pet Mobile"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from /home/user/jewble/meta-pet-mobile"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
fi

echo "✅ Dependencies ready"
echo ""
echo "🎯 Starting Expo development server..."
echo ""
echo "OPTIONS:"
echo "  1. Press 'w' to open in web browser"
echo "  2. Scan QR code with Expo Go app on your phone"
echo "  3. Press 'i' for iOS simulator (Mac only)"
echo "  4. Press 'a' for Android emulator"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Expo in offline mode (avoids network errors)
EXPO_OFFLINE=1 npx expo start --offline
