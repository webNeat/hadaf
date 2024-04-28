#!/usr/bin/env bash
set -e

rm -rf dist
tsc -p tsconfig.esm.json
tsc -p tsconfig.cjs.json
echo '{"type": "module"}' > dist/esm/package.json
echo '{"type": "commonjs"}' > dist/cjs/package.json
