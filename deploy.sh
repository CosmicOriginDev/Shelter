#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./deploy.sh
# Optional env vars:
#   DOCKER_IMAGE=ed0827/shelter
#   TAG=fix-v7
#   RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/...

DOCKER_IMAGE="${DOCKER_IMAGE:-ed0827/shelter}"
TAG="${TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"

echo "Building image: ${DOCKER_IMAGE}:${TAG}"
docker build --platform linux/amd64 -t "${DOCKER_IMAGE}:${TAG}" -t "${DOCKER_IMAGE}:latest" .

echo "Pushing image tags: ${TAG}, latest"
docker push "${DOCKER_IMAGE}:${TAG}"
docker push "${DOCKER_IMAGE}:latest"

if [ -n "${RENDER_DEPLOY_HOOK_URL:-}" ]; then
  echo "Triggering Render deploy hook"
  curl -fsSL -X POST "${RENDER_DEPLOY_HOOK_URL}" >/dev/null
  echo "Render deploy triggered."
else
  echo "RENDER_DEPLOY_HOOK_URL not set. Skipping Render trigger."
fi

echo "Done."
