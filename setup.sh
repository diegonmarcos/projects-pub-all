#!/bin/sh
# One-time per clone: use the committed hooks.
git config core.hooksPath .githooks && chmod +x .githooks/* && echo "hooks installed (.githooks)"
