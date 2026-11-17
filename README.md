# AURA — E-commerce de moda contemporánea

AURA es una tienda de moda contemporánea desarrollada como proyecto académico con **HTML5, CSS3 y JavaScript ES6**, sin frameworks ni proceso de build. El objetivo es demostrar un flujo completo de comercio electrónico en el navegador: catálogo, detalle de producto, carrito, autenticación, checkout simulado y seguimiento de pedidos.

> **Estado:** demo frontend. No procesa pagos reales ni cuenta con servidor. La persistencia se realiza en `localStorage`.

---

## Stack

- **HTML5 semántico** con 14 páginas estáticas.
- **CSS3** con custom properties, Flexbox, CSS Grid y media queries.
- **JavaScript ES6** sin dependencias externas ni bundler.
- **Tipografías autoalojadas:** Cormorant Garamond y DM Sans (WOFF2, subset latin).
- **Persistencia:** `localStorage` (carrito, usuarios, sesión y pedidos).
- **Analítica opcional:** GA4 mediante `js/site-config.js`; desactivada por defecto.

---

## Estructura

```text
.
├── index.html                  # Landing
├── catalogo.html               # Catálogo con filtros y orden
├── producto.html               # Detalle de producto
├── carrito.html                # Carrito completo
├── checkout.html               # Checkout simulado
├── confirmacion.html           # Confirmación de pedido
├── pedidos.html                # Historial de pedidos
├── pedido.html                 # Detalle de un pedido
├── perfil.html                 # Datos de la cuenta
├── login.html / registro.html  # Autenticación demo
├── envios-devoluciones.html
├── privacidad.html
├── terminos.html
├── css/
│   ├── styles.css              # Tokens, tipografías, base y layout
│   ├── components.css          # Componentes compartidos y páginas
│   ├── responsive.css          # Breakpoints de las páginas internas
│   └── landing.css             # Composición editorial de index.html
├── js/
│   ├── data.js                 # Catálogo y configuración de envío
│   ├── main.js                 # Header, footer, carrito, auth y utilidades
│   ├── home.js / catalogo.js   # Lógica por página
│   ├── producto.js / cart.js
│   ├── checkout.js / pedidos.js / pedido.js
│   ├── login.js / registro.js / perfil.js
│   ├── confirmacion.js
│   ├── analytics.js
│   └── site-config.js
├── assets/
│   ├── fonts/                  # 4 archivos WOFF2
│   └── img/                    # Imágenes WebP + fallback JPG
├── robots.txt
└── sitemap.xml
```

---

## Dirección visual

La landing funciona como una portada editorial: fondo papel (`#F5F1EA`), superficie arena (`#EAE3D9`), vino (`#6B2938`) como acento, carbón (`#292724`) para texto y bronce (`#A58A72`) para detalles. Cormorant Garamond se reserva para títulos; DM Sans para navegación, textos, botones y precios.

La composición usa una grilla de 12 columnas, un hero 5/7, categorías asimétricas y una selección de cuatro productos. Los estilos exclusivos de la landing viven en `css/landing.css`; los componentes reutilizables siguen en `css/components.css`.

---

## Funcionalidades

- Catálogo con búsqueda, filtros por categoría, talle y precio, y ordenamiento.
- Detalle de producto con selección de color, talle y cantidad; productos agotados.
- Carrito lateral reutilizable y página de carrito con control de cantidades.
- Cálculo de subtotal, envío y total; envío gratis desde USD 75.
- Checkout con datos de envío, tres métodos de pago y validación de formulario.
- Registro e inicio de sesión de demostración.
- Historial y detalle de pedidos con estado y línea de tiempo.
- Perfil editable y cierre de sesión.
- Páginas legales de envíos, privacidad y términos.
- Newsletter de demostración con confirmación visual.

### Cuenta de demostración

```text
Correo: demo@aura.com
Contraseña: 123456
```

Los pedidos de ejemplo se generan automáticamente para esa cuenta.

---

## Ejecución local

No requiere instalación de dependencias. Desde la raíz del proyecto:

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000`.

También se puede usar cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

No abrir los archivos directamente con `file://`: `localStorage` y las rutas relativas pueden comportarse de forma distinta según el navegador.

---

## Datos y persistencia

Claves utilizadas en `localStorage`:

| Clave | Contenido |
|---|---|
| `aura_cart` | Líneas del carrito |
| `aura_users` | Usuarios registrados |
| `aura_session` | Sesión activa |
| `aura_orders` | Pedidos |

El catálogo vive en `js/data.js` y se renderiza en el cliente. No hay API ni base de datos.

---

## Accesibilidad y SEO

Implementado:

- Estructura semántica con `main`, secciones y jerarquía de encabezados.
- Atributos `alt` en imágenes, dimensiones explícitas y etiquetas asociadas en formularios.
- Enlace de salto al contenido y estilos globales de `:focus-visible`.
- Nombre accesible estable en el enlace del carrito.
- Header sticky corregido en todas las páginas.
- Navegación por teclado en enlaces, botones y formularios.
- `prefers-reduced-motion` para reducir animaciones.
- Metadatos `title` y `description` por página.
- `robots.txt` y `sitemap.xml`.

Limitaciones conocidas:

- El header y el footer se inyectan por JavaScript; sin JS no hay navegación ni contenido de catálogo.
- Las páginas de producto y catálogo no tienen contenido estático indexable ni datos estructurados.
- El carrito lateral aún no atrapa el foco ni lo devuelve al disparador.
- La galería de producto y los filtros del catálogo todavía requieren mejoras de teclado y estado accesible.

---

## Limitaciones técnicas

- **Sin backend:** autenticación, pedidos y checkout son simulados.
- **Contraseñas en texto plano** dentro de `localStorage`; no usar en producción.
- **Sin pasarela de pago:** los datos de tarjeta no se envían ni se almacenan.
- **Sin tests automatizados, linter ni proceso de build.**
- **Contenido y pruebas sociales de ejemplo:** no deben presentarse como datos reales.
- **Imágenes sin `srcset`:** se sirve el mismo archivo a todos los tamaños de pantalla.
- **Dominio de ejemplo** (`aura.com`) en `sitemap.xml`, `robots.txt` y configuración.

---

## Roadmap

1. Atrapar el foco del carrito lateral, devolverlo al disparador y cerrar con Escape.
2. Generar contenido estático o prerenderizado para catálogo y producto; metadatos canónicos, Open Graph y JSON-LD.
3. Sincronizar filtros del catálogo con la URL y comunicar su estado con `aria-pressed`.
4. Implementar imágenes responsive con `srcset` y `sizes`.
5. Separar `main.js` en módulos y dividir `components.css` en secciones documentadas.
6. Incorporar linting, tests y documentación de componentes.
7. Reemplazar la capa de datos por una API y autenticación reales para producción.

---

## Autor

Proyecto académico de comercio electrónico. Repositorio: [D-U-ecommerce](https://github.com/joseluisgutierrezestudiante/D-U-ecommerce).
