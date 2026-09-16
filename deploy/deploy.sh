#!/usr/bin/env sh
# Usage: deploy/deploy.sh <image-tag>
# Expects vehicle-viewer:<image-tag> to be built already (docker compose build).
# Starts it, waits for the container healthcheck, rolls back to the previous image on failure.
set -eu

TAG="${1:?usage: deploy/deploy.sh <image-tag>}"
COMPOSE="${COMPOSE:-docker compose}"
CONTAINER=vehicle-viewer
IMAGE=vehicle-viewer
KEEP_IMAGES=3
HEALTH_TIMEOUT_SECONDS=60

cd "$(dirname "$0")/.."

previous_image=$(docker inspect -f '{{.Config.Image}}' "$CONTAINER" 2>/dev/null || true)
echo "Previous image: ${previous_image:-<none>}"

IMAGE_TAG="$TAG" $COMPOSE up -d --no-build --remove-orphans

wait_healthy() {
  elapsed=0
  while [ "$elapsed" -lt "$HEALTH_TIMEOUT_SECONDS" ]; do
    status=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo missing)
    case "$status" in
      healthy) return 0 ;;
      unhealthy) return 1 ;;
    esac
    sleep 2
    elapsed=$((elapsed + 2))
  done
  return 1
}

if ! wait_healthy; then
  echo "Container did not become healthy; last logs:" >&2
  docker logs --tail 50 "$CONTAINER" >&2 || true
  if [ -n "$previous_image" ] && [ "$previous_image" != "$IMAGE:$TAG" ]; then
    echo "Rolling back to $previous_image" >&2
    IMAGE_TAG="${previous_image##*:}" $COMPOSE up -d --no-build --remove-orphans
  fi
  exit 1
fi

docker tag "$IMAGE:$TAG" "$IMAGE:latest"
echo "Deployed $IMAGE:$TAG"

# Numeric tags are Jenkins build numbers; keep the newest few for manual rollback.
docker images "$IMAGE" --format '{{.Tag}}' \
  | grep -E '^[0-9]+$' \
  | sort -rn \
  | tail -n +$((KEEP_IMAGES + 1)) \
  | while read -r old_tag; do
      docker rmi "$IMAGE:$old_tag" >/dev/null 2>&1 || true
    done
docker image prune -f >/dev/null
