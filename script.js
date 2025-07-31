let users = JSON.parse(localStorage.getItem('users')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Add default super admin if not present
if (!users.find(u => u.username === 'naftal')) {
  users.push({ username: 'naftal', password: 'superadmin', role: 'admin', question: 'Code name?', answer: 'shifter' });
  localStorage.setItem('users', JSON.stringify(users));
}

// AUTH TOGGLE
window.toggleAuth = function(mode) {
  document.getElementById('signup-section').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('login-section').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('reset-section').style.display = mode === 'reset' ? 'block' : 'none';
}

// LOGIN
window.login = function () {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    location.reload();
  } else {
    alert("Login failed!");
  }
}

// SIGNUP
window.signup = function () {
  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const question = document.getElementById('signup-question').value.trim();
  const answer = document.getElementById('signup-answer').value.trim();

  if (!username || !password || !question || !answer) return alert("Fill all fields.");

  if (users.find(u => u.username === username)) return alert("Username exists.");

  users.push({ username, password, role: 'user', question, answer });
  localStorage.setItem('users', JSON.stringify(users));
  alert("Signup successful!");
  toggleAuth('login');
}

// RESET PASSWORD
window.startReset = function () {
  const uname = document.getElementById('reset-username').value.trim();
  const user = users.find(u => u.username === uname);
  if (!user) return alert("User not found!");
  document.getElementById('security-question').textContent = "Question: " + user.question;
  document.getElementById('reset-step2').style.display = 'block';
}

window.finishReset = function () {
  const uname = document.getElementById('reset-username').value.trim();
  const ans = document.getElementById('reset-answer').value.trim();
  const newPass = document.getElementById('new-password').value.trim();
  const user = users.find(u => u.username === uname);
  if (user && user.answer === ans) {
    user.password = newPass;
    localStorage.setItem('users', JSON.stringify(users));
    alert("Password reset successful.");
    toggleAuth('login');
  } else {
    alert("Wrong answer!");
  }
}

// LOGOUT
window.logout = function () {
  localStorage.removeItem('currentUser');
  location.reload();
}

// SAVE PAYMENT
window.savePayment = function () {
  const amount = Number(document.getElementById('amount').value);
  const mpesa = document.getElementById('mpesa').value.trim();
  if (!amount || !mpesa) return alert("Fill both fields.");
  const now = new Date().toLocaleString();
  payments.push({ user: currentUser.username, amount, mpesa, time: now });
  localStorage.setItem('payments', JSON.stringify(payments));
  displayPayments();
}

// DISPLAY PAYMENTS
function displayPayments() {
  document.getElementById('payments-list').innerHTML = "";
  let total = 0;
  const isAdmin = currentUser.role === 'admin';
  const myPayments = isAdmin ? payments : payments.filter(p => p.user === currentUser.username);
  myPayments.forEach(p => {
    total += p.amount;
    document.getElementById('payments-list').innerHTML += `<li>${p.user} - ${p.amount} (ID: ${p.mpesa}) on ${p.time}</li>`;
  });
  document.getElementById('total').textContent = `Ksh ${total}`;
}

// PROMOTE USER
window.promoteUser = function () {
  const username = document.getElementById('admin-promote-user').value.trim();
  const user = users.find(u => u.username === username);
  if (!user) return alert("User not found!");
  user.role = 'admin';
  localStorage.setItem('users', JSON.stringify(users));
  alert("User promoted.");
}

// INITIAL LOAD
if (currentUser) {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('signup-section').style.display = 'none';
  document.getElementById('reset-section').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';
  document.getElementById('logged-user').textContent = currentUser.username;
  if (currentUser.role === 'admin') {
    document.getElementById('admin-controls').style.display = 'block';
  }
  displayPayments();
}
