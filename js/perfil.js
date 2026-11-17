document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth('perfil.html')) return;

  const session = getCurrentUser();
  const users = getUsers();
  const user = users.find((item) => item.email.toLowerCase() === session.email.toLowerCase());

  if (!user) {
    logout();
    return;
  }

  const orders = getUserOrders(user.email);
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const lastOrder = orders[0]
    ? new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(orders[0].date))
    : 'Sin pedidos';

  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  const fillAccountNav = () => {
    document.getElementById('account-avatar').textContent = initials || 'AU';
    document.getElementById('account-name').textContent = user.name;
    document.getElementById('account-email').textContent = user.email;
  };

  fillAccountNav();

  document.getElementById('profile-stats').innerHTML = `
    <div class="stat-card"><span>Pedidos realizados</span><strong>${orders.length}</strong></div>
    <div class="stat-card"><span>Total gastado</span><strong>${formatPrice(totalSpent)}</strong></div>
    <div class="stat-card"><span>Último pedido</span><strong style="font-size:1.1rem;">${lastOrder}</strong></div>`;

  const fields = {
    name: document.getElementById('profile-name'),
    email: document.getElementById('profile-email'),
    phone: document.getElementById('profile-phone'),
    city: document.getElementById('profile-city'),
    address: document.getElementById('profile-address'),
    country: document.getElementById('profile-country')
  };

  fields.name.value = user.name;
  fields.email.value = user.email;
  fields.phone.value = user.phone || '';
  fields.city.value = user.city || '';
  fields.address.value = user.address || '';
  if ([...fields.country.options].some((option) => option.value === user.country)) {
    fields.country.value = user.country;
  }

  const form = document.getElementById('profile-form');
  const errorBox = document.getElementById('profile-error');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    errorBox.classList.remove('is-visible');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = fields.name.value.trim();
    if (name.length < 3) {
      errorBox.textContent = 'Ingresá tu nombre completo.';
      errorBox.classList.add('is-visible');
      return;
    }

    user.name = name;
    user.phone = fields.phone.value.trim();
    user.city = fields.city.value.trim();
    user.address = fields.address.value.trim();
    user.country = fields.country.value;

    saveUsers(users);
    setCurrentUser(user);
    fillAccountNav();
    renderHeader();
    toast('Tus datos se actualizaron correctamente.');
  });

  document.getElementById('logout-button').addEventListener('click', logout);
});
