#!/bin/bash
set -e

# ============================================
# EduHabit Local Build & Deploy Script
# Build on laptop, deploy to server
# ============================================

# Configuration
REMOTE_USER="Nabigh"
REMOTE_HOST=""  # <-- Set your server IP/domain here
REMOTE_DIR="/home/Nabigh/eduhabbit"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if REMOTE_HOST is set
if [ -z "$REMOTE_HOST" ]; then
  echo -e "${RED}Error: Set REMOTE_HOST in this script first!${NC}"
  exit 1
fi

echo -e "${GREEN}=== EduHabit Deploy ===${NC}"

# Step 1: Build locally
echo -e "${YELLOW}[1/5] Building Next.js (standalone)...${NC}"
npm run build

# Step 2: Copy static assets into standalone
echo -e "${YELLOW}[2/5] Preparing standalone bundle...${NC}"
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Step 3: rsync to server
echo -e "${YELLOW}[3/5] Syncing to server...${NC}"
rsync -avz --delete \
  --exclude='eduhabit.db' \
  --exclude='eduhabit.db-wal' \
  --exclude='eduhabit.db-shm' \
  --exclude='.env.local' \
  .next/standalone/ \
  ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

# Step 4: Rebuild native addons on server (better-sqlite3)
echo -e "${YELLOW}[4/5] Rebuilding native addons on server...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && npm rebuild better-sqlite3 2>/dev/null || true"

# Step 5: Restart service
echo -e "${YELLOW}[5/5] Restarting service...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "sudo systemctl restart eduhabit"

echo -e "${GREEN}=== Deploy Complete! ===${NC}"
