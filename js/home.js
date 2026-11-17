document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('featured-grid');
  if (grid) {
    // Selección editorial: cuatro piezas, no el catálogo completo.
    const featuredIds = ['vestido-midi', 'blazer-minimal', 'camiseta-oversize', 'bolso-milan'];
    grid.innerHTML = featuredIds
      .map((id) => PRODUCTS.find((product) => product.id === id))
      .filter(Boolean)
      .map(productCard)
      .join('');
  }

  const newsletter = document.getElementById('newsletter-form');
  if (newsletter) {
    newsletter.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = newsletter.querySelector('input[type="email"]');
      if (!email.value.trim()) return;
      newsletter.reset();
      window.auraTrack?.('generate_lead', { method: 'newsletter' });
      toast('Gracias por suscribirte. Vas a recibir nuestras próximas novedades.');
    });
  }
});
