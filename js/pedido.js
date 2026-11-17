document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || '';

  if (!requireAuth(`pedido.html${window.location.search}`)) return;

  const user = getCurrentUser();
  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  document.getElementById('account-avatar').textContent = initials || 'AU';
  document.getElementById('account-name').textContent = user.name;
  document.getElementById('account-email').textContent = user.email;
  document.getElementById('logout-button').addEventListener('click', logout);

  const title = document.getElementById('order-title');
  const subtitle = document.getElementById('order-subtitle');
  const content = document.getElementById('order-detail-content');
  const order = getUserOrders(user.email).find((item) => item.id === id);

  if (!order) {
    title.textContent = 'Pedido no encontrado';
    subtitle.textContent = 'No pudimos encontrar este pedido en tu cuenta.';
    content.innerHTML = `
      <div class="empty-state">
        ${ICONS.bag}
        <h3>Pedido no disponible</h3>
        <p>El número de pedido no existe o no pertenece a tu cuenta.</p>
        <a class="btn btn--primary btn--sm" href="pedidos.html">Volver a mis pedidos</a>
      </div>`;
    return;
  }

  const longDate = new Intl.DateTimeFormat('es-PY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(order.date));

  title.textContent = `Pedido ${order.id}`;
  subtitle.innerHTML = `Realizado el ${longDate} · ${escapeHtml(order.payment)} · ${statusBadge(order.status)}`;

  const steps = ['En preparación', 'En camino', 'Entregado'];
  const doneCount = { 'En preparación': 1, 'En camino': 2, 'Entregado': 3 }[order.status] || 1;

  const timeline = steps.map((step, index) => (
    `<div class="timeline__step${index < doneCount ? ' is-done' : ''}">${step}</div>`
  )).join('');

  const items = order.items.map((item) => `
    <div class="order-item">
      <img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async">
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>Talle ${escapeHtml(item.size)} · ${escapeHtml(item.color)} · Cantidad: ${item.qty}</p>
      </div>
      <strong>${formatPrice(item.price * item.qty)}</strong>
    </div>`).join('');

  const notes = order.customer.notes
    ? `<div class="detail-block"><h3>Notas del pedido</h3><p>${escapeHtml(order.customer.notes)}</p></div>`
    : '';

  content.innerHTML = `
    <div>
      <h2 style="font-size:1.15rem;margin-bottom:1rem;">Estado del pedido</h2>
      <div class="timeline">${timeline}</div>
    </div>

    <div class="detail-grid">
      <div class="detail-block">
        <h3>Dirección de entrega</h3>
        <p>${escapeHtml(order.customer.name)}<br>${escapeHtml(order.customer.address)}<br>${escapeHtml(order.customer.city)}${order.customer.postal ? `, ${escapeHtml(order.customer.postal)}` : ''}<br>${escapeHtml(order.customer.country)}</p>
      </div>
      <div class="detail-block">
        <h3>Método de pago</h3>
        <p>${escapeHtml(order.payment)}<br>Total abonado: ${formatPrice(order.total)}</p>
      </div>
      <div class="detail-block">
        <h3>Contacto</h3>
        <p>${escapeHtml(order.customer.email)}<br>${escapeHtml(order.customer.phone || 'Sin teléfono registrado')}</p>
      </div>
      <div class="detail-block">
        <h3>Entrega estimada</h3>
        <p>${order.status === 'Entregado' ? 'Pedido entregado con éxito.' : '3 a 6 días hábiles desde la confirmación.'}</p>
      </div>
      ${notes}
    </div>

    <div>
      <h2 style="font-size:1.15rem;margin-bottom:0.6rem;">Productos del pedido</h2>
      <div class="order-items-list">${items}</div>
      <div class="totals" style="margin-top:1rem;">
        <div class="summary-row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
        <div class="summary-row"><span>Envío</span><span>${order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}</span></div>
        <div class="summary-total"><span>Total</span><strong>${formatPrice(order.total)}</strong></div>
      </div>
    </div>

    <div class="confirmation__actions" style="justify-content:flex-start;">
      <a class="btn btn--primary btn--sm" href="catalogo.html">Seguir comprando</a>
      <button class="btn btn--ghost btn--sm" type="button" onclick="window.print()">Imprimir comprobante</button>
    </div>`;
});
