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
