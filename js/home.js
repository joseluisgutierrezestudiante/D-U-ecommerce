document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('featured-grid');
  if (grid) {
    grid.innerHTML = PRODUCTS.filter((product) => product.featured)
      .slice(0, 8)
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
      toast('Gracias por suscribirte. Revisá tu correo para recibir el cupón.');
    });
  }
});
