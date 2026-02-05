// Expense Tracker Application with Dark Mode, PWA, and Auto Logout

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const logoutBtn = document.getElementById('logout-btn');
const currentUserElement = document.getElementById('current-user');
const themeToggle = document.getElementById('theme-toggle');
const installBtn = document.getElementById('install-btn');

// Navigation Elements
const navBtns = document.querySelectorAll('.nav-btn');
const actionBtns = document.querySelectorAll('.action-btn');
const backBtns = document.querySelectorAll('.back-btn');
const contentSections = document.querySelectorAll('.content-section');

// Home Section Elements
const welcomeUsername = document.getElementById('welcome-username');
const quickTotal = document.getElementById('quick-total');
const quickMonth = document.getElementById('quick-month');
const quickCategory = document.getElementById('quick-category');
const recentExpensesList = document.getElementById('recent-expenses-list');
const homeCategoryTotals = document.getElementById('home-category-totals');

// Add Expense Section Elements
const expenseForm = document.getElementById('expense-form');
const resetFormBtn = document.getElementById('reset-form');

// History Section Elements
const expenseTableBody = document.getElementById('expense-table-body');
const emptyState = document.getElementById('empty-state');
const filterCategory = document.getElementById('filter-category');
const filterMonth = document.getElementById('filter-month');
const filterStartDate = document.getElementById('filter-start-date');
const filterEndDate = document.getElementById('filter-end-date');
const applyFiltersBtn = document.getElementById('apply-filters');
const clearFiltersBtn = document.getElementById('clear-filters');
const dateRangeInfo = document.getElementById('date-range-info');
const dateRangeStartElement = document.getElementById('date-range-start');
const dateRangeEndElement = document.getElementById('date-range-end');
const tableTotal = document.getElementById('table-total');
const tableCount = document.getElementById('table-count');
const exportBtn = document.getElementById('export-btn');

// Visualization Section Elements
const chartOptions = document.querySelectorAll('.chart-option');
const chartTitle = document.getElementById('chart-title');
const downloadChartBtn = document.getElementById('download-chart');
const resetChartBtn = document.getElementById('reset-chart');
const colorLegendElement = document.getElementById('color-legend');
const chartTotal = document.getElementById('chart-total');
const chartCategories = document.getElementById('chart-categories');
const chartPeriod = document.getElementById('chart-period');

// Profile Section Elements
const profileImage = document.getElementById('profile-image');
const changeAvatarBtn = document.getElementById('change-avatar');
const avatarUpload = document.getElementById('avatar-upload');
const profileName = document.getElementById('profile-name');
const profileUsernameDisplay = document.getElementById('profile-username-display');
const profileMobileDisplay = document.getElementById('profile-mobile-display');
const profileJoinedDate = document.getElementById('profile-joined-date');
const profileTotalExpenses = document.getElementById('profile-total-expenses');
const profileActiveMonths = document.getElementById('profile-active-months');
const profileCategories = document.getElementById('profile-categories');

// Profile Edit Elements
const editPersonalInfoBtn = document.getElementById('edit-personal-info');
const personalInfoDisplay = document.getElementById('personal-info-display');
const personalInfoForm = document.getElementById('personal-info-form');
const displayName = document.getElementById('display-name');
const displayUsername = document.getElementById('display-username');
const displayMobile = document.getElementById('display-mobile');
const editNameInput = document.getElementById('edit-name');
const editUsernameInput = document.getElementById('edit-username');
const editMobileInput = document.getElementById('edit-mobile');
const cancelPersonalEditBtn = document.getElementById('cancel-personal-edit');

// Password Change Elements
const showPasswordFormBtn = document.getElementById('show-password-form');
const passwordForm = document.getElementById('password-form');
const cancelPasswordEditBtn = document.getElementById('cancel-password-edit');

// Data Management Elements
const exportDataBtn = document.getElementById('export-data');
const resetDataBtn = document.getElementById('reset-data');

// Modal Elements
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const resetModal = document.getElementById('reset-modal');
const confirmResetBtn = document.getElementById('confirm-reset');
const cancelResetBtn = document.getElementById('cancel-reset');
const inactivityModal = document.getElementById('inactivity-modal');
const stayLoggedInBtn = document.getElementById('stay-logged-in');
const logoutNowBtn = document.getElementById('logout-now');
const countdownElement = document.getElementById('countdown');

// Application State
let currentUser = null;
let expenses = [];
let expenseToDelete = null;
let currentChart = null;
let filterState = {
    category: 'all',
    month: 'all',
    startDate: null,
    endDate: null
};

// Auto Logout Timer Variables
let logoutTimer;
let inactivityTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds
let warningTimeout = 30 * 1000; // 30 seconds warning
let countdownInterval;

// PWA Install Prompt
let deferredPrompt;

// Category Colors (updated for new theme)
const categoryColors = {
    'Food': '#FF6B6B',
    'Travel': '#4ECDC4',
    'Shopping': '#FFD93D',
    'Entertainment': '#6C5CE7',
    'Bills': '#A29BFE',
    'Healthcare': '#FD79A8',
    'Education': '#00B894',
    'Other': '#636E72'
};

// Initialize the application
function initApp() {
    // Set default dates
    document.getElementById('date').valueAsDate = new Date();
    
    const today = new Date().toISOString().split('T')[0];
    filterEndDate.value = today;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filterStartDate.value = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Check if user is already logged in
    const loggedInUser = localStorage.getItem('expenseTrackerUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        showDashboard();
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('expenseTrackerTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Load user's expenses
    loadExpenses();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize chart
    initChart();
    
    // Setup PWA install prompt
    setupPWAInstall();
    
    // Setup inactivity timer
    setupInactivityTimer();
}

// Set up all event listeners
function setupEventListeners() {
    // Authentication
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    signupTab.addEventListener('click', () => switchAuthTab('signup'));
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('signup');
    });
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('login');
    });
    
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Send OTP button
    const sendOtpBtn = document.getElementById('send-otp-btn');
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', sendOTP);
    }
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Install button
    installBtn.addEventListener('click', installPWA);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => navigateToSection(btn.dataset.section));
    });
    
    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => navigateToSection(btn.dataset.section));
    });
    
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => navigateToSection(btn.dataset.section));
    });
    
    // Expense form
    expenseForm.addEventListener('submit', handleAddExpense);
    resetFormBtn.addEventListener('click', resetExpenseForm);
    
    // Filters
    if (filterCategory) {
        filterCategory.addEventListener('change', (e) => {
            filterState.category = e.target.value;
        });
    }
    
    if (filterMonth) {
        filterMonth.addEventListener('change', (e) => {
            filterState.month = e.target.value;
        });
    }
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Export buttons
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAllData);
    }
    
    // Chart options
    chartOptions.forEach(option => {
        option.addEventListener('click', () => {
            chartOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            updateChart(option.dataset.chart);
        });
    });
    
    if (downloadChartBtn) {
        downloadChartBtn.addEventListener('click', downloadChart);
    }
    
    if (resetChartBtn) {
        resetChartBtn.addEventListener('click', resetChart);
    }
    
    // Profile section
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => avatarUpload.click());
    }
    
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
    
    // Profile edit
    if (editPersonalInfoBtn) {
        editPersonalInfoBtn.addEventListener('click', showPersonalInfoForm);
    }
    
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', updatePersonalInfo);
    }
    
    if (cancelPersonalEditBtn) {
        cancelPersonalEditBtn.addEventListener('click', cancelPersonalInfoEdit);
    }
    
    // Password change
    if (showPasswordFormBtn) {
        showPasswordFormBtn.addEventListener('click', showPasswordForm);
    }
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', changePassword);
    }
    
    if (cancelPasswordEditBtn) {
        cancelPasswordEditBtn.addEventListener('click', hidePasswordForm);
    }
    
    // Data management
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', showResetModal);
    }
    
    // Inactivity modal
    if (stayLoggedInBtn) {
        stayLoggedInBtn.addEventListener('click', resetInactivityTimer);
    }
    
    if (logoutNowBtn) {
        logoutNowBtn.addEventListener('click', handleLogout);
    }
    
    // Modals
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteExpense);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            deleteModal.classList.remove('active');
        });
    }
    
    if (confirmResetBtn) {
        confirmResetBtn.addEventListener('click', confirmResetData);
    }
    
    if (cancelResetBtn) {
        cancelResetBtn.addEventListener('click', () => {
            resetModal.classList.remove('active');
        });
    }
    
    // User activity tracking
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('scroll', resetInactivityTimer);
}

// Navigation functions
function navigateToSection(section) {
    // Hide all sections
    contentSections.forEach(sec => sec.classList.remove('active'));
    
    // Remove active class from all nav buttons
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    // Set active nav button
    const activeNavBtn = document.querySelector(`.nav-btn[data-section="${section}"]`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }
    
    // Reset inactivity timer
    resetInactivityTimer();
    
    // Update content based on section
    switch(section) {
        case 'home':
            updateDashboard();
            updateRecentExpenses();
            updateHomeCategories();
            break;
        case 'history':
            renderExpenses();
            populateMonthFilter();
            break;
        case 'visualization':
            updateChart('category');
            updateColorLegend();
            break;
        case 'profile':
            updateProfileSection();
            break;
    }
}

// Theme Toggle Function
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('expenseTrackerTheme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('expenseTrackerTheme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Authentication functions
function switchAuthTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!username || !password) {
        showFormMessage('Please fill in all fields', 'error', loginForm);
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('expenseTrackerUsers')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('expenseTrackerUser', JSON.stringify(currentUser));
        showDashboard();
        showFormMessage('Login successful!', 'success', loginForm);
        
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    } else {
        showFormMessage('Invalid username or password', 'error', loginForm);
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const name = document.getElementById('signup-name').value.trim();
    const mobile = document.getElementById('signup-mobile').value.trim();
    const otp = document.getElementById('signup-otp').value.trim();
    
    if (!username || !password || !name || !mobile) {
        showFormMessage('Please fill in all required fields', 'error', signupForm);
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('expenseTrackerUsers')) || [];
    const userExists = users.find(u => u.username === username);
    
    if (userExists) {
        showFormMessage('Username already exists', 'error', signupForm);
        return;
    }
    
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        showFormMessage('Please enter a valid 6-digit OTP', 'error', signupForm);
        return;
    }
    
    const newUser = {
        id: generateId(),
        username,
        password,
        name,
        mobile,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1ABC9C&color=fff&size=150`,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('expenseTrackerUser', JSON.stringify(currentUser));
    
    showDashboard();
    showFormMessage('Account created successfully!', 'success', signupForm);
    
    document.getElementById('signup-username').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-mobile').value = '';
    document.getElementById('signup-otp').value = '';
}

function sendOTP() {
    const mobile = document.getElementById('signup-mobile').value.trim();
    
    if (!mobile) {
        alert('Please enter your mobile number first');
        return;
    }
    
    if (!/^\d{10}$/.test(mobile)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    alert(`Demo: OTP sent to ${mobile}: ${otp}\n\nIn a real app, this would be sent via SMS. For this demo, you can use this OTP to sign up.`);
    
    document.getElementById('signup-otp').disabled = false;
    
    const sendOtpBtn = document.getElementById('send-otp-btn');
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Resend OTP in 60s';
    
    let seconds = 60;
    const countdown = setInterval(() => {
        seconds--;
        sendOtpBtn.textContent = `Resend OTP in ${seconds}s`;
        
        if (seconds <= 0) {
            clearInterval(countdown);
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = 'Send OTP';
        }
    }, 1000);
}

function showFormMessage(message, type, form) {
    const existingMessage = form.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'form-message';
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const submitBtn = form.querySelector('.auth-btn');
    form.insertBefore(messageDiv, submitBtn.nextSibling);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function showDashboard() {
    authScreen.classList.remove('active');
    dashboardScreen.classList.add('active');
    
    if (currentUser) {
        currentUserElement.textContent = currentUser.name;
        welcomeUsername.textContent = currentUser.name;
        profileName.textContent = currentUser.name;
        profileUsernameDisplay.textContent = `@${currentUser.username}`;
        profileMobileDisplay.textContent = `Mobile: ${currentUser.mobile || 'Not set'}`;
        
        const joinedDate = new Date(currentUser.createdAt);
        profileJoinedDate.textContent = joinedDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        if (currentUser.avatar) {
            profileImage.src = currentUser.avatar;
        }
        
        // Update profile display
        displayName.textContent = currentUser.name;
        displayUsername.textContent = currentUser.username;
        displayMobile.textContent = currentUser.mobile || 'Not set';
    }
    
    loadExpenses();
    navigateToSection('home');
}

function handleLogout() {
    // Clear all timers
    clearTimeout(logoutTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    
    // Hide any open modals
    inactivityModal.classList.remove('active');
    deleteModal.classList.remove('active');
    resetModal.classList.remove('active');
    
    // Clear user data
    currentUser = null;
    localStorage.removeItem('expenseTrackerUser');
    
    // Switch screens
    dashboardScreen.classList.remove('active');
    authScreen.classList.add('active');
    switchAuthTab('login');
    
    showNotification('Logged out successfully', 'success');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Expense Management Functions
function loadExpenses() {
    if (!currentUser) return;
    
    const userExpenses = localStorage.getItem(`expenses_${currentUser.id}`);
    expenses = userExpenses ? JSON.parse(userExpenses) : [];
}

function saveExpenses() {
    if (!currentUser) return;
    
    localStorage.setItem(`expenses_${currentUser.id}`, JSON.stringify(expenses));
}

function handleAddExpense(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value.trim();
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount greater than 0');
        return;
    }
    
    if (!category) {
        alert('Please select a category');
        return;
    }
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    const expense = {
        id: generateId(),
        amount,
        category,
        date,
        description: description || `${category} expense`,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    expenses.unshift(expense);
    saveExpenses();
    
    updateDashboard();
    updateRecentExpenses();
    updateHomeCategories();
    navigateToSection('home');
    
    const formMessage = document.getElementById('form-message');
    formMessage.textContent = 'Expense added successfully!';
    formMessage.className = 'message success';
    
    resetExpenseForm();
    
    setTimeout(() => {
        formMessage.textContent = '';
        formMessage.className = 'message';
    }, 3000);
}

function resetExpenseForm() {
    expenseForm.reset();
    document.getElementById('date').valueAsDate = new Date();
    const formMessage = document.getElementById('form-message');
    if (formMessage) {
        formMessage.textContent = '';
    }
}

// Dashboard Functions
function updateDashboard() {
    if (expenses.length === 0) {
        if (quickTotal) quickTotal.textContent = '₹0.00';
        if (quickMonth) quickMonth.textContent = '₹0.00';
        if (quickCategory) quickCategory.textContent = 'None';
        return;
    }
    
    // Calculate total expense
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    if (quickTotal) quickTotal.textContent = `₹${totalExpense.toFixed(2)}`;
    
    // Calculate current month expense
    const now = new Date();
    const currentMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
    });
    
    const monthExpense = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    if (quickMonth) quickMonth.textContent = `₹${monthExpense.toFixed(2)}`;
    
    // Find top category
    const categoryTotals = {};
    expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    let topCategory = 'None';
    let topAmount = 0;
    
    for (const [category, amount] of Object.entries(categoryTotals)) {
        if (amount > topAmount) {
            topCategory = category;
            topAmount = amount;
        }
    }
    
    if (quickCategory) quickCategory.textContent = topCategory;
}

function updateRecentExpenses() {
    if (!recentExpensesList) return;
    
    recentExpensesList.innerHTML = '';
    
    if (expenses.length === 0) {
        recentExpensesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <h3>No recent expenses</h3>
                <p>Add your first expense to get started</p>
            </div>
        `;
        return;
    }
    
    // Show last 5 expenses
    const recentExpenses = expenses.slice(0, 5);
    
    recentExpenses.forEach(expense => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        
        const dateObj = new Date(expense.date);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short'
        });
        
        expenseItem.innerHTML = `
            <div class="expense-item-main">
                <div class="expense-category">
                    <span class="category-badge category-${expense.category}">${expense.category}</span>
                </div>
                <div class="expense-details">
                    <h4>${expense.description}</h4>
                    <p>${formattedDate}</p>
                </div>
            </div>
            <div class="expense-amount">
                ₹${expense.amount.toFixed(2)}
            </div>
        `;
        
        recentExpensesList.appendChild(expenseItem);
    });
}

function updateHomeCategories() {
    if (!homeCategoryTotals) return;
    
    homeCategoryTotals.innerHTML = '';
    
    if (expenses.length === 0) {
        homeCategoryTotals.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <h3>No categories yet</h3>
                <p>Start adding expenses to see category breakdown</p>
            </div>
        `;
        return;
    }
    
    // Calculate category totals
    const categoryTotals = {};
    expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    // Sort categories by amount (descending)
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6); // Show top 6 categories
    
    sortedCategories.forEach(([category, amount]) => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        
        categoryItem.innerHTML = `
            <div class="category-info">
                <span class="category-name">${category}</span>
                <span class="category-percentage">${calculatePercentage(amount, expenses)}%</span>
            </div>
            <div class="category-bar">
                <div class="category-bar-fill" style="width: ${calculatePercentage(amount, expenses)}%"></div>
            </div>
            <span class="category-amount">₹${amount.toFixed(2)}</span>
        `;
        
        homeCategoryTotals.appendChild(categoryItem);
    });
}

function calculatePercentage(amount, expenses) {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return total > 0 ? Math.round((amount / total) * 100) : 0;
}

// History Section Functions
function renderExpenses() {
    if (!expenseTableBody) return;
    
    expenseTableBody.innerHTML = '';
    
    let filteredExpenses = [...expenses];
    
    // Apply filters
    if (filterState.category !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === filterState.category);
    }
    
    if (filterState.month !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const expenseMonthYear = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
            return expenseMonthYear === filterState.month;
        });
    }
    
    if (filterState.startDate && filterState.endDate) {
        filteredExpenses = filteredExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const startDate = new Date(filterState.startDate);
            const endDate = new Date(filterState.endDate);
            
            endDate.setHours(23, 59, 59, 999);
            
            return expenseDate >= startDate && expenseDate <= endDate;
        });
    }
    
    // Update table summary
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    if (tableTotal) tableTotal.textContent = `₹${totalAmount.toFixed(2)}`;
    if (tableCount) tableCount.textContent = filteredExpenses.length;
    
    if (filteredExpenses.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        
        filteredExpenses.forEach(expense => {
            const row = document.createElement('tr');
            
            const dateObj = new Date(expense.date);
            const formattedDate = dateObj.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            
            const formattedAmount = `₹${expense.amount.toFixed(2)}`;
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td><span class="category-badge category-${expense.category}">${expense.category}</span></td>
                <td>${expense.description}</td>
                <td class="amount-cell">${formattedAmount}</td>
                <td>
                    <button class="btn delete-btn" data-id="${expense.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            
            expenseTableBody.appendChild(row);
        });
    }
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            showDeleteModal(id);
        });
    });
}

function applyFilters() {
    const startDate = filterStartDate.value;
    const endDate = filterEndDate.value;
    
    if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date cannot be after end date');
            return;
        }
        
        filterState.startDate = startDate;
        filterState.endDate = endDate;
        
        const formattedStartDate = new Date(startDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        const formattedEndDate = new Date(endDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        dateRangeStartElement.textContent = formattedStartDate;
        dateRangeEndElement.textContent = formattedEndDate;
        dateRangeInfo.style.display = 'flex';
    } else {
        filterState.startDate = null;
        filterState.endDate = null;
        dateRangeInfo.style.display = 'none';
    }
    
    renderExpenses();
}

function clearFilters() {
    filterState = {
        category: 'all',
        month: 'all',
        startDate: null,
        endDate: null
    };
    
    if (filterCategory) filterCategory.value = 'all';
    if (filterMonth) filterMonth.value = 'all';
    
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (filterStartDate) filterStartDate.value = thirtyDaysAgo.toISOString().split('T')[0];
    if (filterEndDate) filterEndDate.value = today;
    
    if (dateRangeInfo) dateRangeInfo.style.display = 'none';
    renderExpenses();
}

function populateMonthFilter() {
    if (!filterMonth || expenses.length === 0) return;
    
    const monthsSet = new Set();
    
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        monthsSet.add(`${monthYear}|${monthName}`);
    });
    
    const monthsArray = Array.from(monthsSet)
        .map(item => {
            const [value, label] = item.split('|');
            return { value, label };
        })
        .sort((a, b) => b.value.localeCompare(a.value));
    
    filterMonth.innerHTML = '<option value="all">All Months</option>';
    
    monthsArray.forEach(month => {
        const option = document.createElement('option');
        option.value = month.value;
        option.textContent = month.label;
        filterMonth.appendChild(option);
    });
}

function exportToCSV() {
    if (expenses.length === 0) {
        alert('No expenses to export');
        return;
    }
    
    let filteredExpenses = [...expenses];
    
    // Apply current filters
    if (filterState.category !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === filterState.category);
    }
    
    if (filterState.month !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const expenseMonthYear = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
            return expenseMonthYear === filterState.month;
        });
    }
    
    if (filterState.startDate && filterState.endDate) {
        filteredExpenses = filteredExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const startDate = new Date(filterState.startDate);
            const endDate = new Date(filterState.endDate);
            
            endDate.setHours(23, 59, 59, 999);
            
            return expenseDate >= startDate && expenseDate <= endDate;
        });
    }
    
    // Create CSV content
    let csvContent = 'Date,Category,Description,Amount(₹)\n';
    
    filteredExpenses.forEach(expense => {
        const date = new Date(expense.date).toLocaleDateString();
        const row = [
            date,
            expense.category,
            expense.description.replace(/,/g, ';'),
            expense.amount.toFixed(2)
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Expenses exported successfully!', 'success');
}

// Profile Section Functions
function updateProfileSection() {
    if (!currentUser) return;
    
    // Update profile stats
    if (profileTotalExpenses) profileTotalExpenses.textContent = expenses.length;
    
    // Calculate active months
    const monthsSet = new Set();
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthsSet.add(monthYear);
    });
    if (profileActiveMonths) profileActiveMonths.textContent = monthsSet.size;
    
    // Calculate categories used
    const categoriesSet = new Set(expenses.map(expense => expense.category));
    if (profileCategories) profileCategories.textContent = categoriesSet.size;
}

function showPersonalInfoForm() {
    if (!personalInfoDisplay || !editPersonalInfoBtn || !personalInfoForm) return;
    
    personalInfoDisplay.style.display = 'none';
    editPersonalInfoBtn.style.display = 'none';
    personalInfoForm.style.display = 'block';
    
    // Fill form with current values
    if (editNameInput) editNameInput.value = currentUser.name;
    if (editUsernameInput) editUsernameInput.value = currentUser.username;
    if (editMobileInput) editMobileInput.value = currentUser.mobile || '';
}

function cancelPersonalInfoEdit() {
    if (!personalInfoDisplay || !editPersonalInfoBtn || !personalInfoForm) return;
    
    personalInfoDisplay.style.display = 'block';
    editPersonalInfoBtn.style.display = 'flex';
    personalInfoForm.style.display = 'none';
}

function updatePersonalInfo(e) {
    e.preventDefault();
    
    if (!editNameInput || !editUsernameInput || !editMobileInput) return;
    
    const name = editNameInput.value.trim();
    const username = editUsernameInput.value.trim();
    const mobile = editMobileInput.value.trim();
    
    if (!name || !username || !mobile) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!/^\d{10}$/.test(mobile)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    
    // Check if username is changed and already exists
    if (username !== currentUser.username) {
        const users = JSON.parse(localStorage.getItem('expenseTrackerUsers')) || [];
        const userExists = users.find(u => u.username === username && u.id !== currentUser.id);
        
        if (userExists) {
            alert('Username already exists. Please choose a different username.');
            return;
        }
    }
    
    // Update user data
    currentUser.name = name;
    currentUser.username = username;
    currentUser.mobile = mobile;
    currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1ABC9C&color=fff&size=150`;
    
    localStorage.setItem('expenseTrackerUser', JSON.stringify(currentUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('expenseTrackerUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
    }
    
    // Update UI
    if (profileImage) profileImage.src = currentUser.avatar;
    if (profileName) profileName.textContent = name;
    if (profileUsernameDisplay) profileUsernameDisplay.textContent = `@${username}`;
    if (profileMobileDisplay) profileMobileDisplay.textContent = `Mobile: ${mobile}`;
    if (currentUserElement) currentUserElement.textContent = name;
    if (welcomeUsername) welcomeUsername.textContent = name;
    if (displayName) displayName.textContent = name;
    if (displayUsername) displayUsername.textContent = username;
    if (displayMobile) displayMobile.textContent = mobile;
    
    // Hide form and show display
    cancelPersonalInfoEdit();
    
    showNotification('Profile updated successfully!', 'success');
}

function showPasswordForm() {
    if (!passwordForm || !showPasswordFormBtn) return;
    
    passwordForm.style.display = 'block';
    showPasswordFormBtn.style.display = 'none';
}

function hidePasswordForm() {
    if (!passwordForm || !showPasswordFormBtn) return;
    
    passwordForm.style.display = 'none';
    showPasswordFormBtn.style.display = 'flex';
    passwordForm.reset();
}

function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields');
        return;
    }
    
    if (currentUser.password !== currentPassword) {
        alert('Current password is incorrect');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        return;
    }
    
    // Update password
    currentUser.password = newPassword;
    localStorage.setItem('expenseTrackerUser', JSON.stringify(currentUser));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('expenseTrackerUsers')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
    }
    
    // Hide form and reset
    hidePasswordForm();
    
    showNotification('Password changed successfully!', 'success');
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        if (profileImage) {
            profileImage.src = event.target.result;
        }
        
        // Save to user data
        currentUser.avatar = event.target.result;
        localStorage.setItem('expenseTrackerUser', JSON.stringify(currentUser));
        
        // Update in users array
        const users = JSON.parse(localStorage.getItem('expenseTrackerUsers')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].avatar = event.target.result;
            localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
        }
        
        showNotification('Profile picture updated!', 'success');
    };
    
    reader.readAsDataURL(file);
}

function exportAllData() {
    if (expenses.length === 0) {
        alert('No data to export');
        return;
    }
    
    const data = {
        user: currentUser,
        expenses: expenses,
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expense-tracker-backup_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('All data exported successfully!', 'success');
}

// Visualization Functions
function initChart() {
    const ctx = document.getElementById('expense-chart');
    if (!ctx) return;
    
    currentChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['No Expenses Yet'],
            datasets: [{
                data: [1],
                backgroundColor: [categoryColors.Other],
                borderWidth: 3,
                borderColor: 'var(--card-color)',
                hoverOffset: 15,
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 14,
                            family: "'Poppins', sans-serif",
                            weight: '500'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: 'var(--text-color)'
                    }
                },
                title: {
                    display: true,
                    text: 'Expenses by Category',
                    font: {
                        size: 18,
                        family: "'Poppins', sans-serif",
                        weight: '600'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    },
                    color: 'var(--text-color)'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14,
                        family: "'Poppins', sans-serif"
                    },
                    bodyFont: {
                        size: 14,
                        family: "'Poppins', sans-serif"
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '55%',
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

function updateChart(type = 'category') {
    if (!currentChart || !chartTitle || !chartTotal || !chartCategories || !chartPeriod) return;
    
    if (expenses.length === 0) {
        currentChart.type = 'doughnut';
        currentChart.data.labels = ['No Expenses Yet'];
        currentChart.data.datasets[0].data = [1];
        currentChart.data.datasets[0].backgroundColor = [categoryColors.Other];
        currentChart.data.datasets[0].borderColor = 'var(--card-color)';
        chartTitle.textContent = 'No Expenses Yet';
        chartTotal.textContent = '₹0.00';
        chartCategories.textContent = '0';
        chartPeriod.textContent = 'All Time';
        currentChart.update();
        return;
    }
    
    const additionalColors = Object.values(categoryColors);
    
    if (type === 'category') {
        const categoryTotals = {};
        expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += expense.amount;
        });
        
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const backgroundColors = labels.map(label => categoryColors[label] || additionalColors[labels.indexOf(label) % additionalColors.length]);
        
        currentChart.type = 'doughnut';
        currentChart.data.labels = labels;
        currentChart.data.datasets[0].data = data;
        currentChart.data.datasets[0].backgroundColor = backgroundColors;
        chartTitle.textContent = 'Expenses by Category';
        
        const total = data.reduce((a, b) => a + b, 0);
        chartTotal.textContent = `₹${total.toFixed(2)}`;
        chartCategories.textContent = labels.length;
        chartPeriod.textContent = 'All Time';
        
    } else if (type === 'monthly') {
        const monthlyTotals = {};
        
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            
            if (!monthlyTotals[monthYear]) {
                monthlyTotals[monthYear] = 0;
            }
            monthlyTotals[monthYear] += expense.amount;
        });
        
        const sortedMonths = Object.entries(monthlyTotals)
            .sort((a, b) => {
                const dateA = new Date(`01 ${a[0]}`);
                const dateB = new Date(`01 ${b[0]}`);
                return dateA - dateB;
            });
        
        const labels = sortedMonths.map(item => item[0]);
        const data = sortedMonths.map(item => item[1]);
        
        currentChart.type = 'line';
        currentChart.data.labels = labels;
        currentChart.data.datasets[0].data = data;
        currentChart.data.datasets[0].backgroundColor = 'rgba(26, 188, 156, 0.2)';
        currentChart.data.datasets[0].borderColor = '#1ABC9C';
        currentChart.data.datasets[0].pointBackgroundColor = '#1ABC9C';
        currentChart.data.datasets[0].pointBorderColor = '#ffffff';
        currentChart.data.datasets[0].pointHoverBackgroundColor = '#ffffff';
        currentChart.data.datasets[0].pointHoverBorderColor = '#1ABC9C';
        currentChart.data.datasets[0].pointRadius = 6;
        currentChart.data.datasets[0].pointHoverRadius = 8;
        currentChart.data.datasets[0].borderWidth = 3;
        currentChart.data.datasets[0].fill = true;
        chartTitle.textContent = 'Monthly Expense Trend';
        
        const total = data.reduce((a, b) => a + b, 0);
        chartTotal.textContent = `₹${total.toFixed(2)}`;
        chartCategories.textContent = labels.length;
        chartPeriod.textContent = labels.length > 0 ? `${labels[0]} - ${labels[labels.length - 1]}` : 'No Data';
        
    } else if (type === 'weekly') {
        const weeklyTotals = {};
        
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const weekNumber = getWeekNumber(date);
            const weekKey = `Week ${weekNumber}`;
            
            if (!weeklyTotals[weekKey]) {
                weeklyTotals[weekKey] = 0;
            }
            weeklyTotals[weekKey] += expense.amount;
        });
        
        const sortedWeeks = Object.entries(weeklyTotals)
            .sort((a, b) => {
                const weekA = parseInt(a[0].replace('Week ', ''));
                const weekB = parseInt(b[0].replace('Week ', ''));
                return weekA - weekB;
            });
        
        const labels = sortedWeeks.map(item => item[0]);
        const data = sortedWeeks.map(item => item[1]);
        
        currentChart.type = 'bar';
        currentChart.data.labels = labels;
        currentChart.data.datasets[0].data = data;
        currentChart.data.datasets[0].backgroundColor = 'rgba(26, 188, 156, 0.6)';
        currentChart.data.datasets[0].borderColor = '#1ABC9C';
        currentChart.data.datasets[0].borderWidth = 2;
        chartTitle.textContent = 'Weekly Expense Analysis';
        
        const total = data.reduce((a, b) => a + b, 0);
        chartTotal.textContent = `₹${total.toFixed(2)}`;
        chartCategories.textContent = labels.length;
        chartPeriod.textContent = labels.length > 0 ? `Week ${labels[0].replace('Week ', '')} - Week ${labels[labels.length - 1].replace('Week ', '')}` : 'No Data';
        
    } else if (type === 'daily') {
        const dailyTotals = {};
        
        // Get last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= thirtyDaysAgo;
        });
        
        recentExpenses.forEach(expense => {
            const date = new Date(expense.date);
            const dayKey = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            
            if (!dailyTotals[dayKey]) {
                dailyTotals[dayKey] = 0;
            }
            dailyTotals[dayKey] += expense.amount;
        });
        
        const sortedDays = Object.entries(dailyTotals)
            .sort((a, b) => {
                const dateA = new Date(`2024 ${a[0]}`);
                const dateB = new Date(`2024 ${b[0]}`);
                return dateA - dateB;
            });
        
        const labels = sortedDays.map(item => item[0]);
        const data = sortedDays.map(item => item[1]);
        
        currentChart.type = 'bar';
        currentChart.data.labels = labels;
        currentChart.data.datasets[0].data = data;
        currentChart.data.datasets[0].backgroundColor = 'rgba(44, 62, 80, 0.6)';
        currentChart.data.datasets[0].borderColor = '#2C3E50';
        currentChart.data.datasets[0].borderWidth = 2;
        chartTitle.textContent = 'Daily Spending (Last 30 Days)';
        
        const total = data.reduce((a, b) => a + b, 0);
        chartTotal.textContent = `₹${total.toFixed(2)}`;
        chartCategories.textContent = labels.length;
        chartPeriod.textContent = 'Last 30 Days';
    }
    
    currentChart.update();
    updateColorLegend();
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

function updateColorLegend() {
    if (!colorLegendElement) return;
    
    colorLegendElement.innerHTML = '';
    
    const categories = [...new Set(expenses.map(expense => expense.category))];
    
    if (categories.length === 0) {
        Object.entries(categoryColors).forEach(([category, color]) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${color};"></div>
                <span class="legend-name">${category}</span>
            `;
            
            colorLegendElement.appendChild(legendItem);
        });
    } else {
        categories.forEach(category => {
            const color = categoryColors[category] || '#636E72';
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${color};"></div>
                <span class="legend-name">${category}</span>
            `;
            
            colorLegendElement.appendChild(legendItem);
        });
    }
}

function downloadChart() {
    if (!currentChart) return;
    
    const link = document.createElement('a');
    link.download = `expense-chart-${new Date().toISOString().split('T')[0]}.png`;
    link.href = currentChart.toBase64Image();
    link.click();
    
    showNotification('Chart downloaded successfully!', 'success');
}

function resetChart() {
    chartOptions.forEach(opt => opt.classList.remove('active'));
    const categoryBtn = document.querySelector('.chart-option[data-chart="category"]');
    if (categoryBtn) {
        categoryBtn.classList.add('active');
    }
    updateChart('category');
    
    showNotification('Chart reset to default view', 'success');
}

// Inactivity Timer Functions
function setupInactivityTimer() {
    // Only setup timer if user is logged in
    if (currentUser) {
        resetInactivityTimer();
    }
}

function resetInactivityTimer() {
    // Clear existing timers
    clearTimeout(logoutTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    
    // Hide inactivity modal
    if (inactivityModal) {
        inactivityModal.classList.remove('active');
    }
    
    // Set new logout timer (only in browser, not in PWA)
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        logoutTimer = setTimeout(showInactivityWarning, inactivityTimeout);
    }
}

function showInactivityWarning() {
    if (!inactivityModal || !countdownElement) return;
    
    inactivityModal.classList.add('active');
    
    let countdown = 30;
    countdownElement.textContent = countdown;
    
    countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            handleLogout();
        }
    }, 1000);
}

// PWA Installation Functions
function setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show the install button
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    });
    
    window.addEventListener('appinstalled', () => {
        // Hide the install button
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        // Clear the deferredPrompt
        deferredPrompt = null;
        // Show success message
        showNotification('App installed successfully!', 'success');
    });
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                showNotification('App installed successfully!', 'success');
            } else {
                console.log('User dismissed the install prompt');
                showNotification('App installation cancelled', 'error');
            }
            deferredPrompt = null;
        });
    } else {
        showNotification('App installation not available', 'error');
    }
}

// Modal Functions
function showResetModal() {
    if (resetModal) {
        resetModal.classList.add('active');
    }
}

function confirmResetData() {
    // Clear expenses
    expenses = [];
    saveExpenses();
    
    // Reset modal
    if (resetModal) {
        resetModal.classList.remove('active');
    }
    
    // Update UI
    updateDashboard();
    updateRecentExpenses();
    updateHomeCategories();
    renderExpenses();
    updateChart();
    updateProfileSection();
    
    showNotification('All data has been reset!', 'success');
}

function showDeleteModal(id) {
    expenseToDelete = id;
    if (deleteModal) {
        deleteModal.classList.add('active');
    }
}

function confirmDeleteExpense() {
    if (!expenseToDelete) return;
    
    expenses = expenses.filter(expense => expense.id !== expenseToDelete);
    saveExpenses();
    
    updateDashboard();
    updateRecentExpenses();
    updateHomeCategories();
    renderExpenses();
    updateChart();
    updateProfileSection();
    
    if (deleteModal) {
        deleteModal.classList.remove('active');
    }
    expenseToDelete = null;
    
    showNotification('Expense deleted successfully!', 'success');
}

// Utility Functions
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(reg => {
        console.log("Service Worker registered successfully", reg);
      })
      .catch(err => {
        console.log("Service Worker registration failed", err);
      });
  });
}