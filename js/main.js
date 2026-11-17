const STORE_KEYS = {
  cart: 'aura_cart',
  users: 'aura_users',
  session: 'aura_session',
  orders: 'aura_orders'
};

function readStore(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null || value === undefined ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function getUsers() {
  const users = readStore(STORE_KEYS.users, []);
  if (!users.some((user) => user.email === 'demo@aura.com')) {
    users.push({
      name: 'Ana Torres',
      email: 'demo@aura.com',
      password: '123456',
      phone: '+1 555 0142',
      address: 'Av. Central 245, Apto 3B',
      city: 'Ciudad del Este',
      country: 'Paraguay'
    });
    writeStore(STORE_KEYS.users, users);
  }
  return users;
}

function saveUsers(users) {
  writeStore(STORE_KEYS.users, users);
}

function getCurrentUser() {
  return readStore(STORE_KEYS.session, null);
}

function setCurrentUser(user) {
  writeStore(STORE_KEYS.session, {
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    country: user.country || ''
  });
}

function logout() {
  localStorage.removeItem(STORE_KEYS.session);
  window.location.href = 'index.html';
}

function getOrders() {
  const orders = readStore(STORE_KEYS.orders, []);
  if (!orders.length) {
    const seeded = seedOrders();
    if (seeded.length) {
      writeStore(STORE_KEYS.orders, seeded);
      return seeded;
    }
  }
  return orders;
}

function seedOrders() {
  const itemA = findProduct('camiseta-oversize');
  const itemB = findProduct('jeans-rectos');
  const itemC = findProduct('bolso-milan');
  if (!itemA || !itemB || !itemC) return [];
  const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString();
  return [
    {
      id: 'AUR-84021',
      date: daysAgo(2),
      status: 'En camino',
      payment: 'Tarjeta de crédito',
      email: 'demo@aura.com',
      customer: { name: 'Ana Torres', email: 'demo@aura.com', phone: '+1 555 0142', address: 'Av. Central 245, Apto 3B', city: 'Ciudad del Este', country: 'Paraguay' },
      items: [
        { id: itemC.id, name: itemC.name, price: itemC.price, image: itemC.image, size: 'Única', color: 'Camel', qty: 1 }
      ],
      subtotal: itemC.price,
      shipping: SHIPPING_COST,
      total: itemC.price + SHIPPING_COST
    },
    {
      id: 'AUR-71854',
      date: daysAgo(14),
      status: 'Entregado',
      payment: 'Pago contra entrega',
      email: 'demo@aura.com',
      customer: { name: 'Ana Torres', email: 'demo@aura.com', phone: '+1 555 0142', address: 'Av. Central 245, Apto 3B', city: 'Ciudad del Este', country: 'Paraguay' },
      items: [
        { id: itemA.id, name: itemA.name, price: itemA.price, image: itemA.image, size: 'M', color: 'Negro', qty: 1 },
        { id: itemB.id, name: itemB.name, price: itemB.price, image: itemB.image, size: '32', color: 'Azul medio', qty: 1 }
      ],
      subtotal: itemA.price + itemB.price,
      shipping: 0,
      total: itemA.price + itemB.price
    }
  ];
}

function saveOrders(orders) {
  writeStore(STORE_KEYS.orders, orders);
}

function getUserOrders(email) {
  return getOrders()
    .filter((order) => order.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function orderStatusClass(status) {
  const map = {
    'En camino': 'camino',
    'Entregado': 'entregado',
    'En preparación': 'preparacion'
  };
  return `status-badge--${map[status] || 'preparacion'}`;
}

function statusBadge(status) {
  return `<span class="status-badge ${orderStatusClass(status)}">${escapeHtml(status)}</span>`;
}

function getOrder(id) {
  return getOrders().find((order) => order.id === id);
}

function getCart() {
  const cart = readStore(STORE_KEYS.cart, []);
  return Array.isArray(cart) ? cart : [];
}

function saveCart(cart) {
  writeStore(STORE_KEYS.cart, cart);
  updateCartCount();
}

function cartLines() {
  return getCart()
    .map((item, index) => ({ ...item, index, product: findProduct(item.id) }))
    .filter((line) => line.product);
}

function cartCount() {
  return getCart().reduce((total, item) => total + (Number(item.qty) || 0), 0);
}

function cartSubtotal() {
  return cartLines().reduce((total, line) => total + line.product.price * line.qty, 0);
}

function cartShipping() {
  const subtotal = cartSubtotal();
  return subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

function addToCart(productId, size, color, qty) {
  const product = findProduct(productId);
  if (!product) return;
  if (product.stock === false) {
    toast('Este producto está agotado por el momento.', 'error');
    return;
  }
  const quantity = Math.max(1, Number(qty) || 1);
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId && item.size === size && item.color === color);
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({ id: productId, size, color, qty: quantity });
  }
  saveCart(cart);
  window.auraTrack?.('add_to_cart', {
    currency: 'USD',
    value: Number((product.price * quantity).toFixed(2)),
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: categoryName(product.category),
      item_variant: `${size} / ${color}`,
      price: product.price,
      quantity
    }]
  });
  toast(`${product.name} se agregó al carrito`);
}

function removeCartLine(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateCartLineQty(index, qty) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, Number(qty) || 1);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function updateCartCount() {
  const count = cartCount();
  document.querySelectorAll('.cart-count').forEach((badge) => {
    badge.textContent = count;
    badge.classList.toggle('is-empty', count === 0);
  });
  const drawer = document.getElementById('cart-drawer');
  if (drawer && drawer.classList.contains('is-open')) renderCartDrawer();
}

function initCartDrawer() {
  if (document.getElementById('cart-drawer')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'cart-drawer__backdrop';
  backdrop.setAttribute('data-cart-close', '');
  backdrop.innerHTML = `
    <aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Carrito de compras" aria-hidden="true">
      <header class="cart-drawer__header">
        <div>
          <p class="eyebrow">Tu selección</p>
          <h2>Carrito <span id="drawer-count">(0)</span></h2>
        </div>
        <button class="cart-drawer__close" type="button" data-cart-close aria-label="Cerrar carrito">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </header>
      <div class="cart-drawer__body" id="cart-drawer-body"></div>
      <footer class="cart-drawer__footer" id="cart-drawer-footer"></footer>
    </aside>`;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', (event) => {
    if (event.target.closest('[data-cart-close]')) closeCartDrawer();
  });
  document.getElementById('cart-drawer-body').addEventListener('click', (event) => {
    const remove = event.target.closest('[data-drawer-remove]');
    if (remove) {
      removeCartLine(Number(remove.dataset.drawerRemove));
      renderCartDrawer();
      toast('Producto eliminado del carrito');
      return;
    }
    const action = event.target.closest('[data-drawer-action]');
    if (action) {
      const index = Number(action.dataset.index);
      const line = getCart()[index];
      if (!line) return;
      if (action.dataset.drawerAction === 'dec' && line.qty <= 1) {
        removeCartLine(index);
      } else {
        updateCartLineQty(index, line.qty + (action.dataset.drawerAction === 'inc' ? 1 : -1));
      }
      renderCartDrawer();
    }
  });
  document.addEventListener('keydown', (event) => {
    const drawer = document.getElementById('cart-drawer');
    if (event.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeCartDrawer();
  });
}

function renderCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  const body = document.getElementById('cart-drawer-body');
  const footer = document.getElementById('cart-drawer-footer');
  const lines = cartLines();
  document.getElementById('drawer-count').textContent = `(${cartCount()})`;

  if (!lines.length) {
    body.innerHTML = `
      <div class="cart-drawer__empty">
        ${ICONS.bag}
        <h3>Tu carrito está vacío</h3>
        <p>Explorá el catálogo y encontrá tu próximo favorito.</p>
        <a class="btn btn--primary btn--sm" href="catalogo.html">Ir al catálogo</a>
      </div>`;
    footer.innerHTML = '';
    return;
  }

  body.innerHTML = `<div class="cart-drawer__list">${lines.map((line) => `
    <article class="cart-drawer__item">
      <a class="cart-drawer__thumb" href="producto.html?id=${line.product.id}">
        <img src="${line.product.image}" alt="${escapeHtml(line.product.name)}" loading="lazy" decoding="async">
      </a>
      <div class="cart-drawer__info">
        <p class="cart-drawer__name"><a href="producto.html?id=${line.product.id}">${escapeHtml(line.product.name)}</a></p>
        <p class="cart-drawer__variant">Talle ${escapeHtml(line.size)} · ${escapeHtml(line.color)}</p>
        <div class="cart-drawer__controls">
          <div class="drawer-qty">
            <button type="button" data-drawer-action="dec" data-index="${line.index}" aria-label="Disminuir cantidad">−</button>
            <span>${line.qty}</span>
            <button type="button" data-drawer-action="inc" data-index="${line.index}" aria-label="Aumentar cantidad">+</button>
          </div>
          <button type="button" class="cart-drawer__remove" data-drawer-remove="${line.index}">Quitar</button>
        </div>
      </div>
      <strong class="cart-drawer__price">${formatPrice(line.product.price * line.qty)}</strong>
    </article>`).join('')}</div>`;

  const subtotal = cartSubtotal();
  const shipping = cartShipping();
  const remaining = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  footer.innerHTML = `
    <div class="summary-rows cart-drawer__rows">
      <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      <div class="summary-row${shipping === 0 ? ' summary-row--free' : ''}"><span>Envío</span><span>${shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span></div>
    </div>
    <div class="summary-total"><span>Total</span><strong>${formatPrice(subtotal + shipping)}</strong></div>
    ${remaining > 0 ? `<p class="shipping-hint">Agregá <strong>${formatPrice(remaining)}</strong> más y obtené envío gratis.</p>` : ''}
    <div class="cart-drawer__actions">
      <a class="btn btn--ghost" href="carrito.html">Ver carrito</a>
      <a class="btn btn--primary" href="checkout.html">Finalizar compra</a>
    </div>`;
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  renderCartDrawer();
  drawer.parentElement.classList.add('is-open');
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
  const closeButton = drawer.querySelector('.cart-drawer__close');
  if (closeButton) closeButton.focus();
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  drawer.parentElement.classList.remove('is-open');
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
}

function requireAuth(next) {
  if (getCurrentUser()) return true;
  const target = next || window.location.href.split('/').pop();
  window.location.replace(`login.html?redirect=${encodeURIComponent(target)}`);
  return false;
}

function safeRedirect(value, fallback) {
  if (value && /^[a-z0-9_-]+\.html(\?[a-z0-9_=&%-]*)?$/i.test(value)) return value;
  return fallback || 'index.html';
}

function stars(rating) {
  const full = Math.round(Number(rating) || 0);
  return `<span class="stars" aria-label="${rating} de 5 estrellas"><span>${'★'.repeat(full)}</span><span class="stars__empty">${'★'.repeat(5 - full)}</span></span>`;
}

function badgeClass(badge) {
  const value = String(badge).toLowerCase();
  if (value.includes('agotado')) return 'badge--soldout';
  if (value.includes('nuevo')) return 'badge--new';
  if (value.includes('%') || value.includes('off')) return 'badge--sale';
  if (value.includes('limitada')) return 'badge--limited';
  if (value.includes('top')) return 'badge--top';
  return 'badge--neutral';
}

function productCard(product) {
  const oldPrice = product.oldPrice
    ? `<span class="price__old">${formatPrice(product.oldPrice)}</span>`
    : '';
  const badge = product.badge
    ? `<span class="badge ${badgeClass(product.badge)}">${escapeHtml(product.badge)}</span>`
    : '';
  const quickAdd = product.stock === false
    ? '<span class="quick-add quick-add--soldout">Agotado</span>'
    : `<button class="quick-add" type="button" data-quick-add="${product.id}">Agregar rápido</button>`;
  return `
    <article class="product-card">
      <div class="product-card__media">
        <a href="producto.html?id=${product.id}" aria-label="Ver ${escapeHtml(product.name)}">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async">
        </a>
        ${badge}
        ${quickAdd}
      </div>
      <div class="product-card__body">
        <p class="product-card__category">${categoryName(product.category)}</p>
        <h3 class="product-card__title"><a href="producto.html?id=${product.id}">${escapeHtml(product.name)}</a></h3>
        <div class="product-card__meta">${stars(product.rating)}<span>(${product.reviews})</span></div>
        <p class="price"><span class="price__now">${formatPrice(product.price)}</span>${oldPrice}</p>
      </div>
    </article>`;
}

function productImage(product, size) {
  return `<img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async"${size ? ` width="${size}"` : ''}>`;
}

const ICONS = {
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/></svg>',
  return: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h11a4 4 0 0 1 0 8H8"/><path d="m8 5-4 4 4 4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/></svg>'
};

function renderHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const page = document.body.dataset.page || '';
  const user = getCurrentUser();
  const firstName = user ? user.name.split(' ')[0] : '';
  const accountHref = user ? 'perfil.html' : 'login.html';
  const isAccount = ['perfil', 'login', 'registro'].includes(page);
  const isOrders = ['pedidos', 'pedido'].includes(page);
  const navLink = (target, label, pageNames) => {
    const active = pageNames.includes(page);
    return `<a href="${target}" class="nav-link${active ? ' is-active' : ''}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
  };
  header.innerHTML = `
    <div class="topbar">
      <div class="container topbar__inner">
        <p>Envío gratis en pedidos superiores a ${formatPrice(SHIPPING_THRESHOLD)}</p>
        <p>Devoluciones sin costo durante 30 días</p>
      </div>
    </div>
    <div class="header">
      <div class="container header__inner">
        <button class="menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="main-nav">
          <span></span><span></span><span></span>
        </button>
        <a class="brand" href="index.html" aria-label="AURA inicio">AURA<span class="brand__dot">.</span></a>
        <nav class="main-nav" id="main-nav" aria-label="Navegación principal">
          ${navLink('index.html', 'Inicio', ['home'])}
          ${navLink('catalogo.html', 'Catálogo', ['catalogo', 'producto'])}
          <a href="catalogo.html?categoria=mujer" class="nav-link">Mujer</a>
          <a href="catalogo.html?categoria=hombre" class="nav-link">Hombre</a>
          <a href="catalogo.html?categoria=accesorios" class="nav-link">Accesorios</a>
          ${user ? `<a href="pedidos.html" class="nav-link${isOrders ? ' is-active' : ''}">Mis pedidos</a>` : ''}
          <form class="search-form search-form--mobile" action="catalogo.html" method="get" role="search">
            <input type="search" name="q" placeholder="Buscar productos" aria-label="Buscar productos">
            <button type="submit" aria-label="Buscar">${ICONS.search}</button>
          </form>
        </nav>
        <div class="header__actions">
          <form class="search-form" action="catalogo.html" method="get" role="search">
            <input type="search" name="q" placeholder="Buscar..." aria-label="Buscar productos">
            <button type="submit" aria-label="Buscar">${ICONS.search}</button>
          </form>
          <a href="${accountHref}" class="icon-btn${isAccount ? ' is-active' : ''}" title="${user ? 'Mi perfil' : 'Iniciar sesión'}">
            ${ICONS.user}
            <span class="icon-btn__label">${user ? escapeHtml(firstName) : 'Cuenta'}</span>
          </a>
          <a href="carrito.html" class="icon-btn${page === 'carrito' ? ' is-active' : ''}" aria-label="Abrir carrito de compras" title="Carrito de compras" aria-haspopup="dialog">
            ${ICONS.bag}
            <span class="cart-count is-empty">0</span>
          </a>
        </div>
      </div>
    </div>`;
  updateCartCount();
  const toggle = header.querySelector('.menu-toggle');
  const nav = header.querySelector('.main-nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    toggle.focus();
  });
  const cartLink = header.querySelector('.header__actions a[href="carrito.html"]');
  if (cartLink) {
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      openCartDrawer();
    });
  }
}

function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  const user = getCurrentUser();
  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <a class="brand brand--light" href="index.html">AURA<span class="brand__dot">.</span></a>
            <p>Moda contemporánea pensada para durar. Diseños atemporales y envíos a todo el país.</p>
          </div>
          <div class="footer__col">
            <h4>Tienda</h4>
            <a href="catalogo.html">Catálogo</a>
            <a href="catalogo.html?categoria=mujer">Mujer</a>
            <a href="catalogo.html?categoria=hombre">Hombre</a>
            <a href="catalogo.html?categoria=accesorios">Accesorios</a>
          </div>
          <div class="footer__col">
            <h4>Ayuda</h4>
            <a href="envios-devoluciones.html">Envíos y entregas</a>
            <a href="envios-devoluciones.html#devoluciones">Cambios y devoluciones</a>
            <a href="terminos.html">Términos y condiciones</a>
            <a href="privacidad.html">Política de privacidad</a>
          </div>
          <div class="footer__col">
            <h4>Cuenta</h4>
            ${user ? `<a href="perfil.html">Mi perfil</a><a href="pedidos.html">Mis pedidos</a><a href="carrito.html">Mi carrito</a>` : `<a href="login.html">Iniciar sesión</a><a href="registro.html">Crear cuenta</a><a href="pedidos.html">Mis pedidos</a>`}
          </div>
        </div>
        <div class="footer__bottom">
          <div>
            <p>© ${new Date().getFullYear()} AURA. Todos los derechos reservados.</p>
            <p class="footer__legal">
              <a href="terminos.html">Términos</a>
              <a href="privacidad.html">Privacidad</a>
              <a href="envios-devoluciones.html">Envíos y devoluciones</a>
            </p>
          </div>
          <p>Proyecto académico de comercio electrónico · HTML, CSS y JavaScript</p>
        </div>
      </div>
    </footer>`;
}

let toastTimer;
function toast(message, type) {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('role', 'status');
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
  }
  const element = document.createElement('div');
  element.className = `toast${type === 'error' ? ' toast--error' : ''}`;
  element.innerHTML = `<span class="toast__icon">${type === 'error' ? '!' : ICONS.check}</span><p>${escapeHtml(message)}</p><span class="toast__progress" aria-hidden="true"></span>`;
  stack.appendChild(element);
  clearTimeout(toastTimer);
  setTimeout(() => element.classList.add('is-visible'), 10);
  setTimeout(() => {
    element.classList.remove('is-visible');
    setTimeout(() => element.remove(), 300);
  }, 3200);
}

document.addEventListener('click', (event) => {
  const quickAdd = event.target.closest('[data-quick-add]');
  if (quickAdd) {
    const product = findProduct(quickAdd.dataset.quickAdd);
    if (product) addToCart(product.id, product.sizes[0], product.colors[0].name, 1);
  }
});

/*
 * Fondo de puntos con brillo (canvas).
 * Adaptación nativa del componente Dotted Glow Background de Aceternity UI
 * a HTML/CSS/JS sin dependencias, con la paleta de AURA.
 */
function initDottedGlow() {
  const canvas = document.querySelector('[data-dotted-glow]');
  if (!canvas) return;
  const host = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  if (!host || !ctx) return;

  const settings = {
    gap: 30,
    radius: 1.4,
    color: 'rgba(36, 35, 33, 0.75)',
    glowColor: 'rgba(100, 45, 56, 0.5)',
    opacity: 0.5,
    speedMin: 0.25,
    speedMax: 0.85
  };
  const TAU = Math.PI * 2;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const glowSprite = document.createElement('canvas');
  glowSprite.width = 64;
  glowSprite.height = 64;
  const glowCtx = glowSprite.getContext('2d');
  if (glowCtx) {
    const gradient = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, settings.glowColor);
    gradient.addColorStop(0.45, 'rgba(100, 45, 56, 0.16)');
    gradient.addColorStop(1, 'rgba(100, 45, 56, 0)');
    glowCtx.fillStyle = gradient;
    glowCtx.fillRect(0, 0, 64, 64);
  }

  let dots = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let visible = true;

  const buildDots = () => {
    dots = [];
    const cols = Math.ceil(width / settings.gap) + 2;
    const rows = Math.ceil(height / settings.gap) + 2;
    for (let i = -1; i < cols; i += 1) {
      for (let j = -1; j < rows; j += 1) {
        dots.push({
          x: i * settings.gap + (j % 2 === 0 ? 0 : settings.gap / 2),
          y: j * settings.gap,
          phase: Math.random() * TAU,
          speed: settings.speedMin + Math.random() * (settings.speedMax - settings.speedMin)
        });
      }
    }
  };

  const paint = (time) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = settings.color;

    for (const dot of dots) {
      const wave = (time * dot.speed + dot.phase) % 2;
      const glowAmount = wave < 1 ? wave : 2 - wave;
      const alpha = 0.25 + 0.55 * glowAmount;

      ctx.globalAlpha = alpha * settings.opacity;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, settings.radius, 0, TAU);
      ctx.fill();

      if (alpha > 0.6 && glowCtx) {
        const strength = (alpha - 0.6) / 0.4;
        ctx.globalAlpha = strength * settings.opacity;
        ctx.drawImage(glowSprite, dot.x - 16, dot.y - 16, 32, 32);
      }
    }

    ctx.globalAlpha = 1;
  };

  const renderStatic = () => {
    cancelAnimationFrame(frame);
    paint(0);
  };

  const renderLoop = (now) => {
    if (!visible) {
      frame = requestAnimationFrame(renderLoop);
      return;
    }
    paint(now / 1000);
    frame = requestAnimationFrame(renderLoop);
  };

  const start = () => {
    cancelAnimationFrame(frame);
    if (motionQuery.matches) {
      renderStatic();
      return;
    }
    frame = requestAnimationFrame(renderLoop);
  };

  const resize = () => {
    const rect = host.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildDots();
    start();
  };

  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }, { threshold: 0 }).observe(host);

  motionQuery.addEventListener('change', start);
  resize();
}

document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  renderHeader();
  renderFooter();
  updateCartCount();
  initDottedGlow();
});
