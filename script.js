// Load stored data
let users = JSON.parse(localStorage.getItem('users')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Ensure superadmin exists (you)
if (!users.find(u => u.username === 'naftal')) {
  users.push({
    username: 'naftal',
    password: 'superadmin',
    role: 'superadmin',
    question: 'Code name?',
    answer: 'shifter'
  });
  localStorage.setItem('users', JSON.stringify(users));
}

// Helper to persist
function persist() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('payments', JSON.stringify(payments));
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

  if (!user) {
    alert("Invalid credentials!");
    return;
  }
  localStorage.setItem('currentUser', JSON.stringify(user));
  location.reload();
}

// SIGNUP
window.signup = function () {
  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const question = document.getElementById('signup-question').value.trim();
  const answer = document.getElementById('signup-answer').value.trim();

  if (!username || !password || !question || !answer) {
    return alert("Please fill all signup fields.");
  }

  if (users.find(u => u.username === username)) {
    return alert("Username already exists.");
  }

  users.push({
    username,
    password,
    role: 'user',
    question,
    answer
  });
  persist();
  alert("Signup successful. Please login.");
  toggleAuth('login');
}

// RESET PASSWORD
window.startReset = function () {
  const uname = document.getElementById('reset-username').value.trim();
  const user = users.find(u => u.username === uname);
  if (!user) return alert("User not found.");
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
    persist();
    alert("Password reset successful.");
    toggleAuth('login');
  } else {
    alert("Incorrect answer.");
  }
}

// LOGOUT
window.logout = function () {
  localStorage.removeItem('currentUser');
  location.reload();
}

// SAVE PAYMENT
window.savePayment = function () {
  if (!currentUser) return alert("Not logged in.");
  const amountInput = document.getElementById('amount').value.trim();
  const mpesaId = document.getElementById('mpesa').value.trim();
  const amount = parseFloat(amountInput);
  if (isNaN(amount) || amount <= 0 || !mpesaId) {
    return alert("Enter valid amount and M-Pesa ID.");
  }
  const now = new Date().toLocaleString();
  payments.push({
    user: currentUser.username,
    amount,
    mpesa: mpesaId,
    time: now
  });
  persist();
  displayPayments();
  document.getElementById('amount').value = '';
  document.getElementById('mpesa').value = '';
}

// DISPLAY PAYMENTS & TOTAL
function displayPayments() {
  if (!currentUser) return;
  const listEl = document.getElementById('payments-list');
  listEl.innerHTML = '';
  let total = 0;

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
  const visible = isAdmin
    ? payments
    : payments.filter(p => p.user === currentUser.username);

  visible.forEach(p => {
    total += Number(p.amount) || 0;
    const li = document.createElement('li');
    li.textContent = `${p.user} - Ksh ${p.amount.toLocaleString()} (MPesa: ${p.mpesa}) on ${p.time}`;
    listEl.appendChild(li);
  });

  document.getElementById('total').textContent = `Ksh ${total.toLocaleString()}`;
}

// PROMOTE USER (only superadmin sees this)
window.promoteUser = function () {
  if (!currentUser || currentUser.role !== 'superadmin') return alert("Not authorized.");
  const username = document.getElementById('admin-promote-user').value.trim();
  const user = users.find(u => u.username === username);
  if (!user) return alert("User not found.");
  user.role = 'admin';
  persist();
  alert(`${username} promoted to admin.`);
}

// INITIALIZE UI
window.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('signup-section').style.display = 'none';
    document.getElementById('reset-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('logged-user').textContent = currentUser.username;

    if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
      document.getElementById('admin-controls').style.display = 'block';
    }
    displayPayments();
  } else {
    toggleAuth('login');
  }
});
    
