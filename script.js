// Expense Tracker Application with Authentication

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const expenseScreen = document.getElementById('expense-screen');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const logoutBtn = document.getElementById('logout-btn');
const currentUserElement = document.getElementById('current-user');
const expenseForm = document.getElementById('expense-form');
const expenseTableBody = document.getElementById('expense-table-body');
const emptyState = document.getElementById('empty-state');
const totalExpenseElement = document.getElementById('total-expense');
const currentMonthElement = document.getElementById('current-month');
const monthExpenseElement = document.getElementById('month-expense');
const topCategoryElement = document.getElementById('top-category');
const categoryTotalsElement = document.getElementById('category-totals');
const filterCategory = document.getElementById('filter-category');
const filterMonth = document.getElementById('filter-month');
const clearFiltersBtn = document.getElementById('clear-filters');
const resetFormBtn = document.getElementById('reset-form');
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const chartBtns = document.querySelectorAll('.chart-btn');
const sendOtpBtn = document.getElementById('send-otp-btn');
const resetChartBtn = document.getElementById('reset-chart');
const colorLegendElement = document.getElementById('color-legend');
const filterStartDate = document.getElementById('filter-start-date');
const filterEndDate = document.getElementById('filter-end-date');
const applyDateRangeBtn = document.getElementById('apply-date-range');
const dateRangeInfo = document.getElementById('date-range-info');
const dateRangeStartElement = document.getElementById('date-range-start');
const dateRangeEndElement = document.getElementById('date-range-end');

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

// Category Colors for Chart and Legend
const categoryColors = {
    'Food': '#FF6384',
    'Travel': '#36A2EB',
    'Shopping': '#FFCE56',
    'Entertainment': '#4BC0C0',
    'Bills': '#9966FF',
    'Healthcare': '#FF9F40',
    'Education': '#8AC926',
    'Other': '#C77DFF'
};

// Initialize the application
function initApp() {
    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();
    
    // Set default end date for filter to today
    const today = new Date().toISOString().split('T')[0];
    filterEndDate.value = today;
    
    // Set default start date to 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filterStartDate.value = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Check if user is already logged in
    const loggedInUser = localStorage.getItem('expenseTrackerUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        showExpenseScreen();
    }
    
    // Load user's expenses if they exist
    loadExpenses();
    
    // Update dashboard
    updateDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize chart
    initChart();
    
    // Update color legend
    updateColorLegend();
}

// Set up all event listeners
function setupEventListeners() {
    // Authentication tabs
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
    
    // Authentication forms
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Send OTP button
    sendOtpBtn.addEventListener('click', sendOTP);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Expense form
    expenseForm.addEventListener('submit', handleAddExpense);
    resetFormBtn.addEventListener('click', resetExpenseForm);
    
    // Filter controls
    filterCategory.addEventListener('change', (e) => {
        filterState.category = e.target.value;
        renderExpenses();
    });
    
    filterMonth.addEventListener('change', (e) => {
        filterState.month = e.target.value;
        renderExpenses();
    });
    
    // Date range filter
    applyDateRangeBtn.addEventListener('click', applyDateRangeFilter);
    
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Delete modal
    confirmDeleteBtn.addEventListener('click', confirmDeleteExpense);
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.remove('active');
    });
    
    // Chart controls
    chartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            chartBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Update chart
            updateChart(btn.dataset.chart);
        });
    });
    
    // Reset chart button
    resetChartBtn.addEventListener('click', resetChart);
}

// Switch between login and signup tabs
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

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    // Simple validation
    if (!username || !password) {
        showFormMessage('Please fill in all fields', 'error', loginForm);
        return;
    }
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('expenseTrackerUsers')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('expenseTrackerUser', JSON.stringify(currentUser));
        showExpenseScreen();
        showFormMessage('Login successful!', 'success', loginForm);
        
        // Clear form
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    } else {
        showFormMessage('Invalid username or password', 'error', loginForm);
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const mobile = document.getElementById('signup-mobile').value.trim();
    const otp = document.getElementById('signup-otp').value.trim();
    
    // Simple validation
    if (!username || !password || !mobile) {
        showFormMessage('Please fill in all required fields', 'error', signupForm);
        return;
    }
    
    // Check if username already exists
    const users = JSON.parse(localStorage.getItem('expenseTrackerUsers')) || [];
    const userExists = users.find(u => u.username === username);
    
    if (userExists) {
        showFormMessage('Username already exists', 'error', signupForm);
        return;
    }
    
    // For demo purposes, we'll accept any OTP that's 6 digits
    // In a real app, you would verify the OTP from a backend service
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        showFormMessage('Please enter a valid 6-digit OTP', 'error', signupForm);
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        username,
        password, // In a real app, you should hash the password
        mobile,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
    
    // Log the user in
    currentUser = newUser;
    localStorage.setItem('expenseTrackerUser', JSON.stringify(currentUser));
    
    showExpenseScreen();
    showFormMessage('Account created successfully!', 'success', signupForm);
    
    // Clear form
    document.getElementById('signup-username').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-mobile').value = '';
    document.getElementById('signup-otp').value = '';
}

// Send OTP (demo function - in real app this would call a backend API)
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
    
    // Generate a random 6-digit OTP for demo
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app, you would send this OTP via SMS
    // For demo, we'll just show it in an alert
    alert(`Demo: OTP sent to ${mobile}: ${otp}\n\nIn a real app, this would be sent via SMS. For this demo, you can use this OTP to sign up.`);
    
    // Enable OTP field
    document.getElementById('signup-otp').disabled = false;
    
    // Disable send button for 60 seconds
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

// Show form message
function showFormMessage(message, type, form) {
    // Remove existing message
    const existingMessage = form.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.id = 'form-message';
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert before submit button
    const submitBtn = form.querySelector('.auth-btn');
    form.insertBefore(messageDiv, submitBtn.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Switch to expense screen
function showExpenseScreen() {
    authScreen.classList.remove('active');
    expenseScreen.classList.add('active');
    
    // Update current user display
    if (currentUser) {
        currentUserElement.textContent = currentUser.username;
    }
    
    // Load user's expenses
    loadExpenses();
    
    // Update UI
    updateDashboard();
    renderExpenses();
    populateMonthFilter();
    
    // Update chart
    updateChart('category');
    
    // Update color legend
    updateColorLegend();
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('expenseTrackerUser');
    
    expenseScreen.classList.remove('active');
    authScreen.classList.add('active');
    
    // Reset to login tab
    switchAuthTab('login');
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Load expenses from localStorage
function loadExpenses() {
    if (!currentUser) return;
    
    const userExpenses = localStorage.getItem(`expenses_${currentUser.id}`);
    expenses = userExpenses ? JSON.parse(userExpenses) : [];
}

// Save expenses to localStorage
function saveExpenses() {
    if (!currentUser) return;
    
    localStorage.setItem(`expenses_${currentUser.id}`, JSON.stringify(expenses));
}

// Handle adding a new expense
function handleAddExpense(e) {
    e.preventDefault();
    
    // Get form values
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value.trim();
    
    // Validation
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
    
    // Create expense object
    const expense = {
        id: generateId(),
        amount,
        category,
        date,
        description: description || `${category} expense`,
        userId: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    // Add to expenses array
    expenses.unshift(expense); // Add to beginning for newest first
    
    // Save to localStorage
    saveExpenses();
    
    // Update UI
    updateDashboard();
    renderExpenses();
    updateChart();
    populateMonthFilter();
    updateColorLegend();
    
    // Show success message
    const formMessage = document.getElementById('form-message');
    formMessage.textContent = 'Expense added successfully!';
    formMessage.className = 'message success';
    
    // Reset form
    resetExpenseForm();
    
    // Hide success message after 3 seconds
    setTimeout(() => {
        formMessage.textContent = '';
        formMessage.className = 'message';
    }, 3000);
}

// Reset expense form
function resetExpenseForm() {
    expenseForm.reset();
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('form-message').textContent = '';
}

// Render expenses table
function renderExpenses() {
    // Clear table body
    expenseTableBody.innerHTML = '';
    
    // Filter expenses based on current filters
    let filteredExpenses = [...expenses];
    
    // Category filter
    if (filterState.category !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === filterState.category);
    }
    
    // Month filter
    if (filterState.month !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const expenseMonthYear = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
            return expenseMonthYear === filterState.month;
        });
    }
    
    // Date range filter
    if (filterState.startDate && filterState.endDate) {
        filteredExpenses = filteredExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const startDate = new Date(filterState.startDate);
            const endDate = new Date(filterState.endDate);
            
            // Set end date to end of day
            endDate.setHours(23, 59, 59, 999);
            
            return expenseDate >= startDate && expenseDate <= endDate;
        });
    }
    
    // Show/hide empty state
    if (filteredExpenses.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        // Add expenses to table
        filteredExpenses.forEach(expense => {
            const row = document.createElement('tr');
            
            // Format date
            const dateObj = new Date(expense.date);
            const formattedDate = dateObj.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            
            // Format amount with Indian Rupee symbol
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

// Apply date range filter
function applyDateRangeFilter() {
    const startDate = filterStartDate.value;
    const endDate = filterEndDate.value;
    
    // Validation
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('Start date cannot be after end date');
        return;
    }
    
    // Update filter state
    filterState.startDate = startDate;
    filterState.endDate = endDate;
    
    // Format dates for display
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
    
    // Update date range info
    dateRangeStartElement.textContent = formattedStartDate;
    dateRangeEndElement.textContent = formattedEndDate;
    dateRangeInfo.style.display = 'flex';
    
    // Render expenses with new filter
    renderExpenses();
}

// Show delete confirmation modal
function showDeleteModal(id) {
    expenseToDelete = id;
    deleteModal.classList.add('active');
}

// Confirm delete expense
function confirmDeleteExpense() {
    if (!expenseToDelete) return;
    
    // Remove expense from array
    expenses = expenses.filter(expense => expense.id !== expenseToDelete);
    
    // Save to localStorage
    saveExpenses();
    
    // Update UI
    updateDashboard();
    renderExpenses();
    updateChart();
    populateMonthFilter();
    updateColorLegend();
    
    // Close modal
    deleteModal.classList.remove('active');
    expenseToDelete = null;
}

// Update dashboard with totals
function updateDashboard() {
    if (expenses.length === 0) {
        totalExpenseElement.textContent = '₹0.00';
        monthExpenseElement.textContent = 'This month: ₹0.00';
        topCategoryElement.textContent = 'None';
        categoryTotalsElement.innerHTML = '<p>No expenses yet</p>';
        return;
    }
    
    // Calculate total expense
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpenseElement.textContent = `₹${totalExpense.toFixed(2)}`;
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();
    currentMonthElement.textContent = `${currentMonth} ${currentYear}`;
    
    // Calculate current month expense
    const currentMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
    });
    
    const monthExpense = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    monthExpenseElement.textContent = `This month: ₹${monthExpense.toFixed(2)}`;
    
    // Calculate category totals
    const categoryTotals = {};
    expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    // Find top category
    let topCategory = 'None';
    let topAmount = 0;
    
    for (const [category, amount] of Object.entries(categoryTotals)) {
        if (amount > topAmount) {
            topCategory = category;
            topAmount = amount;
        }
    }
    
    topCategoryElement.textContent = topCategory;
    
    // Display category totals
    categoryTotalsElement.innerHTML = '';
    
    // Sort categories by amount (descending)
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);
    
    sortedCategories.forEach(([category, amount]) => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        
        categoryItem.innerHTML = `
            <span class="category-name">${category}</span>
            <span class="category-amount">₹${amount.toFixed(2)}</span>
        `;
        
        categoryTotalsElement.appendChild(categoryItem);
    });
}

// Populate month filter dropdown
function populateMonthFilter() {
    if (expenses.length === 0) return;
    
    // Get unique months from expenses
    const monthsSet = new Set();
    
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        monthsSet.add(`${monthYear}|${monthName}`);
    });
    
    // Convert to array and sort (newest first)
    const monthsArray = Array.from(monthsSet)
        .map(item => {
            const [value, label] = item.split('|');
            return { value, label };
        })
        .sort((a, b) => b.value.localeCompare(a.value));
    
    // Clear existing options except "All Months"
    filterMonth.innerHTML = '<option value="all">All Months</option>';
    
    // Add month options
    monthsArray.forEach(month => {
        const option = document.createElement('option');
        option.value = month.value;
        option.textContent = month.label;
        filterMonth.appendChild(option);
    });
}

// Clear all filters
function clearFilters() {
    // Reset filter state
    filterState = {
        category: 'all',
        month: 'all',
        startDate: null,
        endDate: null
    };
    
    // Reset filter UI
    filterCategory.value = 'all';
    filterMonth.value = 'all';
    
    // Reset date range inputs to default
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filterStartDate.value = thirtyDaysAgo.toISOString().split('T')[0];
    filterEndDate.value = today;
    
    // Hide date range info
    dateRangeInfo.style.display = 'none';
    
    // Re-render expenses
    renderExpenses();
}

// Update color legend
function updateColorLegend() {
    colorLegendElement.innerHTML = '';
    
    // Get unique categories from expenses
    const categories = [...new Set(expenses.map(expense => expense.category))];
    
    // If no expenses, show default categories
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
        // Show only categories that have expenses
        categories.forEach(category => {
            const color = categoryColors[category] || '#C77DFF';
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

// Initialize chart with vibrant colors
function initChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    
    // Create initial chart
    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['No Expenses Yet'],
            datasets: [{
                data: [1],
                backgroundColor: ['#e9ecef'],
                borderWidth: 3,
                borderColor: '#ffffff',
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
                        color: '#212529'
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
                    color: '#212529'
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

// Update chart based on selected type with proper colors
function updateChart(type = 'category') {
    if (!currentChart) return;
    
    // Additional colors for when we have more categories
    const additionalColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8AC926', '#C77DFF',
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
    ];
    
    if (expenses.length === 0) {
        currentChart.type = 'doughnut';
        currentChart.data.labels = ['No Expenses Yet'];
        currentChart.data.datasets[0].data = [1];
        currentChart.data.datasets[0].backgroundColor = ['#e9ecef'];
        currentChart.data.datasets[0].borderColor = '#ffffff';
        currentChart.options.plugins.title.text = 'No Expenses Yet';
        currentChart.update();
        return;
    }
    
    if (type === 'category') {
        // Category chart - Doughnut/Pie
        const categoryTotals = {};
        expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += expense.amount;
        });
        
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        
        // Assign colors based on category
        const backgroundColors = labels.map(label => categoryColors[label] || additionalColors[labels.indexOf(label) % additionalColors.length]);
        
        currentChart.type = 'doughnut';
        currentChart.data.labels = labels;
        currentChart.data.datasets[0].data = data;
        currentChart.data.datasets[0].backgroundColor = backgroundColors;
        currentChart.data.datasets[0].borderColor = '#ffffff';
        currentChart.data.datasets[0].borderWidth = 3;
        currentChart.options.plugins.title.text = 'Expenses by Category';
        currentChart.options.plugins.legend.display = true;
        
    } else if (type === 'monthly') {
        // Monthly trend chart - Line
        const monthlyTotals = {};
        
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            
            if (!monthlyTotals[monthYear]) {
                monthlyTotals[monthYear] = 0;
            }
            monthlyTotals[monthYear] += expense.amount;
        });
        
        // Sort by date
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
        currentChart.data.datasets[0].backgroundColor = 'rgba(54, 162, 235, 0.2)';
        currentChart.data.datasets[0].borderColor = '#36A2EB';
        currentChart.data.datasets[0].pointBackgroundColor = '#36A2EB';
        currentChart.data.datasets[0].pointBorderColor = '#ffffff';
        currentChart.data.datasets[0].pointHoverBackgroundColor = '#ffffff';
        currentChart.data.datasets[0].pointHoverBorderColor = '#36A2EB';
        currentChart.data.datasets[0].pointRadius = 6;
        currentChart.data.datasets[0].pointHoverRadius = 8;
        currentChart.data.datasets[0].borderWidth = 3;
        currentChart.data.datasets[0].fill = true;
        currentChart.options.plugins.title.text = 'Monthly Expense Trend';
        currentChart.options.plugins.legend.display = false;
    } else {
        // Reset to category chart if unknown type
        currentChart.type = 'doughnut';
        currentChart.options.plugins.legend.display = true;
    }
    
    currentChart.update();
}

// Reset chart to default view
function resetChart() {
    // Reset chart to category view
    chartBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.chart-btn[data-chart="category"]').classList.add('active');
    updateChart('category');
    
    // Show notification
    showNotification('Chart reset to default view', 'success');
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);