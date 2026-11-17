document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const product = findProduct(params.get('id'));
  const detail = document.getElementById('product-detail');
  const relatedSection = document.getElementById('related-section');
  const relatedGrid = document.getElementById('related-grid');
  const breadcrumbs = document.getElementById('breadcrumbs');

  if (!product) {
    breadcrumbs.innerHTML = '<a href="index.html">Inicio</a><span>/</span><a href="catalogo.html">Catálogo</a><span>/</span><span>Producto no encontrado</span>';
    detail.innerHTML = `
      <div class="empty-state" style="margin-top:2rem;">
        <h3>Producto no encontrado</h3>
        <p>El producto que buscás no existe o ya no está disponible.</p>
        <a class="btn btn--primary btn--sm" href="catalogo.html">Volver al catálogo</a>
      </div>`;
    relatedSection.classList.add('hidden');
    return;
  }

  document.title = `${product.name} | AURA`;
  window.auraTrack?.('view_item', {
    currency: 'USD',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: categoryName(product.category),
      price: product.price,
      quantity: 1
    }]
  });
  breadcrumbs.innerHTML = `
    <a href="index.html">Inicio</a><span>/</span>
    <a href="catalogo.html">Catálogo</a><span>/</span>
    <a href="catalogo.html?categoria=${product.category}">${categoryName(product.category)}</a><span>/</span>
    <span>${escapeHtml(product.name)}</span>`;

  const discount = product.oldPrice
    ? `<span class="product-info__save">-${Math.round((1 - product.price / product.oldPrice) * 100)}%</span>`
    : '';
  const soldOut = product.stock === false;

  const colors = product.colors.map((color, index) => `
    <button type="button" class="color-option${index === 0 ? ' is-active' : ''}" data-color="${escapeHtml(color.name)}">
      <i style="background:${color.hex}"></i>${escapeHtml(color.name)}
    </button>`).join('');

  const sizes = product.sizes.map((size) => `
    <button type="button" class="size-chip${product.sizes.length === 1 ? ' is-active' : ''}" data-size="${escapeHtml(size)}">${escapeHtml(size)}</button>`).join('');

  const positions = [
    { key: 'center', label: 'Vista frontal' },
    { key: 'top', label: 'Detalle superior' },
    { key: 'bottom', label: 'Detalle inferior' }
  ];

  detail.innerHTML = `
    <div class="product-detail__grid">
      <div class="product-gallery">
        <div class="product-gallery__main">
          <img id="product-main-image" src="${product.image}" alt="${escapeHtml(product.name)}" fetchpriority="high" decoding="async">
        </div>
        <div class="product-gallery__thumbs">
          ${positions.map((position, index) => `
            <img src="${product.image}" alt="${position.label} de ${escapeHtml(product.name)}" class="gallery-thumb${index === 0 ? ' is-active' : ''}" data-position="${position.key}" style="object-position:center ${position.key};" loading="lazy" decoding="async">`).join('')}
        </div>
      </div>

      <div class="product-info">
        <p class="product-info__category">${categoryName(product.category)}</p>
        <h1>${escapeHtml(product.name)}</h1>
        <div class="product-info__rating">
          ${stars(product.rating)}
          <span>${product.rating} · ${product.reviews} reseñas verificadas</span>
        </div>
        <div class="product-info__price">
          <span class="price__now">${formatPrice(product.price)}</span>
          ${product.oldPrice ? `<span class="price__old">${formatPrice(product.oldPrice)}</span>` : ''}
          ${discount}
        </div>
        <p class="product-info__desc">${escapeHtml(product.description)}</p>

        <div class="option-block">
          <div class="option-block__head">
            <h3>Color</h3>
            <span id="selected-color-label">${escapeHtml(product.colors[0].name)}</span>
          </div>
          <div class="color-options">${colors}</div>
        </div>

        <div class="option-block">
          <div class="option-block__head">
            <h3>Talle</h3>
            <span id="selected-size-label">${product.sizes.length === 1 ? 'Única' : 'Seleccioná un talle'}</span>
          </div>
          <div class="size-options">${sizes}</div>
        </div>

        <div class="option-block">
          <div class="option-block__head">
            <h3>Cantidad</h3>
          </div>
          <div class="qty-stepper">
            <button type="button" id="qty-minus" aria-label="Disminuir cantidad">−</button>
            <span id="qty-value">1</span>
            <button type="button" id="qty-plus" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>

        <div class="product-actions">
          <button class="btn btn--primary" type="button" id="add-to-cart"${soldOut ? ' disabled' : ''}>${soldOut ? 'Producto agotado' : 'Agregar al carrito'}</button>
          <button class="btn btn--ghost" type="button" id="buy-now"${soldOut ? ' disabled' : ''}>Comprar ahora</button>
        </div>
        ${soldOut ? `<p class="stock-note">Este producto está agotado por el momento. Volvé a visitarnos pronto.</p>` : ''}

        <div class="product-perks">
          <div>${ICONS.truck} Envío gratis en compras superiores a ${formatPrice(SHIPPING_THRESHOLD)}</div>
          <div>${ICONS.return} Devoluciones sin costo dentro de 30 días</div>
          <div>${ICONS.shield} Pago protegido y datos encriptados</div>
        </div>

        <div class="accordion">
          <details open>
            <summary>Detalles del producto</summary>
            <ul>${product.details.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
          </details>
          <details>
            <summary>Composición y cuidados</summary>
            <ul>
              <li>Seguí las instrucciones de la etiqueta interior.</li>
              <li>Lavar con agua fría y colores similares.</li>
              <li>No usar secadora para conservar la forma de la prenda.</li>
            </ul>
          </details>
          <details>
            <summary>Envío y devoluciones</summary>
            <ul>
              <li>Despacho en 24 a 48 horas hábiles.</li>
              <li>Entrega estimada: 3 a 6 días hábiles.</li>
              <li>Primer cambio sin costo presentando el número de pedido.</li>
            </ul>
          </details>
        </div>
      </div>
    </div>`;

  let selectedColor = product.colors[0].name;
  let selectedSize = product.sizes.length === 1 ? product.sizes[0] : null;
  let quantity = 1;

  const sizeLabel = document.getElementById('selected-size-label');
  const colorLabel = document.getElementById('selected-color-label');
  const qtyValue = document.getElementById('qty-value');

  detail.querySelectorAll('.color-option').forEach((button) => {
    button.addEventListener('click', () => {
      selectedColor = button.dataset.color;
      colorLabel.textContent = selectedColor;
      detail.querySelectorAll('.color-option').forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
    });
  });

  detail.querySelectorAll('.size-options .size-chip').forEach((button) => {
    button.addEventListener('click', () => {
      selectedSize = button.dataset.size;
      sizeLabel.textContent = selectedSize;
      detail.querySelectorAll('.size-options .size-chip').forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
    });
  });

  detail.querySelectorAll('.gallery-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const mainImage = document.getElementById('product-main-image');
      mainImage.style.objectPosition = `center ${thumb.dataset.position}`;
      detail.querySelectorAll('.gallery-thumb').forEach((item) => item.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
  });

  detail.querySelectorAll('.qty-stepper button').forEach((button) => {
    button.addEventListener('click', () => {
      const delta = button.id === 'qty-plus' ? 1 : -1;
      quantity = Math.min(10, Math.max(1, quantity + delta));
      qtyValue.textContent = quantity;
    });
  });

  const addCurrent = () => {
    if (soldOut) {
      toast('Este producto está agotado por el momento.', 'error');
      return false;
    }
    if (!selectedSize) {
      toast('Seleccioná un talle antes de continuar.', 'error');
      sizeLabel.style.color = 'var(--accent)';
      return false;
    }
    addToCart(product.id, selectedSize, selectedColor, quantity);
    return true;
  };

  document.getElementById('add-to-cart').addEventListener('click', addCurrent);
  document.getElementById('buy-now').addEventListener('click', () => {
    if (addCurrent()) window.location.href = 'carrito.html';
  });

  let related = PRODUCTS.filter((item) => item.category === product.category && item.id !== product.id);
  if (related.length < 4) {
    const extras = PRODUCTS.filter((item) => item.id !== product.id && !related.includes(item));
    related = related.concat(extras).slice(0, 4);
  }
  relatedGrid.innerHTML = related.slice(0, 4).map(productCard).join('');
  relatedSection.classList.remove('hidden');
});
