// Load or initialize storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Ensure superadmin exists (username: naftal, password: superadmin)
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

// Persist helper
function persist() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('payments', JSON.stringify(payments));
}

// Toggle auth views
window.toggleAuth = function(mode) {
  document.getElementById('signup-section').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('login-section').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('reset-section').style.display = mode === 'reset' ? 'block' : 'none';
}

// Login
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

// Signup
window.signup = function () {
  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const question = document.getElementById('signup-question').value.trim();
  const answer = document.getElementById('signup-answer').value.trim();

  if (!username || !password || !phone || !question || !answer) {
    alert("Please fill all signup fields.");
    return;
  }

  // Basic phone format check (you can tighten this)
  if (!/^\\+?\\d{9,15}$/.test(phone)) {
    alert("Enter a valid phone number (digits, optional leading +).");
    return;
  }

  // Prevent duplicate username or phone
  if (users.find(u => u.username === username)) {
    alert("Username already exists.");
    return;
  }
  if (users.find(u => u.phone === phone)) {
    alert("Phone number already registered.");
    return;
  }

  users.push({
    username,
    password,
    role: 'user',
    question,
    answer,
    phone
  });
  persist();
  alert("Signup successful. Please login.");
  toggleAuth('login');
}


// Reset password flow
window.startReset = function () {
  const uname = document.getElementById('reset-username').value.trim();
  const user = users.find(u => u.username === uname);
  if (!user) {
    alert("User not found.");
    return;
  }
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

// Logout
window.logout = function () {
  localStorage.removeItem('currentUser');
  location.reload();
}

// Save payment
window.savePayment = function () {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    alert("Not logged in.");
    return;
  }
  const amountRaw = document.getElementById('amount').value.trim();
  const mpesa = document.getElementById('mpesa').value.trim();
  const amount = parseFloat(amountRaw);
  if (isNaN(amount) || amount <= 0 || !mpesa) {
    alert("Enter valid amount and M-Pesa ID.");
    return;
  }
  const now = new Date().toLocaleString();
  payments.push({
    user: currentUser.username,
    amount,
    mpesa,
    time: now
  });
  persist();
  displayPayments();
  document.getElementById('amount').value = '';
  document.getElementById('mpesa').value = '';
}

// Display payments and total
function displayPayments() {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  const list = document.getElementById('payments-list');
  list.innerHTML = '';
  let total = 0;

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
  const visible = isAdmin
    ? payments
    : payments.filter(p => p.user === currentUser.username);

  visible.forEach(p => {
    total += Number(p.amount) || 0;
    const li = document.createElement('li');
    li.textContent = `${p.user} - Ksh ${p.amount.toLocaleString()} (MPesa: ${p.mpesa}) on ${p.time}`;
    list.appendChild(li);
  });

  document.getElementById('total').textContent = `Ksh ${total.toLocaleString()}`;
}

// Promote user (only superadmin)
window.promoteUser = function () {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || currentUser.role !== 'superadmin') {
    alert("Not authorized.");
    return;
  }
  const username = document.getElementById('admin-promote-user').value.trim();
  const user = users.find(u => u.username === username);
  if (!user) {
    alert("User not found.");
    return;
  }
  user.role = 'admin';
  persist();
  alert(`${username} is now an admin.`);
}

// On load: set up UI
window.addEventListener('DOMContentLoaded', () => {
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
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
    
