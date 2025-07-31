document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('payment-form');
  const list = document.getElementById('payment-list');
  const amount = document.getElementById('amount');
  const mpesa = document.getElementById('mpesa');

  const signupUsername = document.getElementById('signup-username');
  const signupPassword = document.getElementById('signup-password');
  const loginUsername = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');

  const payments = JSON.parse(localStorage.getItem('payments')) || [];
  const users = JSON.parse(localStorage.getItem('users')) || [];

  const currentUser = localStorage.getItem('loggedInUser');

  const saveToLocal = () => {
    localStorage.setItem('payments', JSON.stringify(payments));
  };

  const renderPayments = () => {
    list.innerHTML = '';
    let total = 0;

    payments.forEach((p) => {
      if (p.user === localStorage.getItem('loggedInUser')) {
        total += Number(p.amount);
      }
    });

    const totalLi = document.createElement('li');
    totalLi.style.background = '#d1ffd1';
    totalLi.style.fontWeight = 'bold';
    totalLi.textContent = `TOTAL: ${total} Ksh`;
    list.appendChild(totalLi);

    payments.forEach((p) => {
      if (p.user === localStorage.getItem('loggedInUser')) {
        const li = document.createElement('li');
        li.textContent = `${p.amount} Ksh - ${p.mpesa} - ${p.date}`;
        list.appendChild(li);
      }
    });
  };

  if (currentUser) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    renderPayments();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const now = new Date();
    const date = now.toLocaleString();
    payments.push({ amount: amount.value, mpesa: mpesa.value, date, user: localStorage.getItem('loggedInUser') });
    saveToLocal();
    renderPayments();
    form.reset();
  });

  window.signup = function () {
    const username = signupUsername.value.trim();
    const password = signupPassword.value.trim();

    if (users.find(u => u.username === username)) {
      alert('Username already exists!');
      return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created! Please login.');
    toggleAuth('login');
  };

  window.login = function () {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      alert('Invalid credentials!');
      return;
    }

    localStorage.setItem('loggedInUser', username);
    location.reload();
  };

  window.logout = function () {
    localStorage.removeItem('loggedInUser');
    location.reload();
  };

  window.toggleAuth = function (mode) {
    document.getElementById('signup-section').style.display = mode === 'signup' ? 'block' : 'none';
    document.getElementById('login-section').style.display = mode === 'login' ? 'block' : 'none';
  };
});
