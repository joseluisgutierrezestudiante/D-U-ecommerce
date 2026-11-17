document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  const errorBox = document.getElementById('register-error');
  const params = new URLSearchParams(window.location.search);
  const redirect = safeRedirect(params.get('redirect'), 'perfil.html');

  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.classList.add('is-visible');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    errorBox.classList.remove('is-visible');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (name.length < 3) {
      showError('Ingresá tu nombre completo.');
      return;
    }

    if (password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirm) {
      showError('Las contraseñas no coinciden. Verificá ambos campos.');
      return;
    }

    const users = getUsers();
    if (users.some((user) => user.email.toLowerCase() === email)) {
      showError('Ya existe una cuenta registrada con ese correo. Probá iniciar sesión.');
      return;
    }

    const newUser = {
      name,
      email,
      phone,
      password,
      address: '',
      city: '',
      country: 'Paraguay'
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    window.location.href = redirect;
  });
});
