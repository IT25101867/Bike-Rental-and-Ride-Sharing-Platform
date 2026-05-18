document.addEventListener('DOMContentLoaded', () => {
    checkDriverAuth();
    setupSidebar();
    
    // Logout
    document.getElementById('driver-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('driverEmail');
        window.location.href = 'index.html';
    });
});

let currentDriverName = "";

async function checkDriverAuth() {
    const email = localStorage.getItem('driverEmail');
    if (!email) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`/api/drivers/profile/${email}`);
        if (res.ok) {
            const driver = await res.json();
            currentDriverName = driver.name;
            
            document.getElementById('dash-driver-name').innerText = driver.name;
            document.getElementById('topbar-driver-name').innerText = driver.name;
            document.getElementById('driver-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=10b981&color=fff`;
            
            loadDriverRides();
        } else {
            localStorage.removeItem('driverEmail');
            window.location.href = 'login.html';
        }
    } catch(err) {
        console.error("Auth check failed", err);
    }
}

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

async function loadDriverRides() {
    if (!currentDriverName) return;

    try {
        const res = await fetch(`/api/bookings/driver-rides/${encodeURIComponent(currentDriverName)}`);
        if (res.ok) {
            const rides = await res.json();
            
            const assignedTbody = document.getElementById('assigned-rides-tbody');
            const activeTbody = document.getElementById('active-rides-tbody');
            const historyTbody = document.getElementById('history-rides-tbody');
            
            assignedTbody.innerHTML = '';
            activeTbody.innerHTML = '';
            historyTbody.innerHTML = '';
            
            let assignedCount = 0;
            let activeCount = 0;
            let historyCount = 0;

            rides.forEach(r => {
                if (r.status === 'Assigned') {
                    assignedCount++;
                    assignedTbody.innerHTML += `<tr>
                        <td>#${r.id}</td>
                        <td>${r.userEmail}</td>
                        <td>${r.startLocation} to ${r.endLocation}</td>
                        <td>${r.rideDate} ${r.rideTime || ''}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="startRide(${r.id})">Accept & Start</button>
                            <button class="btn btn-danger btn-sm" onclick="declineRide(${r.id})" style="margin-left: 5px;">Decline</button>
                        </td>
                    </tr>`;
                } else if (r.status === 'Accepted' || r.status === 'InProgress') {
                    activeCount++;
                    activeTbody.innerHTML += `<tr>
                        <td>#${r.id}</td>
                        <td>${r.userEmail}</td>
                        <td>${r.startLocation} to ${r.endLocation}</td>
                        <td><button class="btn btn-sm btn-warning" onclick="endTrip(${r.id})">End Trip</button></td>
                    </tr>`;
                } else if (r.status === 'Completed') {
                    historyCount++;
                    const earnings = r.amount ? `Rs. ${r.amount.toFixed(2)}` : 'Rs. 0.00';
                    historyTbody.innerHTML += `<tr>
                        <td>#${r.id}</td>
                        <td>${r.userEmail}</td>
                        <td>${r.startLocation} to ${r.endLocation}</td>
                        <td>${r.rideDate} ${r.rideTime || ''}</td>
                        <td><strong style="color: #10b981;">${earnings}</strong></td>
                        <td><span class="status-badge" style="background:#dcfce7; color:#166534; padding:4px 8px; border-radius:4px; font-size: 0.85rem;">Completed</span></td>
                    </tr>`;
                }
            });

            if (assignedCount === 0) assignedTbody.innerHTML = '<tr><td colspan="5" class="text-center">No new assignments.</td></tr>';
            if (activeCount === 0) activeTbody.innerHTML = '<tr><td colspan="4" class="text-center">No active trips.</td></tr>';
            if (historyCount === 0) historyTbody.innerHTML = '<tr><td colspan="6" class="text-center">No trip history found.</td></tr>';
        }
    } catch (e) {
        console.error('Failed to load driver rides', e);
    }
}

window.startRide = async function(id) {
    if(!confirm("Are you ready to accept and start this trip?")) return;
    try {
        const res = await fetch(`/api/bookings/start-ride/${id}`, { method: 'POST' });
        if (res.ok) {
            Swal.fire('Trip Started', 'Drive safely!', 'success');
            loadDriverRides();
        } else {
            Swal.fire('Error', 'Could not start trip.', 'error');
        }
    } catch(e) {
        alert('Server error.');
    }
}

window.declineRide = async function(id) {
    if(!confirm("Are you sure you want to decline this ride?")) return;
    try {
        const res = await fetch(`/api/bookings/decline-ride/${id}`, { method: 'POST' });
        if (res.ok) {
            Swal.fire('Declined', 'You have declined this ride.', 'info');
            loadDriverRides();
        } else {
            Swal.fire('Error', 'Could not decline ride.', 'error');
        }
    } catch(e) {
        alert('Server error.');
    }
}

window.endTrip = async function(id) {
    if(!confirm("Are you sure you have dropped off the customer and want to end this trip?")) return;
    try {
        const res = await fetch(`/api/bookings/complete-ride/${id}`, { method: 'POST' });
        if (res.ok) {
            Swal.fire('Trip Completed', 'Good job! The trip has been marked as completed and your payment has been updated.', 'success');
            loadDriverRides();
        } else {
            Swal.fire('Error', 'Could not end trip.', 'error');
        }
    } catch(e) {
        alert('Server error.');
    }
}
