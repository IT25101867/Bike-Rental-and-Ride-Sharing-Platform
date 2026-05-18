document.addEventListener('DOMContentLoaded', () => {
    
    // Register Form Handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('r-name').value;
            const email = document.getElementById('r-email').value;
            const phone = document.getElementById('r-phone').value;
            const address = document.getElementById('r-address').value;
            const nicNum = document.getElementById('r-nic').value;
            const licenseNum = document.getElementById('r-license').value;
            const password = document.getElementById('r-password').value;
            const statusDiv = document.getElementById('register-status');
            const btn = document.getElementById('btn-register');

            btn.disabled = true;
            btn.innerText = "Registering...";

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, address, nicNum, licenseNum, password })
                });

                const message = await response.text();

                if (response.ok) {
                    statusDiv.innerHTML = `<span class="success"><i class="fa-solid fa-check-circle"></i> ${message} Redirecting to login...</span>`;
                    setTimeout(() => window.location.href = 'login.html', 2000);
                } else {
                    statusDiv.innerHTML = `<span class="error"><i class="fa-solid fa-times-circle"></i> ${message}</span>`;
                    btn.disabled = false;
                    btn.innerText = "Register Account";
                }
            } catch (error) {
                console.error("Registration error:", error);
                statusDiv.innerHTML = `<span class="error"><i class="fa-solid fa-times-circle"></i> Server connection failed. Is the Spring Boot backend running?</span>`;
                btn.disabled = false;
                btn.innerText = "Register Account";
            }
        });
    }

    // Login Form Handling
    let currentLoginType = 'USER'; // Default to USER
    
    const tabUser = document.getElementById('tab-user');
    const tabAdmin = document.getElementById('tab-admin');
    const tabDriver = document.getElementById('tab-driver');
    
    function resetTabs() {
        if(tabUser) { tabUser.style.color = 'var(--text-muted)'; tabUser.style.borderBottom = '2px solid transparent'; }
        if(tabAdmin) { tabAdmin.style.color = 'var(--text-muted)'; tabAdmin.style.borderBottom = '2px solid transparent'; }
        if(tabDriver) { tabDriver.style.color = 'var(--text-muted)'; tabDriver.style.borderBottom = '2px solid transparent'; }
    }

    if (tabUser && tabAdmin) {
        tabUser.addEventListener('click', () => {
            currentLoginType = 'USER';
            resetTabs();
            tabUser.style.color = 'var(--text)';
            tabUser.style.borderBottom = '2px solid var(--primary)';
        });
        
        tabAdmin.addEventListener('click', () => {
            currentLoginType = 'ADMIN';
            resetTabs();
            tabAdmin.style.color = 'var(--text)';
            tabAdmin.style.borderBottom = '2px solid var(--primary)';
        });

        if (tabDriver) {
            tabDriver.addEventListener('click', () => {
                currentLoginType = 'DRIVER';
                resetTabs();
                tabDriver.style.color = 'var(--text)';
                tabDriver.style.borderBottom = '2px solid var(--primary)';
            });
        }
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('l-email').value;
            const password = document.getElementById('l-password').value;
            const statusDiv = document.getElementById('login-status');
            const btn = document.getElementById('btn-login');

            btn.disabled = true;
            btn.innerText = "Logging in...";

            let endpoint = '/api/auth/login';
            if (currentLoginType === 'DRIVER') {
                endpoint = '/api/drivers/login';
            }

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.message === "Login Successful") {
                    if (currentLoginType === 'ADMIN' && data.role !== 'ADMIN') {
                        statusDiv.innerHTML = `<span class="error"><i class="fa-solid fa-times-circle"></i> Access Denied. You are not an Admin.</span>`;
                        btn.disabled = false;
                        btn.innerText = "Login to Account";
                        return;
                    }
                    if (currentLoginType === 'USER' && data.role === 'ADMIN') {
                        statusDiv.innerHTML = `<span class="error"><i class="fa-solid fa-times-circle"></i> Please use the Admin Login tab.</span>`;
                        btn.disabled = false;
                        btn.innerText = "Login to Account";
                        return;
                    }

                    if (data.role === 'ADMIN') {
                        localStorage.setItem('userEmail', email);
                        statusDiv.innerHTML = `<span class="success"><i class="fa-solid fa-check-circle"></i> Login Successful. Redirecting to Admin Panel...</span>`;
                        setTimeout(() => window.location.href = 'admin.html', 1500);
                    } else if (data.role === 'Driver') {
                        localStorage.setItem('driverEmail', email);
                        statusDiv.innerHTML = `<span class="success"><i class="fa-solid fa-check-circle"></i> Login Successful. Redirecting to Driver Dashboard...</span>`;
                        setTimeout(() => window.location.href = 'driver-dashboard.html', 1500);
                    } else {
                        localStorage.setItem('userEmail', email);
                        statusDiv.innerHTML = `<span class="success"><i class="fa-solid fa-check-circle"></i> Login Successful. Redirecting to Homepage...</span>`;
                        setTimeout(() => window.location.href = 'index.html', 1500);
                    }
                } else {
                    statusDiv.innerHTML = `<span class="error"><i class="fa-solid fa-times-circle"></i> ${data.message || 'Login failed'}</span>`;
                    btn.disabled = false;
                    btn.innerText = "Login to Account";
                }
            } catch (error) {
                console.error("Login error:", error);
                statusDiv.innerHTML = `<span class="error"><i class="fa-solid fa-times-circle"></i> Server connection failed. Is the Spring Boot backend running?</span>`;
                btn.disabled = false;
                btn.innerText = "Login to Account";
            }
        });
    }

});
