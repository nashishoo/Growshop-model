# Skill: Git Workflow Automation

Este skill automatiza la instalación del skill de git-commit y configura el workflow de commits automáticos para agentes AI.

## Instalación

```bash
npx skills add [TU-USUARIO]/[TU-REPO]@git-workflow-automation
```

## Descripción

Configura automáticamente:
1. Instalación del skill de git-commit de GitHub
2. Workflow de commits semánticos
3. Preparación del proyecto para commits automáticos por parte de agentes AI

## Uso

El agente ejecutará automáticamente esta secuencia al recibir el prompt de activación.

---

# SKILL.md

## Git Workflow Automation Skill

### Objetivo
Configurar el proyecto para que los agentes AI puedan hacer commits automáticos siguiendo Conventional Commits.

### Workflow

#### PASO 1: Verificar Estado Actual del Repositorio

```bash
# Verificar si estamos en un repositorio git
git status

# Verificar branch actual
git branch --show-current

# Verificar si hay cambios pendientes
git status --porcelain
```

#### PASO 2: Instalar Git Commit Skill

```bash
# Instalar el skill de commits semánticos
npx skills add github/awesome-copilot@git-commit
```

**Output esperado:**
```
✓ Skill 'git-commit' instalado exitosamente
```

#### PASO 3: Verificar Instalación

```bash
# Verificar que el skill se instaló correctamente
ls -la .skills/ 2>/dev/null || echo "Skills instalados en el sistema"
```

#### PASO 4: Crear Configuración de Workflow

Crear archivo `.github/workflows/agent-commits.md` con la guía de commits:

```markdown
# Guía de Commits para Agentes AI

## Tipos de Commit

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactorización de código
- `docs:` Cambios en documentación
- `style:` Formateo, espacios (sin cambios de lógica)
- `test:` Agregar o modificar tests
- `chore:` Mantenimiento, configuración

## Formato

```
<tipo>[scope]: <descripción>

[cuerpo opcional]

[footer opcional]
```

## Ejemplos

```bash
feat: agregar exportación de datos a Excel
fix: corregir versiones CDN de React
refactor: reorganizar estructura de carpetas
docs: actualizar README con instrucciones de instalación
```

## Reglas

1. Un commit por cambio lógico
2. Presente imperativo: "agregar" no "agregado"
3. Descripción < 72 caracteres
4. Referenciar issues cuando aplique: `Closes #123`
```

#### PASO 5: Crear Helper Script para Commits

Crear archivo `scripts/auto-commit.sh`:

```bash
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
```

Hacer ejecutable:
```bash
chmod +x scripts/auto-commit.sh
```

#### PASO 6: Actualizar .gitignore

Agregar a `.gitignore` si no existe:

```
# Secrets y configuración local
.env
.env.local
*.key
*.pem
credentials.json

# Dependencies
node_modules/
.npm/

# Build outputs
dist/
build/
.next/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

#### PASO 7: Crear Documento de Estado

Crear `GIT_WORKFLOW_STATUS.md`:

```markdown
# Estado del Git Workflow

## ✅ Configuración Completada

- [x] Git commit skill instalado
- [x] Guía de commits creada
- [x] Helper script configurado
- [x] .gitignore actualizado

## Uso para Agentes AI

### Hacer un commit

1. Hacer cambios en archivos
2. Verificar cambios: `git status`
3. Stagear archivos: `git add <archivos>`
4. Commit: `git commit -m "tipo: mensaje"`

### Tipos de commit disponibles

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactorización
- `docs`: Documentación
- `style`: Formateo
- `test`: Tests
- `chore`: Mantenimiento

### Ejemplo de workflow completo

```bash
# 1. Hacer cambios
# 2. Ver qué cambió
git status

# 3. Stagear cambios
git add src/utils/dataExporter.js
git add src/views/HomeView.js

# 4. Commit
git commit -m "feat: agregar sistema de exportación de datos"

# 5. Push (manual o cuando el usuario lo apruebe)
# git push origin main
```

## Seguridad

- ❌ NUNCA commitear archivos .env
- ❌ NUNCA hacer force push sin confirmación
- ❌ NUNCA hacer hard reset destructivo
- ✅ SIEMPRE usar conventional commits
- ✅ SIEMPRE verificar cambios antes de commit
```

#### PASO 8: Test del Workflow

Crear un commit de prueba:

```bash
# Crear archivo de test
echo "# Git Workflow Test" > TEST_WORKFLOW.md

# Stagear
git add TEST_WORKFLOW.md

# Commit de prueba
git commit -m "chore: configurar git workflow automation"

# Mostrar último commit
git log -1 --oneline
```

#### PASO 9: Reporte Final

Crear `INFORME_GIT_SETUP.md`:

```markdown
# Informe: Git Workflow Automation

## ✅ Instalación Completada

### Archivos Creados

1. `.github/workflows/agent-commits.md` - Guía de commits
2. `scripts/auto-commit.sh` - Helper script
3. `GIT_WORKFLOW_STATUS.md` - Estado y documentación
4. `.gitignore` - Reglas de exclusión actualizadas

### Skills Instalados

- `github/awesome-copilot@git-commit` ✓

### Tests Realizados

- Commit de prueba exitoso ✓
- Workflow verificado ✓

## Próximos Pasos

### Para Agentes AI

Los agentes ahora pueden hacer commits automáticamente usando:

```bash
git add <archivos>
git commit -m "tipo: mensaje"
```

### Para Push a GitHub

**Opción A - Manual (Recomendado):**
```bash
git push origin main
```

**Opción B - Darle permiso al agente:**
Decirle explícitamente: "haz git push origin main"

## Ejemplo de Uso en Prompts

Agrega al final de tus prompts de tareas:

```markdown
## AL TERMINAR

1. Stagear todos los cambios: `git add -A`
2. Hacer commit con mensaje descriptivo usando Conventional Commits
3. Mostrar resumen de cambios realizados
```

## Seguridad Configurada

✓ .gitignore protege archivos sensibles
✓ Skill tiene protecciones anti-destructivas built-in
✓ Push manual por defecto (seguridad)

---

**🎯 Status: LISTO PARA USAR**

Los agentes pueden ahora hacer commits automáticos de forma segura.
```

---

## Reglas de Seguridad

Este skill NUNCA:
- Modifica git config sin permiso
- Hace force push automáticamente
- Hace hard reset destructivo
- Commitea archivos en .gitignore
- Salta git hooks sin permiso explícito

## Convenciones

- Usar Conventional Commits siempre
- Un commit por cambio lógico
- Mensajes en presente imperativo
- Descripción < 72 caracteres
