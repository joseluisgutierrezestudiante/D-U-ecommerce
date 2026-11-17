document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('confirmation-content');
  if (!content) return;

  const params = new URLSearchParams(window.location.search);
  const order = getOrder(params.get('id'));

  if (!order) {
    content.innerHTML = `
      <div class="confirmation__card">
        <h1>No encontramos ese pedido</h1>
        <p class="confirmation__lead">El número de pedido no existe o no está disponible. Podés revisar tus pedidos desde tu cuenta.</p>
        <div class="confirmation__actions">
          <a class="btn btn--primary" href="pedidos.html">Ver mis pedidos</a>
          <a class="btn btn--ghost" href="catalogo.html">Ir al catálogo</a>
        </div>
      </div>`;
    return;
  }

  const firstName = order.customer.name.split(' ')[0];
  window.auraTrack?.('purchase', {
    transaction_id: order.id,
    currency: 'USD',
    value: order.total,
    shipping: order.shipping,
    items: order.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      item_variant: `${item.size} / ${item.color}`,
      price: item.price,
      quantity: item.qty
    }))
  });
  const dateLabel = new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(order.date));
  const items = order.items.map((item) => `
    <div class="order-item">
      <img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async">
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>Talle ${escapeHtml(item.size)} · ${escapeHtml(item.color)} · Cantidad: ${item.qty}</p>
      </div>
      <strong>${formatPrice(item.price * item.qty)}</strong>
    </div>`).join('');

  content.innerHTML = `
    <div class="confirmation__card">
      <div class="confirmation__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>
      </div>
      <span class="eyebrow">Pedido confirmado</span>
      <h1>¡Gracias por tu compra, ${escapeHtml(firstName)}!</h1>
      <p class="confirmation__lead">Tu pedido fue registrado correctamente. Enviamos la confirmación y el seguimiento a <strong>${escapeHtml(order.customer.email)}</strong>.</p>
      <div class="confirmation__number">Número de pedido <strong>${escapeHtml(order.id)}</strong></div>
      <p class="muted" style="margin-top:0.7rem;font-size:0.78rem;">Realizado el ${dateLabel} · Estado: <span class="status-badge status-badge--preparacion">${escapeHtml(order.status)}</span></p>

      <div class="confirmation__grid">
        <div class="confirmation__block">
          <h3>Dirección de entrega</h3>
          <p>${escapeHtml(order.customer.name)}<br>${escapeHtml(order.customer.address)}<br>${escapeHtml(order.customer.city)}${order.customer.postal ? `, ${escapeHtml(order.customer.postal)}` : ''}<br>${escapeHtml(order.customer.country)}</p>
        </div>
        <div class="confirmation__block">
          <h3>Método de pago</h3>
          <p>${escapeHtml(order.payment)}</p>
        </div>
        <div class="confirmation__block">
          <h3>Entrega estimada</h3>
          <p>3 a 6 días hábiles<br>Te avisaremos cuando el pedido esté en camino.</p>
        </div>
        <div class="confirmation__block">
          <h3>Contacto</h3>
          <p>${escapeHtml(order.customer.email)}<br>${escapeHtml(order.customer.phone || '')}</p>
        </div>
      </div>

      <div class="order-items-list" style="text-align:left;">${items}</div>
      <div class="totals" style="margin-top:1rem;">
        <div class="summary-row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
        <div class="summary-row"><span>Envío</span><span>${order.shipping === 0 ? 'Gratis' : formatPrice(order.shipping)}</span></div>
        <div class="summary-total"><span>Total</span><strong>${formatPrice(order.total)}</strong></div>
      </div>

      <div class="confirmation__actions" style="margin-top:2rem;">
        <a class="btn btn--primary" href="pedidos.html">Ver mis pedidos</a>
        <a class="btn btn--ghost" href="catalogo.html">Seguir comprando</a>
        <button class="btn btn--ghost" type="button" onclick="window.print()">Imprimir comprobante</button>
      </div>
    </div>`;
});
