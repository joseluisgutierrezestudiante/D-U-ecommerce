document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('pedidos.html')) return;

  const user = getCurrentUser();
  const orders = getUserOrders(user.email);
  const content = document.getElementById('orders-content');

  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  document.getElementById('account-avatar').textContent = initials || 'AU';
  document.getElementById('account-name').textContent = user.name;
  document.getElementById('account-email').textContent = user.email;
  document.getElementById('logout-button').addEventListener('click', logout);

  if (!orders.length) {
    content.innerHTML = `
      <div class="empty-state">
        ${ICONS.bag}
        <h3>Todavía no tenés pedidos</h3>
        <p>Cuando realices tu primera compra, vas a poder seguir su estado desde acá.</p>
        <a class="btn btn--primary btn--sm" href="catalogo.html">Explorar catálogo</a>
      </div>`;
    return;
  }

  const formatDate = (date) => new Intl.DateTimeFormat('es-PY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));

  content.innerHTML = `<div class="orders-list">${orders.map((order) => {
    const count = order.items.reduce((sum, item) => sum + item.qty, 0);
    const thumbs = order.items.slice(0, 3).map((item) => (
      `<img src="${item.image}" alt="${escapeHtml(item.name)}" title="${escapeHtml(item.name)}" loading="lazy" decoding="async">`
    )).join('');
    const extra = order.items.length > 3 ? `<span>+${order.items.length - 3}</span>` : '';
    return `
      <article class="order-card">
        <div class="order-card__head">
          <div>
            <span class="order-card__id">Pedido ${escapeHtml(order.id)}</span>
            <span class="order-card__date">· ${formatDate(order.date)}</span>
          </div>
          ${statusBadge(order.status)}
        </div>
        <div class="order-card__items">
          ${thumbs}${extra}
          <span>${count} ${count === 1 ? 'producto' : 'productos'}</span>
        </div>
        <div class="order-card__foot">
          <span class="muted">Total del pedido <strong style="color:var(--ink);">${formatPrice(order.total)}</strong></span>
          <a class="btn btn--ghost btn--sm" href="pedido.html?id=${encodeURIComponent(order.id)}">Ver detalle</a>
        </div>
      </article>`;
  }).join('')}</div>`;
});
