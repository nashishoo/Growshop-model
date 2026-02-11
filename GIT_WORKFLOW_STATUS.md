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
