document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('auth-card');
  if (!card) return;
  const params = new URLSearchParams(window.location.search);
  const redirect = safeRedirect(params.get('redirect'), 'index.html');

  const currentUser = getCurrentUser();
  if (currentUser) {
    card.innerHTML = `
      <span class="eyebrow">Mi cuenta</span>
      <h1>Hola, ${escapeHtml(currentUser.name.split(' ')[0])}</h1>
      <p>Tu sesión está activa como <strong>${escapeHtml(currentUser.email)}</strong>.</p>
      <div class="auth-form" style="margin-top:1.6rem;">
        <a class="btn btn--primary btn--full" href="perfil.html">Ir a mi perfil</a>
        <a class="btn btn--ghost btn--full" href="pedidos.html">Ver mis pedidos</a>
        <button class="btn btn--ghost btn--full" type="button" id="logout-button">Cerrar sesión</button>
      </div>`;
    document.getElementById('logout-button').addEventListener('click', logout);
    return;
  }

  const form = document.getElementById('login-form');
  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  const errorBox = document.getElementById('login-error');

  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.classList.add('is-visible');
  };

  document.getElementById('demo-fill').addEventListener('click', () => {
    email.value = 'demo@aura.com';
    password.value = '123456';
    errorBox.classList.remove('is-visible');
    email.focus();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    errorBox.classList.remove('is-visible');

    if (!email.value.trim() || !password.value) {
      showError('Completá tu correo y contraseña para continuar.');
      return;
    }

    const user = getUsers().find((item) => (
      item.email.toLowerCase() === email.value.trim().toLowerCase() && item.password === password.value
    ));

    if (!user) {
      showError('Correo o contraseña incorrectos. Verificá tus datos o usá la cuenta de demostración.');
      return;
    }

    setCurrentUser(user);
    window.location.href = redirect;
  });
});
