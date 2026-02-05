#!/bin/bash

# Script to configure CORS on Google Cloud Storage bucket for file uploads
# This allows web browsers to upload files directly to Firebase Storage

BUCKET_NAME="startracker-fb6ce.appspot.com"
CORS_CONFIG_FILE="gcs-cors-config.json"

echo "Configuring CORS for bucket: $BUCKET_NAME"
echo "Using config file: $CORS_CONFIG_FILE"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed."
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "Error: Not authenticated with gcloud."
    echo "Please run: gcloud auth login"
    exit 1
fi

# Apply CORS configuration
echo "Applying CORS configuration..."
gcloud storage buckets update gs://$BUCKET_NAME --cors-file=$CORS_CONFIG_FILE

if [ $? -eq 0 ]; then
    echo "✅ CORS configuration applied successfully!"
    echo ""
    echo "The following origins are now allowed to upload files:"
    echo "  - https://chefry-nextjs-rust.vercel.app (production)"
    echo "  - http://localhost:3000 (local Next.js)"
    echo "  - http://localhost:8081 (Expo web dev)"
    echo "  - http://localhost:19006 (Expo web dev alternative)"
else
    echo "❌ Failed to apply CORS configuration."
    exit 1
fi
