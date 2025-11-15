set -e

SQLITE3_DIR=$(find node_modules/.pnpm -name "sqlite3@5.1.7" -type d | head -1)

if [ -z "$SQLITE3_DIR" ]; then
  echo "sqlite3@5.1.7 not found, trying pnpm rebuild..."
  pnpm rebuild sqlite3 || exit 1
else
  SQLITE3_PATH="$SQLITE3_DIR/node_modules/sqlite3"
  if [ -d "$SQLITE3_PATH" ]; then
    echo "Rebuilding sqlite3 in $SQLITE3_PATH..."
    cd "$SQLITE3_PATH"
    npx node-gyp rebuild
    echo "✓ sqlite3 rebuilt successfully"
  else
    echo "sqlite3 directory not found, trying pnpm rebuild..."
    pnpm rebuild sqlite3 || exit 1
  fi
fi

