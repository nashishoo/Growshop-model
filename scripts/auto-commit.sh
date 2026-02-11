#!/bin/bash

# Script helper para commits automáticos
# Uso: ./scripts/auto-commit.sh "tipo" "mensaje"

TYPE=$1
MESSAGE=$2

if [ -z "$TYPE" ] || [ -z "$MESSAGE" ]; then
    echo "Uso: ./scripts/auto-commit.sh <tipo> <mensaje>"
    echo "Ejemplo: ./scripts/auto-commit.sh feat 'agregar nueva funcionalidad'"
    exit 1
fi

# Verificar que hay cambios
if [ -z "$(git status --porcelain)" ]; then
    echo "No hay cambios para commitear"
    exit 0
fi

# Hacer commit
git add -A
git commit -m "$TYPE: $MESSAGE"

echo "✓ Commit exitoso: $TYPE: $MESSAGE"
