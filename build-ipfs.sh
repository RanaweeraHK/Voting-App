#!/bin/bash

# Clean dist directory
rm -rf dist
mkdir -p dist/js dist/css dist/fonts

# Copy HTML file
cp src/index.html dist/

# Copy CSS and fonts
cp -r src/css/* dist/css/
cp -r src/fonts/* dist/fonts/

# Copy JS files
cp src/js/app.js dist/js/
cp src/js/bootstrap.min.js dist/js/
cp src/js/truffle-contract.js dist/js/
cp src/js/web3.min.js dist/js/

# Copy contract artifacts
cp build/contracts/Election.json dist/
cp build/contracts/Migrations.json dist/

# Add to IPFS
echo "Adding to IPFS..."
HASH=$(ipfs add -r dist | tail -n 1 | awk '{print $2}')

# Publish to IPNS (this will use your IPFS node's key)
echo "Publishing to IPNS..."
ipfs name publish $HASH

echo "Your dApp is now available at:"
echo "https://ipfs.io/ipfs/$HASH"
echo "https://gateway.pinata.cloud/ipfs/$HASH"
echo "https://cloudflare-ipfs.com/ipfs/$HASH"
echo ""
echo "And via your IPNS name at:"
echo "https://ipfs.io/ipns/$(ipfs key list -l | grep 'self' | awk '{print $1}')"
echo "https://gateway.pinata.cloud/ipns/$(ipfs key list -l | grep 'self' | awk '{print $1}')"
echo "https://cloudflare-ipfs.com/ipns/$(ipfs key list -l | grep 'self' | awk '{print $1}')"
