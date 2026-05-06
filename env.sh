#!/usr/bin/env bash

# shellcheck shell=bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
DIST_DIR="$ROOT_DIR/dist"

_require_frontend() {
  if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo "Error: cannot find $FRONTEND_DIR/package.json"
    return 1
  fi
}

project_root() {
  echo "$ROOT_DIR"
}

frontend_root() {
  echo "$FRONTEND_DIR"
}

install_deps() {
  _require_frontend || return 1
  npm --prefix "$FRONTEND_DIR" install
}

dev() {
  _require_frontend || return 1
  npm --prefix "$FRONTEND_DIR" run dev
}

build() {
  _require_frontend || return 1
  npm --prefix "$FRONTEND_DIR" run build
}

preview() {
  _require_frontend || return 1
  npm --prefix "$FRONTEND_DIR" run preview
}

clean_dist() {
  rm -rf "$DIST_DIR"
  echo "Removed: $DIST_DIR"
}

check() {
  _require_frontend || return 1
  npm --prefix "$FRONTEND_DIR" run lint
  npm --prefix "$FRONTEND_DIR" run test:unit
}

help_env() {
  cat <<'TXT'
Available functions:
  project_root    Print project root path
  frontend_root   Print frontend root path
  install_deps    Install frontend dependencies
  dev             Run Vite dev server
  build           Build frontend into root dist/
  preview         Preview production build
  clean_dist      Remove root dist directory
  check           Run lint + unit tests
  help_env        Show this help
TXT
}
