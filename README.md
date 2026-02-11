# Conectados 420 Growshop

> **La plataforma integral para el cultivador moderno.** Gestión de ventas, comunidad y administración especializada.

**Live:** https://nashishoo.github.io/Growshop-Ecommerce/

![Hero Section](https://i.postimg.cc/J7ccxcDG/hero-420.png)

## Sobre el Proyecto

**Conectados 420** es un e-commerce robusto diseñado específicamente para el rubro del cultivo ("Growshop"). No es solo una tienda online; es un ecosistema completo que integra:

- **Tienda Pública (Frontend):** Interfaz moderna, rápida y responsiva para clientes.
- **Panel de Administración (Backoffice):** Control total sobre inventario, pedidos, clientes y logística.
- **Backend Serverless:** Potenciado por Supabase para autenticación y base de datos en tiempo real.

> [!NOTE]
> **Inventario precargado:** El catálogo inicial de productos ha sido generado mediante un scraper desarrollado a medida, permitiendo desplegar la tienda con datos reales desde el día uno.

---

## Características Principales

### Para el Cliente

Una experiencia de compra fluida y confiable.

- **Navegación intuitiva:** Categorías claras (Indoor, Semillas, Parafernalia, etc.) y búsqueda instantánea.
- **Club 420:** Sistema de registro con beneficios exclusivos y seguimiento de historial.
- **Pagos seguros:** Integración nativa con **Mercado Pago**.
- **Notificaciones:** Emails automáticos de confirmación de pedido.

<div align="center">
  <img src="https://i.postimg.cc/L524mZMC/comprobante-pago-420.png" alt="Comprobante de Pago" width="45%" style="margin: 5px;" />
  <img src="https://i.postimg.cc/PJTfd8kR/login-420.png" alt="Login de Usuario" width="45%" style="margin: 5px;" />
</div>

### Para el Administrador

Un centro de comando para operar el negocio sin fricción.

- **Dashboard en tiempo real:** Métricas clave de ventas y stock.
- **Gestión de pedidos:** Flujo de estados (Pendiente -> Preparando -> Enviado).
- **Logística:** Configuración de zonas de envío y seguimiento de couriers.
- **Marketing:** Motor de cupones de descuento.

![Dashboard Admin](https://i.postimg.cc/gkzyTX83/admin-panel-dashboard.png)

---

## Galería del Sistema

### Plataforma de Ventas

| Productos Destacados | Ficha Destacada | Ficha Común |
|:---:|:---:|:---:|
| ![Destacados](https://i.postimg.cc/QChNjW3X/destacados-420.png) | ![Ficha Destacada](https://i.postimg.cc/cC01d8S0/destacado-modal-420.png) | ![Ficha Común](https://i.postimg.cc/fyDWM0Ns/modal-comun-420.png) |

| Banco Genético | Parafernalia |
|:---:|:---:|
| ![Semillas](https://i.postimg.cc/j2tqRJbR/banco-genetico-420.png) | ![Accesorios](https://i.postimg.cc/PJTfd8k0/parafernaria-420.png) |

### Panel de Administración

| Gestión de Productos | Cola de Envíos |
|:---:|:---:|
| ![Admin Productos](https://i.postimg.cc/wTq5GyLm/admin-panel-productos.png) | ![Admin Envíos](https://i.postimg.cc/3J8jc4m0/admin-panel-cola-envios.png) |

---

## Stack Tecnológico

El proyecto utiliza tecnologías modernas para garantizar rendimiento y escalabilidad.

- **Frontend:** React + Vite (velocidad y experiencia de desarrollo).
- **Estilos:** Tailwind CSS (diseño responsive y customización rápida).
- **Backend / DB:** Supabase (PostgreSQL, Auth, Edge Functions).
- **Pagos:** SDK de Mercado Pago.
- **Despliegue:** Compatible con Vercel / Netlify.

---

## Instalación y Despliegue Local

> [!TIP]
> **Recomendación:** Este proyecto tiene una arquitectura moderna y robusta. Si el proceso de despliegue te parece complejo, recomendamos usar un agente de IA para asistencia.

Sigue estos pasos para levantar el proyecto en tu entorno local.

### Prerrequisitos

- Node.js (v18+)
- Cuenta en Supabase
- Cuenta Developer en Mercado Pago (para credenciales de prueba)

### 1. Clonar el repositorio

```bash
git clone https://github.com/nashishoo/Growshop-Ecommerce.git
cd Growshop-Ecommerce
```

### 2. Instalar dependencias

```bash
cd frontend
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `frontend` basado en `.env.example`:

```env
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
VITE_MERCADOPAGO_PUBLIC_KEY=tu_public_key_mp
```

### 4. Configurar Base de Datos (Supabase)

Para tener la base de datos funcional con datos de prueba:

1. Ve al **SQL Editor** de tu proyecto en Supabase.
2. Copia y ejecuta el contenido de `supabase/schema_dump.sql` (crea la estructura).
3. Copia y ejecuta el contenido de `supabase/seed.sql` (pobla categorías, marcas y configuración).

### 5. Configurar Edge Functions (Automatización)

Para que funcionen los correos y los pagos, debes desplegar las funciones en Supabase:

1. Instala Supabase CLI: `npm i -g supabase`
2. Loguéate: `supabase login`
3. Vincula tu proyecto: `supabase link --project-ref tu_project_id`
4. Establece los secretos (credenciales privadas):

```bash
supabase secrets set MP_ACCESS_TOKEN=tu_access_token_mercadopago
supabase secrets set RESEND_API_KEY=tu_api_key_resend
supabase secrets set FROM_EMAIL="Tu Tienda <no-reply@tudominio.com>"
```

5. Despliega las funciones:

```bash
supabase functions deploy
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Documentación Adicional

- [Manual de Usuario Completo](docs/MANUAL_USUARIO.md): Guía detallada de uso para clientes y staff.
- [Configuración de Mercado Pago](docs/MERCADOPAGO_SETUP.md): Pasos para activar la pasarela de pagos.

---

Desarrollado con amor para la comunidad cultivadora.
