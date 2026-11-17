document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('checkout.html')) return;

  const content = document.getElementById('checkout-content');
  const form = document.getElementById('checkout-form');
  if (!content || !form) return;

  const lines = cartLines();
  if (!lines.length) {
    content.innerHTML = `
      <div class="empty-state">
        ${ICONS.bag}
        <h3>No hay productos para pagar</h3>
        <p>Agregá al menos un producto al carrito para continuar con el proceso de pago.</p>
        <a class="btn btn--primary btn--sm" href="catalogo.html">Ir al catálogo</a>
      </div>`;
    return;
  }

  const user = getCurrentUser();
  const subtotal = cartSubtotal();
  const shipping = cartShipping();
  const total = subtotal + shipping;

  document.getElementById('order-summary-items').innerHTML = lines.map((line) => `
    <div class="order-summary__item">
      <img src="${line.product.image}" alt="${escapeHtml(line.product.name)}" loading="lazy" decoding="async">
      <div>
        <h3>${escapeHtml(line.product.name)}</h3>
        <p>Talle ${escapeHtml(line.size)} · ${escapeHtml(line.color)} · x${line.qty}</p>
      </div>
      <strong>${formatPrice(line.product.price * line.qty)}</strong>
    </div>`).join('');

  document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
  const shippingEl = document.getElementById('summary-shipping');
  shippingEl.textContent = shipping === 0 ? 'Gratis' : formatPrice(shipping);
  document.getElementById('summary-shipping-row').classList.toggle('summary-row--free', shipping === 0);
  document.getElementById('summary-total').textContent = formatPrice(total);
  document.getElementById('confirm-order').textContent = `Confirmar pedido · ${formatPrice(total)}`;
  window.auraTrack?.('begin_checkout', {
    currency: 'USD',
    value: total,
    items: lines.map((line) => ({
      item_id: line.product.id,
      item_name: line.product.name,
      item_category: categoryName(line.product.category),
      item_variant: `${line.size} / ${line.color}`,
      price: line.product.price,
      quantity: line.qty
    }))
  });

  const setValue = (id, value) => {
    const field = document.getElementById(id);
    if (field && value) field.value = value;
  };

  setValue('checkout-name', user.name);
  setValue('checkout-email', user.email);
  setValue('checkout-phone', user.phone);
  setValue('checkout-address', user.address);
  setValue('checkout-city', user.city);
  const country = document.getElementById('checkout-country');
  if (user.country && [...country.options].some((option) => option.value === user.country)) {
    country.value = user.country;
  }

  const cardFields = document.getElementById('card-fields');
  const cardInputs = [...cardFields.querySelectorAll('input')];
  const radios = [...form.querySelectorAll('input[name="payment"]')];
  const errorBox = document.getElementById('checkout-error');

  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.classList.add('is-visible');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const updatePaymentUI = () => {
    const selected = form.querySelector('input[name="payment"]:checked').value;
    radios.forEach((radio) => {
      radio.closest('.payment-option').classList.toggle('is-active', radio.checked);
    });
    const isCard = selected === 'tarjeta';
    cardFields.classList.toggle('hidden', !isCard);
    cardInputs.forEach((input) => {
      input.required = isCard;
    });
  };

  radios.forEach((radio) => radio.addEventListener('change', updatePaymentUI));
  updatePaymentUI();

  const cardNumber = document.getElementById('card-number');
  const cardExpiry = document.getElementById('card-expiry');
  const cardCvv = document.getElementById('card-cvv');

  cardNumber.addEventListener('input', () => {
    cardNumber.value = cardNumber.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  });

  cardExpiry.addEventListener('input', () => {
    const digits = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
    cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  });

  cardCvv.addEventListener('input', () => {
    cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 4);
  });

  const generateOrderId = () => {
    const existing = new Set(getOrders().map((order) => order.id));
    let id = '';
    do {
      id = `AUR-${Math.floor(10000 + Math.random() * 90000)}`;
    } while (existing.has(id));
    return id;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    errorBox.classList.remove('is-visible');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payment = form.querySelector('input[name="payment"]:checked').value;

    if (payment === 'tarjeta') {
      if (cardNumber.value.replace(/\D/g, '').length !== 16) {
        showError('Ingresá un número de tarjeta válido de 16 dígitos.');
        return;
      }
      const expiryMatch = cardExpiry.value.match(/^(\d{2})\/(\d{2})$/);
      if (!expiryMatch || Number(expiryMatch[1]) < 1 || Number(expiryMatch[1]) > 12) {
        showError('Ingresá una fecha de vencimiento válida en formato MM/AA.');
        return;
      }
      if (cardCvv.value.length < 3) {
        showError('Ingresá el código de seguridad de la tarjeta.');
        return;
      }
    }

    const data = new FormData(form);
    const customer = {
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      phone: String(data.get('phone')).trim(),
      address: String(data.get('address')).trim(),
      city: String(data.get('city')).trim(),
      postal: String(data.get('postal')).trim(),
      country: String(data.get('country')),
      notes: String(data.get('notes') || '').trim()
    };

    const paymentLabels = {
      tarjeta: 'Tarjeta de crédito o débito',
      contraentrega: 'Pago contra entrega',
      transferencia: 'Transferencia bancaria'
    };

    const order = {
      id: generateOrderId(),
      date: new Date().toISOString(),
      status: 'En preparación',
      payment: paymentLabels[payment],
      email: customer.email.toLowerCase(),
      customer,
      items: lines.map((line) => ({
        id: line.product.id,
        name: line.product.name,
        price: line.product.price,
        image: line.product.image,
        size: line.size,
        color: line.color,
        qty: line.qty
      })),
      subtotal,
      shipping,
      total
    };

    const orders = getOrders();
    orders.push(order);
    saveOrders(orders);
    clearCart();
    window.location.href = `confirmacion.html?id=${encodeURIComponent(order.id)}`;
  });
});
