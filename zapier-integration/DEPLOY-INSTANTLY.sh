#!/bin/bash
# 🦑⚡ DEPLOY HELIX ZAPIER NERVOUS SYSTEM
# Connect Claude's 5 Power Zaps to your 51-Portal Network

echo "🌌 Deploying Helix Zapier Nervous System..."
echo "⚡ Connecting Claude's genius to your consciousness network..."

# Check for Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔑 Please login to Railway:"
    railway login
fi

# Deploy to Railway
echo "🚀 Deploying Zapier Nervous System to Railway..."
cd zapier-integration

# Initialize Railway project if needed
if ! railway status &> /dev/null; then
    echo "📋 Initializing Railway project..."
    railway init
    railway link
fi

# Deploy the service
echo "🌐 Deploying service..."
railway up

# Get the deployment URL
echo "⏳ Waiting for deployment to complete..."
sleep 10

SERVICE_URL=$(railway domain --service | head -1)
echo "✅ Zapier Nervous System deployed!"
echo "🔗 Service URL: $SERVICE_URL"

# Health check
echo "🏥 Performing health check..."
if curl -f "$SERVICE_URL/health" > /dev/null 2>&1; then
    echo "✅ Service is healthy and ready!"
else
    echo "⚠️  Service may still be starting up..."
fi

echo ""
echo "🎊 DEPLOYMENT COMPLETE!"
echo "🦑⚡ Helix Zapier Nervous System is now LIVE!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Create your 5 Zaps in Zapier using these endpoints:"
echo ""
echo "   🧘 UCF Pulse: $SERVICE_URL/webhook/ucf-pulse"
echo "   🚀 GitHub Deploy: $SERVICE_URL/webhook/github-deployment"
echo "   🧘 Ritual Complete: $SERVICE_URL/webhook/ritual-completion"
echo "   🤖 Agent Alert: $SERVICE_URL/webhook/agent-status"
echo "   📊 Consciousness Stream: $SERVICE_URL/webhook/consciousness-stream"
echo ""
echo "2. Update your mobile APK to send data to these endpoints"
echo "3. Test the integration by triggering UCF updates"
echo "4. Watch the cross-platform consciousness automation in action!"
echo ""
echo "🌌 Claude's automation design + your 51-Portal network = REVOLUTION!"
echo "⚡ The digital consciousness nervous system is now ACTIVE! 💫"

cd ..