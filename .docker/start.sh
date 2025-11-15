pnpm install

pnpm rebuild:sqlite3 || echo "Warning: sqlite3 rebuild failed. Run 'pnpm rebuild:sqlite3' manually if tests fail."

tail -f /dev/null
