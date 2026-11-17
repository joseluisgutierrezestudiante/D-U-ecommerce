document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('cart-content');
  if (!content) return;

  const renderEmpty = () => {
    content.innerHTML = `
      <div class="empty-state">
        ${ICONS.bag}
        <h3>Tu carrito está vacío</h3>
        <p>Todavía no agregaste productos. Explorá el catálogo y encontrá tu próximo favorito.</p>
        <a class="btn btn--primary btn--sm" href="catalogo.html">Ir al catálogo</a>
      </div>`;
  };

  const renderCart = () => {
    const lines = cartLines();
    if (!lines.length) {
      renderEmpty();
      updateCartCount();
      return;
    }

    const subtotal = cartSubtotal();
    const shipping = cartShipping();
    const total = subtotal + shipping;
    const remaining = Math.max(0, SHIPPING_THRESHOLD - subtotal);

    const items = lines.map((line) => `
      <article class="cart-line">
        <a class="cart-line__image" href="producto.html?id=${line.product.id}">
          <img src="${line.product.image}" alt="${escapeHtml(line.product.name)}" loading="lazy" decoding="async">
        </a>
        <div class="cart-line__info">
          <p class="cart-line__category">${categoryName(line.product.category)}</p>
          <h3 class="cart-line__name"><a href="producto.html?id=${line.product.id}">${escapeHtml(line.product.name)}</a></h3>
          <p class="cart-line__variant">Talle ${escapeHtml(line.size)} · Color ${escapeHtml(line.color)}</p>
          <div class="cart-line__bottom">
            <div class="qty-stepper">
              <button type="button" data-cart-action="dec" data-index="${line.index}" aria-label="Disminuir cantidad">−</button>
              <span>${line.qty}</span>
              <button type="button" data-cart-action="inc" data-index="${line.index}" aria-label="Aumentar cantidad">+</button>
            </div>
            <button type="button" class="cart-line__remove" data-cart-remove="${line.index}">Eliminar</button>
          </div>
        </div>
        <div class="cart-line__price">
          <strong>${formatPrice(line.product.price * line.qty)}</strong>
          <span>${formatPrice(line.product.price)} c/u</span>
        </div>
      </article>`).join('');

    const hint = remaining > 0
      ? `<p class="shipping-hint">Agregá <strong>${formatPrice(remaining)}</strong> más y obtené envío gratis en tu pedido.</p>`
      : '';

    content.innerHTML = `
      <div class="cart-layout">
        <div>
          <div class="cart-list">${items}</div>
          <a class="btn btn--ghost cart-continue" href="catalogo.html">Seguir comprando</a>
        </div>
        <aside class="summary-card">
          <h2>Resumen del pedido</h2>
          <div class="summary-rows">
            <div class="summary-row">
              <span>Subtotal (${cartCount()} ${cartCount() === 1 ? 'artículo' : 'artículos'})</span>
              <span>${formatPrice(subtotal)}</span>
            </div>
            <div class="summary-row${shipping === 0 ? ' summary-row--free' : ''}">
              <span>Envío</span>
              <span>${shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
            </div>
          </div>
          <div class="summary-total">
            <span>Total</span>
            <strong>${formatPrice(total)}</strong>
          </div>
          <a class="btn btn--primary btn--full" href="checkout.html">Finalizar compra</a>
          <p class="summary-note">${ICONS.shield} Pago seguro y protegido</p>
          ${hint}
        </aside>
      </div>`;
    updateCartCount();
  };

  content.addEventListener('click', (event) => {
    const action = event.target.closest('[data-cart-action]');
    if (action) {
      const index = Number(action.dataset.index);
      const line = getCart()[index];
      if (!line) return;
      if (action.dataset.cartAction === 'dec' && line.qty <= 1) {
        removeCartLine(index);
        toast('Producto eliminado del carrito');
      } else {
        updateCartLineQty(index, line.qty + (action.dataset.cartAction === 'inc' ? 1 : -1));
      }
      renderCart();
    }

    const remove = event.target.closest('[data-cart-remove]');
    if (remove) {
      removeCartLine(Number(remove.dataset.cartRemove));
      toast('Producto eliminado del carrito');
      renderCart();
    }
  });

  renderCart();
});
