document.addEventListener('DOMContentLoaded', () => {
    checkAdminName();
    setupSidebar();
    setupUITabs();
    
    // Initialize Dashboard
    loadDashboardMetrics();
    
    // Initialize Modules
    initUserManagement();
    initBikeManagement();
    initRentManagement();
    initPaymentManagement();
    initRideManagement();
    initDriverManagement();
});

async function checkAdminName() {
    let adminName = sessionStorage.getItem('nextRideAdminName');
    let shouldShowPopup = !sessionStorage.getItem('nextRideWelcomed');
    
    if (!adminName) {
        adminName = "Admin";
        const email = localStorage.getItem('userEmail');
        if (email) {
            try {
                const res = await fetch(`/api/users/profile/${email}`);
                if (res.ok) {
                    const user = await res.json();
                    if (user && user.name) {
                        adminName = user.name;
                    }
                }
            } catch(e) { console.error("Failed to fetch admin profile"); }
        }
        sessionStorage.setItem('nextRideAdminName', adminName);
    }
    
    if (shouldShowPopup) {
        showWelcomePopup(adminName);
        sessionStorage.setItem('nextRideWelcomed', 'true');
    }
    
    // Update the dashboard UI text
    const dashNameEl = document.getElementById('dash-admin-name');
    if (dashNameEl) dashNameEl.innerText = adminName;

    // Update the topbar text and avatar
    const topbarNameEl = document.querySelector('.user-info span');
    if (topbarNameEl) topbarNameEl.innerText = adminName;
    const topbarImgEl = document.querySelector('.user-info img');
    if (topbarImgEl) topbarImgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=3b82f6&color=fff`;
}

async function loadDashboardMetrics() {
    try {
        // 1. Total Users
        try {
            const uRes = await fetch('/api/auth/users');
            if(uRes.ok) {
                const users = await uRes.json();
                document.getElementById('dash-user-count').innerText = users.length;
            }
        } catch(e) {}

        // 2. Total Bikes
        try {
            const bRes = await fetch('/api/bikes/all');
            if(bRes.ok) {
                const bikes = await bRes.json();
                document.getElementById('dash-bike-count').innerText = bikes.length;
            }
        } catch(e) {}

        // 3. Active Rentals
        try {
            const rRes = await fetch('/api/bookings/all-rentals');
            if(rRes.ok) {
                const rentals = await rRes.json();
                // Consider active if returnDate is null or status not returned
                const activeRentals = rentals.filter(r => !r.returnDate || r.returnDate.trim() === '');
                document.getElementById('dash-rental-count').innerText = activeRentals.length;
            }
        } catch(e) {}

        // 4. Revenue
        try {
            const pRes = await fetch('/api/payments');
            if(pRes.ok) {
                const payments = await pRes.json();
                const totalRevenue = payments
                    .filter(p => p.status === 'Completed')
                    .reduce((sum, p) => sum + (p.amount || 0), 0);
                document.getElementById('dash-revenue').innerText = 'Rs. ' + totalRevenue.toLocaleString();
            }
        } catch(e) {}
    } catch(err) {
        console.error("Error loading dashboard metrics", err);
    }
}

function showWelcomePopup(name) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: `Hello, ${name}! 👋`,
            text: 'Welcome back to your colorful dashboard!',
            icon: 'success',
            confirmButtonText: 'Let\'s Go!',
            confirmButtonColor: '#10b981',
            timer: 3000,
            timerProgressBar: true,
            backdrop: `
                rgba(0,0,123,0.4)
                left top
                no-repeat
            `
        });
    }
}

// Nested UI Tabs Navigation
function setupUITabs() {
    const tabBtns = document.querySelectorAll('.ui-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Find parent section
            const section = e.target.closest('.view-section');
            // Remove active from all tabs in this section
            section.querySelectorAll('.ui-tab-btn').forEach(b => b.classList.remove('active'));
            section.querySelectorAll('.ui-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active to clicked
            e.target.classList.add('active');
            const targetId = e.target.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Sidebar Navigation
function setupSidebar() {
    const navItems = document.querySelectorAll('.nav-menu li');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// ==============================================
// 01 USER MANAGEMENT (Dewmith M.D.A)
// ==============================================
function initUserManagement() {

    // UI 1: Register User
    document.getElementById('user-register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUser = {
            name: document.getElementById('ur-name').value,
            email: document.getElementById('ur-email').value,
            phone: document.getElementById('ur-phone').value,
            address: document.getElementById('ur-address').value,
            nicNum: document.getElementById('ur-nic').value,
            licenseNum: document.getElementById('ur-license').value,
            password: document.getElementById('ur-pass').value
        };

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            
            if (res.ok) {
                alert('User Registered Successfully!');
                e.target.reset();
                renderUsers();
            } else {
                const msg = await res.text();
                alert('Failed to register user: ' + msg);
            }
        } catch(err) {
            alert('Server error.');
        }
    });

    // UI 2: Modify User
    document.getElementById('btn-load-user').addEventListener('click', async () => {
        const id = document.getElementById('um-id').value;
        if (!id) {
            alert('Please enter a User ID');
            return;
        }
        
        try {
            const res = await fetch('/api/auth/users/id/' + id);
            if (res.ok) {
                const user = await res.json();
                document.getElementById('um-email').value = user.email;
                document.getElementById('um-phone').value = user.phone || '';
                document.getElementById('um-address').value = user.address || '';
                document.getElementById('um-nic').value = user.nicNum || '';
                document.getElementById('um-license').value = user.licenseNum || '';
            } else {
                alert('User not found!');
            }
        } catch(e) {
            alert('Error connecting to server.');
        }
    });

    document.getElementById('user-modify-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('um-id').value;
        if (!id) return;
        
        const updatedUser = {
            email: document.getElementById('um-email').value,
            phone: document.getElementById('um-phone').value,
            address: document.getElementById('um-address').value,
            nicNum: document.getElementById('um-nic').value,
            licenseNum: document.getElementById('um-license').value
        };

        try {
            const res = await fetch('/api/auth/users/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });
            
            if (res.ok) {
                alert('User Details Updated!');
                e.target.reset();
                if(typeof renderUsers === 'function') renderUsers();
            } else {
                alert('Failed to update user.');
            }
        } catch(e) {
            alert('Error connecting to server.');
        }
    });

    // UI 3: Remove User
    async function renderUsers() {
        try {
            const res = await fetch('/api/auth/users');
            if (res.ok) {
                const dbUsers = await res.json();
                const tbody = document.getElementById('user-list-tbody');
                tbody.innerHTML = '';
                dbUsers.forEach(u => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${u.id || '-'}</td>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td>${u.phone || '-'}</td>
                            <td>${u.address || '-'}</td>
                            <td>${u.nicNum || '-'}</td>
                            <td>${u.licenseNum || '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Remove</button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch(e) {
            console.error("Failed to load users from DB", e);
        }
    }
    
    window.deleteUser = async function(id) {
        if (!id) return;
        if (confirm('Are you sure you want to permanently remove this user?')) {
            try {
                const res = await fetch('/api/auth/users/' + id, { method: 'DELETE' });
                if (res.ok) {
                    alert('User removed successfully!');
                    renderUsers();
                } else {
                    alert('Failed to remove user.');
                }
            } catch(e) {
                alert('Server error.');
            }
        }
    };

    // UI 4: Find User by Name
    document.querySelector('[data-target="u-ui-4"]').addEventListener('click', () => {
        document.getElementById('us-name').value = '';
        document.getElementById('user-search-tbody').innerHTML = '';
    });

    document.getElementById('us-name').addEventListener('input', () => {
        document.getElementById('user-search-tbody').innerHTML = '';
    });

    document.getElementById('btn-search-user').addEventListener('click', async () => {
        const nameInput = document.getElementById('us-name').value;
        if (!nameInput) {
            alert('Please enter a name to search.');
            return;
        }

        try {
            const res = await fetch('/api/auth/users/search?name=' + encodeURIComponent(nameInput));
            const tbody = document.getElementById('user-search-tbody');
            tbody.innerHTML = '';
            
            if (res.ok) {
                const users = await res.json();
                if (users.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users found.</td></tr>';
                } else {
                    users.forEach(u => {
                        tbody.innerHTML += `
                            <tr>
                                <td>${u.id || '-'}</td>
                                <td>${u.name}</td>
                                <td>${u.email}</td>
                                <td>${u.phone || '-'}</td>
                                <td>${u.nicNum || '-'}</td>
                            </tr>
                        `;
                    });
                }
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Failed to fetch results.</td></tr>';
            }
        } catch(e) {
            alert('Error connecting to server.');
        }
    });

    renderUsers();
}

// ==============================================
// 02 BIKE MANAGEMENT (Wijewikrama S.N)
// ==============================================
function initBikeManagement() {
    // UI 1: Add Bike
    document.getElementById('bike-add-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newBike = {
            brand: document.getElementById('ba-brand').value,
            model: document.getElementById('ba-model').value,
            color: document.getElementById('ba-color').value,
            engineCapacity: document.getElementById('ba-engine').value,
            registrationNumber: document.getElementById('ba-reg').value,
            year: parseInt(document.getElementById('ba-year').value),
            status: document.getElementById('ba-status').value,
            price: parseFloat(document.getElementById('ba-price').value)
        };
        
        try {
            const res = await fetch('/api/bikes/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBike)
            });
            if (res.ok) {
                alert('Bike Added Successfully!');
                e.target.reset();
                renderBikes();
            } else {
                alert('Failed to add bike.');
            }
        } catch(e) {
            alert('Server error.');
        }
    });

    // UI 2: Search Bike
    document.getElementById('btn-search-bike').addEventListener('click', async () => {
        const query = document.getElementById('bs-id').value.trim();
        const resDiv = document.getElementById('search-bike-result');
        if (!query) return;
        
        try {
            const res = await fetch('/api/bikes/search?query=' + encodeURIComponent(query));
            if(res.ok) {
                const bikes = await res.json();
                
                if (bikes.length === 0) {
                    resDiv.innerHTML = `<p class="text-danger">No bikes found matching "${query}"!</p>`;
                    return;
                }

                resDiv.innerHTML = ''; // Clear previous results
                
                bikes.forEach(bike => {
                    const statusColor = bike.status === 'Available' ? '#dcfce7' : (bike.status === 'Maintenance' ? '#fef3c7' : '#fee2e2');
                    const statusTextColor = bike.status === 'Available' ? '#166534' : (bike.status === 'Maintenance' ? '#92400e' : '#991b1b');
                    
                    resDiv.innerHTML += `
                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin-top: 20px; transition: all 0.3s ease;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
                                <div>
                                    <h3 style="margin: 0; color: #0f172a; font-size: 1.5rem; font-weight: 700;">${bike.brand || ''} ${bike.model || 'Unknown Bike'}</h3>
                                    <span style="color: #64748b; font-size: 0.9rem; font-weight: 500;">ID: #${bike.id}</span>
                                </div>
                                <span style="background: ${statusColor}; color: ${statusTextColor}; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.5px;">
                                    ${bike.status || 'Unknown'}
                                </span>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                                <div style="display: flex; flex-direction: column;">
                                    <span style="color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px;">Registration</span>
                                    <strong style="color: #1e293b; font-size: 1.05rem;">${bike.registrationNumber || '-'}</strong>
                                </div>
                                <div style="display: flex; flex-direction: column;">
                                    <span style="color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px;">Color</span>
                                    <strong style="color: #1e293b; font-size: 1.05rem;">${bike.color || '-'}</strong>
                                </div>
                                <div style="display: flex; flex-direction: column;">
                                    <span style="color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px;">Engine</span>
                                    <strong style="color: #1e293b; font-size: 1.05rem;">${bike.engineCapacity || '-'}</strong>
                                </div>
                                <div style="display: flex; flex-direction: column;">
                                    <span style="color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px;">Year</span>
                                    <strong style="color: #1e293b; font-size: 1.05rem;">${bike.year || '-'}</strong>
                                </div>
                            </div>
                            
                            <div style="margin-top: 24px; background: #f8fafc; padding: 16px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0;">
                                <span style="color: #475569; font-size: 1rem; font-weight: 600;">Daily Rental Rate</span>
                                <div>
                                    <strong style="font-size: 1.5rem; color: #3b82f6; font-weight: 800;">Rs. ${bike.price || 0}</strong>
                                    <span style="color: #64748b; font-size: 0.9rem; font-weight: 500;">/ day</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                resDiv.innerHTML = `<p class="text-danger">Failed to search bikes!</p>`;
            }
        } catch(e) {
            resDiv.innerHTML = `<p class="text-danger">Server error.</p>`;
        }
    });

    // UI 3: Update/Remove Bike list
    async function renderBikes() {
        try {
            const res = await fetch('/api/bikes/all');
            if (res.ok) {
                const bikes = await res.json();
                const tbody = document.getElementById('bike-list-tbody');
                tbody.innerHTML = '';
                bikes.forEach(b => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${b.id}</td>
                            <td>${b.brand || '-'}</td>
                            <td>${b.model || '-'}</td>
                            <td>${b.color || '-'}</td>
                            <td>${b.engineCapacity || '-'}</td>
                            <td>${b.registrationNumber || '-'}</td>
                            <td>${b.year || '-'}</td>
                            <td>${b.status || '-'}</td>
                            <td>Rs. ${b.price || 0}</td>
                            <td>
                                <button class="btn btn-sm btn-warning" onclick="editBike(${b.id})">Edit</button> 
                                <button class="btn btn-sm btn-danger" onclick="deleteBike(${b.id})">Remove</button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch(e) {
            console.error('Failed to load bikes from DB');
        }
    }
    
    // Bike Edit functionality
    window.editBike = async function(id) {
        try {
            const res = await fetch('/api/bikes/' + id);
            if (res.ok) {
                const b = await res.json();
                document.getElementById('be-id').value = b.id;
                document.getElementById('be-id-display').innerText = b.id;
                document.getElementById('be-brand').value = b.brand || '';
                document.getElementById('be-model').value = b.model || '';
                document.getElementById('be-color').value = b.color || '';
                document.getElementById('be-engine').value = b.engineCapacity || '';
                document.getElementById('be-reg').value = b.registrationNumber || '';
                document.getElementById('be-year').value = b.year || '';
                document.getElementById('be-status').value = b.status || 'Available';
                document.getElementById('be-price').value = b.price || '';
                document.getElementById('bike-edit-container').style.display = 'block';
                // Scroll to the edit form
                document.getElementById('bike-edit-container').scrollIntoView({behavior: 'smooth'});
            } else {
                alert('Failed to fetch bike details.');
            }
        } catch(e) {
            alert('Server error.');
        }
    };

    // Handle Edit Form Submission
    document.getElementById('bike-edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('be-id').value;
        const updatedBike = {
            brand: document.getElementById('be-brand').value,
            model: document.getElementById('be-model').value,
            color: document.getElementById('be-color').value,
            engineCapacity: document.getElementById('be-engine').value,
            registrationNumber: document.getElementById('be-reg').value,
            year: parseInt(document.getElementById('be-year').value),
            status: document.getElementById('be-status').value,
            price: parseFloat(document.getElementById('be-price').value)
        };
        try {
            const res = await fetch('/api/bikes/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBike)
            });
            if (res.ok) {
                alert('Bike Updated Successfully!');
                document.getElementById('bike-edit-container').style.display = 'none';
                renderBikes();
            } else {
                alert('Failed to update bike.');
            }
        } catch(e) {
            alert('Server error.');
        }
    });

    // Bike Delete functionality
    window.deleteBike = async function(id) {
        if (confirm('Are you sure you want to completely remove this bike?')) {
            try {
                const res = await fetch('/api/bikes/' + id, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    alert('Bike Removed Successfully!');
                    renderBikes();
                } else {
                    alert('Failed to remove bike.');
                }
            } catch(e) {
                alert('Server error.');
            }
        }
    };

    renderBikes();
}

// ==============================================
// 03 RENT BOOKING MANAGEMENT (Peramunage M.T)
// ==============================================
function initRentManagement() {
    // UI 1: Check Availability
    document.getElementById('btn-check-avail').addEventListener('click', async () => {
        const statusDiv = document.getElementById('ra-status');
        const query = document.getElementById('ra-bikeid').value.trim();
        if(!query) return;
        
        statusDiv.innerText = 'Checking...';
        statusDiv.style.color = '#64748b';
        
        try {
            const res = await fetch('/api/bikes/search?query=' + encodeURIComponent(query));
            if(res.ok) {
                const bikes = await res.json();
                if (bikes.length === 0) {
                    statusDiv.style.color = '#dc2626';
                    statusDiv.innerText = 'Bike not found!';
                    return;
                }
                const bike = bikes[0];
                if (bike.status === 'Available') {
                    statusDiv.style.color = '#10b981';
                    statusDiv.innerText = 'Available for Booking!';
                } else {
                    statusDiv.style.color = '#dc2626';
                    statusDiv.innerText = `Not Available (Currently ${bike.status})`;
                }
            } else {
                statusDiv.style.color = '#dc2626';
                statusDiv.innerText = 'Failed to check.';
            }
        } catch(e) {
            statusDiv.style.color = '#dc2626';
            statusDiv.innerText = 'Server error.';
        }
    });

    // UI 2: Reserve Bike
    document.getElementById('rent-reserve-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('rr-useremail').value;
        const bikeId = document.getElementById('rr-bikeid').value;
        const days = document.getElementById('rr-days').value;
        
        try {
            const res = await fetch('/api/bookings/rent-bike', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: email,
                    bikeId: bikeId,
                    days: parseInt(days)
                })
            });
            if (res.ok) {
                const savedRental = await res.json();
                alert('Bike successfully reserved! Redirecting to Handover Schedule...');
                e.target.reset();
                loadAllRentals(); // Refresh Active Rentals
                if (typeof loadPayments === 'function') loadPayments(); // Refresh payments
                
                // REDIRECT TO HANDOVER UI 3
                const rUi3Btn = document.querySelector('.ui-tab-btn[data-target="r-ui-3"]');
                if(rUi3Btn) rUi3Btn.click();
                
                // Set the reservation ID in the handover form
                const resIdInput = document.getElementById('rs-resid');
                if(resIdInput && savedRental.id) {
                    resIdInput.value = savedRental.id;
                }
            } else {
                alert('Failed to reserve bike. Check Bike ID and User Email.');
            }
        } catch(err) {
            alert('Server error while reserving bike.');
        }
    });

    // UI 3: Handover Schedule
    document.getElementById('rent-schedule-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const rentalId = document.getElementById('rs-resid').value;
        const returnTime = document.getElementById('rs-return').value;
        if (!returnTime) {
            alert('Please specify a return time.');
            return;
        }
        try {
            const res = await fetch(`/api/bookings/schedule-handover/${rentalId}?returnTime=${encodeURIComponent(returnTime)}`, { method: 'POST' });
            if (res.ok) {
                alert('Handover and Return Schedule Saved successfully!');
                e.target.reset();
                loadAllRentals();
            } else {
                alert('Failed to schedule handover. Check Rental ID.');
            }
        } catch(err) {
            alert('Server error.');
        }
    });

    // UI 4: Active Rentals
    loadAllRentals();
}

async function loadAllRentals() {
    try {
        const res = await fetch('/api/bookings/all-rentals');
        const tbody = document.getElementById('rentals-tbody');
        if (!tbody) return;
        
        if (res.ok) {
            const rentals = await res.json();
            tbody.innerHTML = '';
            if (rentals.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No active rentals found.</td></tr>';
                return;
            }
            rentals.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${r.id}</td>
                    <td>${r.userName || '-'}</td>
                    <td>${r.userEmail || '-'}</td>
                    <td>${r.bikeId || '-'}</td>
                    <td id="rental-model-${r.id}">${r.bikeModel || 'Loading...'}</td>
                    <td>${r.rentalDate || '-'}</td>
                    <td><span class="status-badge" style="background: ${r.status === 'Completed' ? '#dcfce7' : '#fee2e2'}; color: ${r.status === 'Completed' ? '#166534' : '#991b1b'}; padding: 4px 8px; border-radius: 4px;">${r.status || 'Active'}</span></td>
                    <td>
                        ${r.status !== 'Completed' ? `<button class="btn btn-sm btn-warning mb-1" onclick="completeHandover(${r.id})">Mark Returned</button>` : ''}
                        <button class="btn btn-sm btn-primary mb-1" onclick='editRental(${JSON.stringify(r).replace(/'/g, "&apos;")})'>Edit</button>
                        <button class="btn btn-sm btn-danger mb-1" onclick="deleteRental(${r.id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);

                // Fetch bike model through bike ID if it is missing
                if ((!r.bikeModel || r.bikeModel === 'Unknown') && r.bikeId) {
                    fetch('/api/bikes/' + r.bikeId)
                        .then(bRes => {
                            if(bRes.ok) return bRes.json();
                            throw new Error('Not found');
                        })
                        .then(data => {
                            const modelStr = (data.brand || '') + ' ' + (data.model || '');
                            document.getElementById('rental-model-' + r.id).innerText = modelStr.trim() || 'Unknown';
                        })
                        .catch(err => {
                            document.getElementById('rental-model-' + r.id).innerText = 'Unknown';
                        });
                } else if (!r.bikeModel) {
                    document.getElementById('rental-model-' + r.id).innerText = '-';
                }
            });
        }
    } catch(e) {
        console.error('Failed to load rentals', e);
    }
}

window.completeHandover = async function(rentalId) {
    if(!confirm('Are you sure the bike has been returned?')) return;
    try {
        const res = await fetch(`/api/bookings/complete-handover/${rentalId}`, { method: 'POST' });
        if (res.ok) {
            alert('Bike successfully marked as returned and is now Available.');
            loadAllRentals();
        } else {
            alert('Failed to complete handover.');
        }
    } catch(err) {
        alert('Server error.');
    }
}

window.editRental = function(r) {
    document.getElementById('re-id').value = r.id;
    document.getElementById('re-useremail').value = r.userEmail || '';
    document.getElementById('re-bikeid').value = r.bikeId || '';
    document.getElementById('re-days').value = r.days || '';
    document.getElementById('re-status').value = r.status || 'Active';
    
    document.getElementById('rental-edit-container').style.display = 'block';
    document.getElementById('rental-edit-container').scrollIntoView({behavior: 'smooth'});
};

document.getElementById('rental-edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('re-id').value;
    const updatedRental = {
        userEmail: document.getElementById('re-useremail').value,
        bikeId: document.getElementById('re-bikeid').value,
        days: parseInt(document.getElementById('re-days').value),
        status: document.getElementById('re-status').value
    };
    try {
        const res = await fetch('/api/bookings/rentals/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedRental)
        });
        if (res.ok) {
            alert('Rental Updated Successfully!');
            document.getElementById('rental-edit-container').style.display = 'none';
            loadAllRentals();
        } else {
            alert('Failed to update rental.');
        }
    } catch(e) {
        alert('Server error.');
    }
});

window.deleteRental = async function(id) {
    if (confirm('Are you sure you want to delete this rental booking?')) {
        try {
            const res = await fetch('/api/bookings/rentals/' + id, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('Rental Removed Successfully!');
                loadAllRentals();
            } else {
                alert('Failed to remove rental.');
            }
        } catch(e) {
            alert('Server error.');
        }
    }
};

// ==============================================
// 04 PAYMENT & BILLING MANAGEMENT (Samarasekara J.S.M.SA)
// ==============================================
function initPaymentManagement() {
    // Auto-generate Ref ID for manual payments
    function generatePaymentRefId() {
        const refInput = document.getElementById('pr-ref');
        if (refInput) {
            refInput.value = Math.floor(100000 + Math.random() * 900000);
        }
    }
    generatePaymentRefId();

    // UI 1: Record Payment
    document.getElementById('pay-record-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPayment = {
            rentalId: parseInt(document.getElementById('pr-ref').value),
            userEmail: document.getElementById('pr-email').value,
            amount: parseFloat(document.getElementById('pr-amount').value),
            status: document.getElementById('pr-status').value
        };
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPayment)
            });
            if (res.ok) {
                alert('Payment Recorded Successfully!');
                e.target.reset();
                generatePaymentRefId();
                loadPayments();
            } else {
                alert('Failed to record payment.');
            }
        } catch(err) {
            alert('Server error.');
        }
    });

    // UI 2: Load Payment
    document.getElementById('btn-load-payment').addEventListener('click', async () => {
        const id = document.getElementById('pu-id').value;
        if (!id) return;
        try {
            const res = await fetch('/api/payments/' + id);
            if (res.ok) {
                const p = await res.json();
                document.getElementById('pu-ref').value = p.rentalId || '';
                document.getElementById('pu-email').value = p.userEmail || '';
                document.getElementById('pu-amount').value = p.amount || '';
                document.getElementById('pu-status').value = p.status || 'Pending';
                alert('Payment details loaded.');
            } else {
                alert('Payment not found.');
            }
        } catch(err) {
            alert('Server error.');
        }
    });

    // UI 2: Update Payment Details
    document.getElementById('pay-update-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('pu-id').value;
        const updatedPayment = {
            rentalId: parseInt(document.getElementById('pu-ref').value),
            userEmail: document.getElementById('pu-email').value,
            amount: parseFloat(document.getElementById('pu-amount').value),
            status: document.getElementById('pu-status').value
        };
        try {
            const res = await fetch('/api/payments/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPayment)
            });
            if (res.ok) {
                alert(`Payment #${id} Updated Successfully!`);
                e.target.reset();
                loadPayments();
            } else {
                alert('Failed to update payment.');
            }
        } catch(err) {
            alert('Server error.');
        }
    });

    // UI 3: View History
    loadPayments();
}

async function loadPayments() {
    try {
        const res = await fetch('/api/payments');
        if (res.ok) {
            const payments = await res.json();
            const tbody = document.getElementById('pay-list-tbody');
            if(!tbody) return;
            tbody.innerHTML = '';
            if (payments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No payments found.</td></tr>';
                return;
            }
            payments.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${p.id}</td>
                    <td>Rental #${p.rentalId} <button class="btn btn-sm" style="background:#f1f5f9; color:#475569; padding: 2px 6px; font-size: 0.8rem; margin-left: 5px; border: 1px solid #cbd5e1;" onclick="viewPaymentDetails(${p.rentalId})" title="View Customer & Bike Info"><i class="fa-solid fa-eye"></i> Info</button></td>
                    <td>${p.userId ? '#' + p.userId : '-'}</td>
                    <td>${p.userName || '-'}</td>
                    <td>Rs. ${p.amount}</td>
                    <td><span class="status-badge" style="background: ${p.status==='Completed'?'#dcfce7':'#fef3c7'}; color: ${p.status==='Completed'?'#166534':'#92400e'}; padding: 4px 8px; border-radius: 4px;">${p.status}</span></td>
                    <td>${p.status !== 'Completed' ? `<button class="btn btn-sm btn-primary" onclick="markPaymentPaid(${p.id})">Mark Paid</button>` : '-'} 
                    <button class="btn btn-sm btn-danger" onclick="deletePayment(${p.id})">Delete</button></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(e) {
        console.error('Failed to load payments', e);
    }
}

window.markPaymentPaid = async function(id) {
    if(!confirm('Are you sure you want to mark this bill as Paid?')) return;
    try {
        const res = await fetch(`/api/payments/${id}/status?status=Completed`, { method: 'PUT' });
        if (res.ok) {
            alert('Bill successfully marked as Paid!');
            loadPayments();
        } else {
            alert('Failed to update payment.');
        }
    } catch(err) {
        alert('Server error.');
    }
}

window.deletePayment = async function(id) {
    if(!confirm('Are you sure you want to permanently remove this payment?')) return;
    try {
        const res = await fetch('/api/payments/' + id, { method: 'DELETE' });
        if (res.ok) {
            alert('Payment successfully deleted!');
            loadPayments();
        } else {
            alert('Failed to delete payment.');
        }
    } catch(err) {
        alert('Server error.');
    }
}

window.viewPaymentDetails = async function(rentalId) {
    const modal = document.getElementById('payment-details-modal');
    const content = document.getElementById('payment-details-content');
    modal.style.display = 'flex';
    content.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading details...';

    try {
        const res = await fetch('/api/bookings/all-rentals');
        if (res.ok) {
            const rentals = await res.json();
            const rental = rentals.find(r => r.id === rentalId);
            if (rental) {
                let displayModel = rental.bikeModel;
                if (!displayModel || displayModel === 'Unknown') {
                    try {
                        const bRes = await fetch('/api/bikes/' + rental.bikeId);
                        if (bRes.ok) {
                            const bikeData = await bRes.json();
                            displayModel = (bikeData.brand || '') + ' ' + (bikeData.model || '');
                        }
                    } catch(e) {}
                }
                
                content.innerHTML = `
                    <p style="margin-bottom: 8px;"><strong><i class="fa-solid fa-user"></i> Customer Name:</strong> <span style="color:#0f172a">${rental.userName || 'Unknown'}</span></p>
                    <p style="margin-bottom: 8px;"><strong><i class="fa-solid fa-envelope"></i> Email:</strong> <span style="color:#0f172a">${rental.userEmail || 'Unknown'}</span></p>
                    <p style="margin-bottom: 8px;"><strong><i class="fa-solid fa-motorcycle"></i> Bike Rented:</strong> <span style="color:#0f172a">${displayModel || 'Unknown'} (ID: ${rental.bikeId || 'N/A'})</span></p>
                    <p style="margin-bottom: 8px;"><strong><i class="fa-solid fa-calendar"></i> Rental Date:</strong> <span style="color:#0f172a">${rental.rentalDate || '-'}</span></p>
                `;
            } else {
                content.innerHTML = '<p class="text-danger">Rental details not found.</p>';
            }
        } else {
            content.innerHTML = '<p class="text-danger">Failed to fetch rental info.</p>';
        }
    } catch(err) {
        content.innerHTML = '<p class="text-danger">Server error.</p>';
    }
}

// ==============================================
// 05 RIDE MANAGEMENT (Jayasinghe M.G.V.S)
// ==============================================
function initRideManagement() {
    loadAllRides();
}

window.loadAllRides = async function() {
    try {
        const res = await fetch('/api/bookings/all-rides');
        if (res.ok) {
            const rides = await res.json();
            
            const pendingTbody = document.getElementById('ride-pending-tbody');
            const activeTbody = document.getElementById('ride-active-tbody');
            const historyTbody = document.getElementById('ride-history-tbody');
            
            if(pendingTbody) pendingTbody.innerHTML = '';
            if(activeTbody) activeTbody.innerHTML = '';
            if(historyTbody) historyTbody.innerHTML = '';
            
            rides.forEach(r => {
                if (r.status === 'Pending') {
                    pendingTbody.innerHTML += `<tr>
                        <td>#${r.id}</td>
                        <td>${r.userEmail}</td>
                        <td>${r.startLocation}</td>
                        <td>${r.endLocation}</td>
                        <td>${r.rideDate} ${r.rideTime || ''}</td>
                        <td><span class="status-badge" style="background:#dbeafe; color:#1e40af;">${r.vehicleType || 'Any'}</span></td>
                        <td><button class="btn btn-sm btn-primary" onclick="acceptRide(${r.id}, '${r.vehicleType || ''}')">Accept Ride</button></td>
                    </tr>`;
                } else if (r.status === 'Assigned') {
                    activeTbody.innerHTML += `<tr>
                        <td>#${r.id}</td>
                        <td>${r.userEmail}</td>
                        <td>${r.startLocation} to ${r.endLocation}</td>
                        <td><strong style="color: #f59e0b;">Assigned to ${r.driverName || 'Unknown'} (Waiting)</strong></td>
                        <td>-</td>
                    </tr>`;
                } else if (r.status === 'Accepted' || r.status === 'InProgress') {
                    activeTbody.innerHTML += `<tr>
                        <td>#${r.id}</td>
                        <td>${r.userEmail}</td>
                        <td>${r.startLocation} to ${r.endLocation}</td>
                        <td><strong style="color: #3b82f6;">${r.driverName || 'Unknown'}</strong></td>
                        <td><button class="btn btn-sm btn-warning" onclick="completeRide(${r.id})">Mark Completed</button></td>
                    </tr>`;
                } else {
                    historyTbody.innerHTML += `<tr>
                        <td>#${r.id}</td>
                        <td>${r.userEmail}</td>
                        <td>${r.startLocation} to ${r.endLocation}</td>
                        <td>${r.driverName || '-'}</td>
                        <td><span class="status-badge" style="background:#dcfce7; color:#166534; padding:4px 8px; border-radius:4px; font-size: 0.85rem;">${r.status}</span></td>
                    </tr>`;
                }
            });
        }
    } catch (e) {
        console.error('Failed to load rides', e);
    }
}

window.acceptRide = async function(id, requestedVehicleType) {
    if (typeof Swal === 'undefined') {
        const driverName = prompt('Enter your Driver Name to accept this ride:');
        if (!driverName) return;
        submitRideAcceptance(id, driverName);
        return;
    }

    try {
        const res = await fetch('/api/drivers/all');
        let optionsHtml = '';
        if (res.ok) {
            let drivers = await res.json();
            drivers = drivers.filter(d => d.status === 'Available');
            
            if (requestedVehicleType) {
                drivers = drivers.filter(d => d.vehicleType === requestedVehicleType);
            }

            if (drivers.length === 0) {
                Swal.fire('No Drivers', 'No available drivers found matching the requested vehicle type.', 'info');
                return;
            }

            drivers.forEach(d => {
                optionsHtml += `<option value="${d.name}">${d.name} (${d.licenseNumber} - ${d.vehicleType || 'Unknown'})</option>`;
            });
        }
        
        const { value: driverName } = await Swal.fire({
            title: `Assign ${requestedVehicleType || ''} Driver to Ride`,
            html: `
                <p style="margin-bottom: 10px; font-size: 0.9rem; color: #64748b;">Search and select a driver from the database</p>
                <input list="driver-datalist" id="swal-driver-input" class="swal2-input" placeholder="Type to search drivers...">
                <datalist id="driver-datalist">
                    ${optionsHtml}
                </datalist>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            confirmButtonText: 'Assign Driver',
            preConfirm: () => {
                const val = document.getElementById('swal-driver-input').value;
                if (!val) {
                    Swal.showValidationMessage('Please select or enter a driver name');
                }
                return val;
            }
        });

        if (driverName) {
            submitRideAcceptance(id, driverName);
        }
    } catch (e) {
        alert('Error loading drivers');
    }
}

async function submitRideAcceptance(id, driverName) {
    try {
        const res = await fetch(`/api/bookings/accept-ride/${id}?driverName=${encodeURIComponent(driverName)}`, { method: 'POST' });
        if (res.ok) {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Success!', 'Ride Assigned to ' + driverName, 'success');
            } else {
                alert('Ride Accepted successfully!');
            }
            loadAllRides();
            document.querySelector('.ui-tab-btn[data-target="ri-ui-2"]').click();
        } else {
            alert('Failed to accept ride.');
        }
    } catch (e) {
        alert('Server error.');
    }
}

window.completeRide = async function(id) {
    if (!confirm('Are you sure you want to mark this ride as completed?')) return;
    try {
        const res = await fetch(`/api/bookings/complete-ride/${id}`, { method: 'POST' });
        if (res.ok) {
            alert('Ride marked as completed!');
            loadAllRides();
            // Switch to UI 3
            document.querySelector('.ui-tab-btn[data-target="ri-ui-3"]').click();
            if (typeof loadDriverSalaries === 'function') loadDriverSalaries();
        } else {
            alert('Failed to complete ride.');
        }
    } catch (e) {
        alert('Server error.');
    }
}

// ==============================================
// 06 RIDE DRIVER MANAGEMENT (Dhananjaya R.A.H)
// ==============================================
function initDriverManagement() {
    // UI 1: Register Driver
    document.getElementById('driver-register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const driverName = document.getElementById('dr-name').value;
        const driverEmail = document.getElementById('dr-email').value;
        const driverPass = document.getElementById('dr-pass').value;
        const driverLic = document.getElementById('dr-lic').value;
        const driverPhone = document.getElementById('dr-phone').value;
        const driverVehicle = document.getElementById('dr-vehicle').value;
        const driverType = document.getElementById('dr-type').value;
        
        try {
            const res = await fetch('/api/drivers/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: driverName,
                    email: driverEmail,
                    password: driverPass,
                    licenseNumber: driverLic,
                    phoneNumber: driverPhone,
                    vehicleNumber: driverVehicle,
                    vehicleType: driverType,
                    status: 'Available'
                })
            });
            if (res.ok) {
                const newDriver = await res.json();
                alert(`Driver Registered successfully! DB ID: ${newDriver.id}`);
                e.target.reset();
            } else {
                alert('Failed to register driver.');
            }
        } catch(err) {
            alert('Server error while connecting to Driver Database.');
        }
    });

    // UI 4: Driver Salary History
    loadDriverSalaries();

    // UI 5: Manage Drivers
    loadAllDrivers();
    setupDriverSearch();
    setupDriverEditForm();
}

let allSalaries = [];

async function loadDriverSalaries() {
    try {
        const res = await fetch('/api/drivers/salaries');
        const tbody = document.getElementById('driver-salary-tbody');
        if (!tbody) return;
        
        if (res.ok) {
            allSalaries = await res.json();
            populateDriverFilter();
            renderSalaries();
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Failed to fetch salary history.</td></tr>';
        }
    } catch(err) {
        console.error('Failed to load driver salaries', err);
        const tbody = document.getElementById('driver-salary-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Server error.</td></tr>';
        }
    }
}

function populateDriverFilter() {
    const filter = document.getElementById('driver-history-filter');
    if (!filter) return;
    
    // Prevent multiple bindings by adding a custom flag
    if (!filter.dataset.bound) {
        filter.addEventListener('change', renderSalaries);
        filter.dataset.bound = 'true';
    }
    
    const currentVal = filter.value;
    filter.innerHTML = '<option value="all">All Drivers</option>';
    
    const uniqueDrivers = [...new Set(allSalaries.map(s => s.driverName).filter(n => n))];
    uniqueDrivers.forEach(name => {
        filter.innerHTML += `<option value="${name}">${name}</option>`;
    });
    
    if (uniqueDrivers.includes(currentVal)) {
        filter.value = currentVal;
    }
}

function renderSalaries() {
    const tbody = document.getElementById('driver-salary-tbody');
    const filterVal = document.getElementById('driver-history-filter')?.value || 'all';
    
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let filtered = allSalaries;
    if (filterVal !== 'all') {
        filtered = allSalaries.filter(s => s.driverName === filterVal);
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No history found for this selection.</td></tr>';
        return;
    }
    
    filtered.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${s.id}</td>
            <td><strong style="color: #3b82f6;">${s.driverName || 'Unknown'}</strong></td>
            <td>Ride #${s.rideId || '-'}</td>
            <td>${s.distance ? s.distance.toFixed(1) : '-'} km</td>
            <td><strong style="color: #10b981;">Rs. ${s.amount ? s.amount.toFixed(2) : '-'}</strong></td>
            <td>${s.date || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// DRIVER CRUD LOGIC (UI 5)
let allDrivers = [];

async function loadAllDrivers() {
    try {
        const res = await fetch('/api/drivers/all');
        if (res.ok) {
            allDrivers = await res.json();
            renderDriversTable(allDrivers);
        }
    } catch (e) {
        console.error("Failed to load drivers", e);
    }
}

function renderDriversTable(drivers) {
    const tbody = document.getElementById('driver-manage-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (drivers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No drivers found.</td></tr>';
        return;
    }
    
    drivers.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${d.id}</td>
            <td><strong>${d.name || '-'}</strong></td>
            <td>${d.licenseNumber || '-'}</td>
            <td>${d.phoneNumber || '-'}</td>
            <td>${d.vehicleNumber || '-'}</td>
            <td><span class="status-badge" style="background:#f3f4f6; color:#4b5563;">${d.vehicleType || '-'}</span></td>
            <td><span class="${d.status === 'Available' ? 'status-available' : (d.status === 'Busy' ? 'status-rented' : 'status-text')}">${d.status || 'Available'}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="openDriverEditModal(${d.id}, '${(d.name || '').replace(/'/g, "\\'")}', '${(d.email || '').replace(/'/g, "\\'")}', '${(d.licenseNumber || '').replace(/'/g, "\\'")}', '${(d.phoneNumber || '').replace(/'/g, "\\'")}', '${(d.vehicleNumber || '').replace(/'/g, "\\'")}', '${(d.vehicleType || '').replace(/'/g, "\\'")}', '${d.status || 'Available'}')"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteDriver(${d.id})" style="margin-left: 5px;"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function setupDriverSearch() {
    const searchInput = document.getElementById('driver-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allDrivers.filter(d => (d.name && d.name.toLowerCase().includes(term)));
            renderDriversTable(filtered);
        });
    }
}

function openDriverEditModal(id, name, email, license, phone, vehicle, vType, status) {
    document.getElementById('edit-dr-id').value = id;
    document.getElementById('edit-dr-name').value = name;
    document.getElementById('edit-dr-email').value = email;
    document.getElementById('edit-dr-pass').value = '';
    document.getElementById('edit-dr-lic').value = license;
    document.getElementById('edit-dr-phone').value = phone;
    document.getElementById('edit-dr-vehicle').value = vehicle;
    document.getElementById('edit-dr-type').value = vType || 'Bike';
    document.getElementById('edit-dr-status').value = status;
    document.getElementById('driver-edit-modal').style.display = 'flex';
}

function setupDriverEditForm() {
    const form = document.getElementById('driver-edit-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-dr-id').value;
            const updatedDriver = {
                name: document.getElementById('edit-dr-name').value,
                email: document.getElementById('edit-dr-email').value,
                password: document.getElementById('edit-dr-pass').value,
                licenseNumber: document.getElementById('edit-dr-lic').value,
                phoneNumber: document.getElementById('edit-dr-phone').value,
                vehicleNumber: document.getElementById('edit-dr-vehicle').value,
                vehicleType: document.getElementById('edit-dr-type').value,
                status: document.getElementById('edit-dr-status').value
            };
            
            try {
                const res = await fetch(`/api/drivers/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedDriver)
                });
                
                if (res.ok) {
                    alert('Driver updated successfully!');
                    document.getElementById('driver-edit-modal').style.display = 'none';
                    loadAllDrivers();
                } else {
                    alert('Failed to update driver.');
                }
            } catch (err) {
                alert('Server error.');
            }
        });
    }
}

async function deleteDriver(id) {
    if (confirm('Are you sure you want to delete this driver?')) {
        try {
            const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Driver deleted successfully!');
                loadAllDrivers();
            } else {
                alert('Failed to delete driver.');
            }
        } catch (err) {
            alert('Server error.');
        }
    }
}
