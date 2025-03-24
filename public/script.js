// Get the API URL based on the current environment
function getApiUrl() {
    // Check if we're in production (Heroku) or local development
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000' 
        : '';  // Empty string means use relative URLs in production
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = "tracker.html";
    } else {
        alert("Login failed");
    }
}

async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    // Check if fields are empty
    if (!username) {
        alert("Please enter a username.");
        return;
    }
    else if (!password) {
        alert("Please enter a password.");
        return;
    }

    else {
        const apiUrl = getApiUrl();
        await fetch(`${apiUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
    
        alert("Registration successful!");
    }
}