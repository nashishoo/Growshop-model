# Manual de Usuario - Conectados 420 Growshop

> [!NOTE]
> Este manual fue diseñado para proporcionar una guía completa sobre el uso de la plataforma web Conectados 420. Incluye instrucciones para usuarios finales y administradores.

---

## Tabla de Contenidos

1. [Página Principal (Landing)](#1-página-principal-landing)
2. [Sistema de Registro de Usuarios](#2-sistema-de-registro-de-usuarios)
3. [Inicio de Sesión de Clientes](#3-inicio-de-sesión-de-clientes)
4. [Acceso al Panel de Administración](#4-acceso-al-panel-de-administración)
5. [Panel de Administración](#5-panel-de-administración)

---

## 1. Página Principal (Landing)

La página principal de Conectados 420 es la primera experiencia del usuario con la plataforma. Ha sido diseñada con un enfoque moderno y atractivo para maximizar la conversión y facilitar la navegación.

### 1.1 Hero Section y Navegación

**Elementos principales:**
- **Banner destacado**: Promoción de temporada ("Temporada Outdoor 2026")
- **Barra de navegación superior**: Acceso rápido al catálogo, carrito de compras e inicio de sesión
- **Logo corporativo**: Identificación visual de la marca
- **Botón de carrito**: Muestra el número de productos agregados

### 1.2 Categorías y Barra de Confianza

**Características:**
- **Carrusel de categorías**: Navegación visual por productos (Semillas, Indoor, Nutrientes, Parafernalia, Accesorios, Outdoor)
- **Indicadores de confianza**: 
  - Envíos a todo Chile
  - Pago seguro
  - Soporte garantizado
  - Discreción total

### 1.3 Productos Destacados

**Funcionalidades:**
- **Carrusel de productos destacados**: Visualización de los productos más populares con precios y descuentos
- **Botón "Agregar al carrito"**: Permite añadir productos directamente desde el carrusel
- **Etiquetas de descuento**: Muestran el porcentaje de ahorro

### 1.4 Zona de Cultivo y Banco Genético

**Secciones:**
- **Zona de Cultivo**: Acordeón desplegable con diferentes categorías (Indoor, Sustratos, Nutrientes)
- **Kits de cultivo**: Paquetes completos para diferentes necesidades
- **Banco Genético**: Catálogo de semillas con categorías específicas

### 1.5 Catálogo de Semillas y Contacto

**Elementos:**
- **Catálogo especializado**: Semillas automáticas y feminizadas organizadas por categorías
- **Información de contacto**: Formulario de consultas y datos de ubicación

### 1.6 Footer y Redes Sociales

**Contenido del footer:**
- **Enlaces de navegación**: Catálogo, condiciones, políticas, contacto
- **Centro de ayuda**: FAQ, términos de servicio, política de privacidad
- **Redes sociales**: Instagram, Facebook, WhatsApp
- **Certificaciones de seguridad**: Sellos de confianza (Mercado Pago, SSL)

---

## 2. Sistema de Registro de Usuarios

El sistema de registro permite a los nuevos usuarios crear una cuenta para realizar compras y acceder a beneficios exclusivos.

### 2.1 Página de Registro

**Campos requeridos:**

| Campo | Descripción | Validación |
|-------|-------------|------------|
| **Nombre completo** | Nombre y apellido del usuario | Obligatorio |
| **Email** | Correo electrónico único | Formato de email válido |
| **Teléfono** | Número de contacto | Formato chileno (+56) |
| **Contraseña** | Clave de acceso | Mínimo 8 caracteres |
| **Confirmar contraseña** | Verificación de contraseña | Debe coincidir |

**Pasos para registrarse:**

1. Hacer clic en el icono de usuario en la barra de navegación
2. Seleccionar "¿No tienes cuenta? Únete al club"
3. Completar todos los campos del formulario
4. Aceptar términos y condiciones
5. Hacer clic en "UNIRME AL CLUB"
6. Verificar el email recibido (si está configurado)

> [!IMPORTANT]
> El email debe ser único en el sistema. Si ya existe una cuenta con ese correo, el sistema mostrará un error.

---

## 3. Inicio de Sesión de Clientes

Los usuarios registrados pueden acceder a su cuenta para realizar compras y gestionar sus pedidos.

### 3.1 Página de Login

**Proceso de inicio de sesión:**

1. Hacer clic en el icono de usuario en la navegación
2. Ingresar email y contraseña
3. Hacer clic en "ENTRAR AL CLUB"

**Opciones adicionales:**
- **¿Olvidaste tu contraseña?**: Permite recuperar el acceso mediante email
- **¿No tienes cuenta?**: Redirige al formulario de registro

**Funcionalidades post-login:**
- Acceso a "Mi Cuenta"
- Historial de pedidos
- Gestión de direcciones
- Datos personales

> [!TIP]
> Los usuarios pueden realizar compras sin registrarse (checkout como invitados), pero no podrán acceder al historial de pedidos ni a beneficios exclusivos.

---

## 4. Acceso al Panel de Administración

El panel de administración está restringido a usuarios con rol de administrador y se accede desde una URL diferente.

### 4.1 Login de Administrador

**Credenciales de acceso:**
- **URL**: `http://localhost:5173/admin/login` (en producción: `dominio.com/admin/login`)
- **Email**: admin@conectados420.cl
- **Contraseña**: Conectados2026

**Características de seguridad:**
- Ruta protegida con autenticación
- Validación de rol de administrador
- Redirección automática al dashboard tras login exitoso

> [!WARNING]
> Solo usuarios con el rol `admin` en la base de datos pueden acceder al panel administrativo. Los usuarios regulares serán redirigidos a la página principal.

---

## 5. Panel de Administración

El panel de administración es el centro de control de toda la operación del e-commerce. Permite gestionar productos, pedidos, clientes, cupones y configuraciones.

### 5.1 Dashboard Principal

**Métricas principales:**
- **Ventas del periodo**: Monto total de ventas
- **Pedidos pendientes**: Número de órdenes sin procesar
- **Total de productos**: Inventario disponible
- **Alertas de stock**: Productos con stock bajo

**Gráficos y tablas:**
- **Ventas mensuales**: Gráfico de barras con evolución de ventas
- **Pedidos recientes**: Tabla con las últimas transacciones

### 5.2 Gestión de Pedidos

**Funcionalidades:**

| Función | Descripción |
|---------|-------------|
| **Filtrar por estado** | Pendiente, Procesando, Enviado, Entregado, Cancelado |
| **Búsqueda** | Por número de orden, email o nombre de cliente |
| **Exportar** | Descargar datos en formato CSV/Excel |
| **Ver detalles** | Información completa del pedido, productos y cliente |
| **Actualizar estado** | Cambiar el estado del pedido (ej: de "Pendiente" a "Procesando") |

**Información visible en la tabla:**
- Número de orden
- Cliente
- Fecha
- Estado
- Total
- Método de pago
- Acciones

### 5.3 Gestión de Productos

**Operaciones disponibles:**
- **Agregar nuevo producto**: Formulario completo con:
  - Nombre, descripción, precio
  - Categoría y subcategoría
  - Stock disponible
  - Imágenes del producto
  - SKU y código de barras
- **Editar producto**: Modificar información existente
- **Eliminar producto**: Remover del catálogo
- **Filtrar por categoría**: Indoor, Outdoor, Semillas, Nutrientes, etc.
- **Gestión de stock**: Actualizar cantidades disponibles

**Indicadores visuales:**
- **Stock bajo**: Alerta cuando el stock es menor a 10 unidades
- **Sin stock**: Productos agotados marcados en rojo
- **Activo/Inactivo**: Control de visibilidad en la tienda

### 5.4 Gestión de Cupones

**Tipos de cupones:**
- **Descuento porcentual**: % de descuento sobre el total
- **Descuento fijo**: Monto específico de descuento
- **Envío gratis**: Cupón para eliminar costo de envío

**Configuración de cupones:**
- Código del cupón (ej: VERANO2026)
- Tipo de descuento
- Valor del descuento
- Fecha de inicio y expiración
- Límite de usos (total y por usuario)
- Monto mínimo de compra

**Acciones:**
- Crear nuevo cupón
- Editar cupón existente
- Desactivar/Activar cupón
- Ver estadísticas de uso

### 5.5 Gestión de Envíos

**Configuración de zonas de envío:**
- **Regiones disponibles**: Listado de regiones de Chile
- **Tarifas por zona**: Precios diferenciados según ubicación
- **Tiempo estimado**: Días hábiles de entrega
- **Opciones de envío**: 
  - Envío estándar
  - Envío express
  - Retiro en tienda

**Gestión de transportistas:**
- Integración con servicios de courier
- Tracking de envíos
- Costos de envío por peso/volumen

### 5.6 Cola de Envíos

**Flujo de trabajo:**

1. **Pedidos pagados**: Aparecen automáticamente en la cola
2. **Preparar pedido**: Marcar productos como empaquetados
3. **Generar etiqueta**: Crear etiqueta de envío con datos del courier
4. **Asignar tracking**: Número de seguimiento
5. **Marcar como enviado**: Notificación automática al cliente
6. **Confirmar entrega**: Actualización final del estado

**Información visible:**
- Número de orden
- Cliente y dirección
- Productos a enviar
- Estado de preparación
- Courier asignado
- Número de tracking

### 5.7 Gestión de Clientes

**Base de datos de clientes:**
- Nombre completo
- Email de contacto
- Teléfono
- Fecha de registro
- Total de pedidos realizados
- Monto total gastado

**Funcionalidades:**
- **Búsqueda**: Por nombre, email o teléfono
- **Ver historial**: Todos los pedidos del cliente
- **Estadísticas**: Recurrencia, ticket promedio, última compra
- **Editar información**: Actualizar datos de contacto
- **Exportar datos**: Descargar base de clientes

**Segmentación:**
- Clientes nuevos (menos de 30 días)
- Clientes recurrentes (más de 3 compras)
- Clientes VIP (alto valor de compra)
- Clientes inactivos (sin compras en 90 días)

### 5.8 Configuración

**Secciones de configuración:**

**Perfil del Negocio**
- Nombre de la tienda
- Logo y favicon
- Información de contacto
- Dirección física
- Redes sociales

**E-commerce**
- Moneda (CLP)
- Impuestos (IVA 19%)
- Métodos de pago activos
- Política de devoluciones
- Términos y condiciones

**Notificaciones**
- Emails transaccionales
- Plantillas de correo
- Configuración SMTP
- Notificaciones push

**Integraciones**
- Mercado Pago (pagos)
- Google Analytics
- Facebook Pixel
- WhatsApp Business

**Seguridad**
- Cambiar contraseña de administrador
- Gestión de roles
- Registro de actividad (logs)
- Copias de seguridad

---

## Resumen de Características

### Para Usuarios:
✅ Navegación intuitiva por categorías  
✅ Búsqueda rápida de productos  
✅ Carrito de compras persistente  
✅ Registro y login sencillo  
✅ Checkout como invitado o usuario registrado  
✅ Múltiples métodos de pago  
✅ Seguimiento de pedidos  
✅ Historial de compras

### Para Administradores:
✅ Panel centralizado para toda la operación  
✅ Gestión completa de inventario  
✅ Control de pedidos y estados  
✅ Sistema de cupones y promociones  
✅ Gestión de envíos y tracking  
✅ Base de datos de clientes  
✅ Estadísticas y reportes  
✅ Configuración flexible del sistema

---

## Soporte Técnico

Para asistencia técnica o consultas sobre el uso de la plataforma:

- **Email**: soporte@conectados420.cl
- **WhatsApp**: +56 9 XXXX XXXX
- **Horario**: Lunes a Viernes, 9:00 - 18:00 hrs

---

*Manual generado para Conectados 420 Growshop - Versión 1.0 - Enero 2026*
