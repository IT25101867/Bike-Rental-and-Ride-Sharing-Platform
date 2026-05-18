document.addEventListener('DOMContentLoaded', () => {
    // Check Login State
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        const navLogin = document.getElementById('nav-login');
        const navProfile = document.getElementById('nav-profile');
        const navLogout = document.getElementById('nav-logout');
        
        if (navLogin) navLogin.style.display = 'none';
        if (navProfile) navProfile.style.display = 'inline-block';
        if (navLogout) navLogout.style.display = 'inline-block';
    }

    const driverEmail = localStorage.getItem('driverEmail');
    if (driverEmail && !userEmail) {
        const navLogin = document.getElementById('nav-login');
        if (navLogin) navLogin.innerHTML = '<a href="driver-dashboard.html" class="btn-primary">Driver Dashboard</a>';
    }

    loadBikes();
    setupRideBookingForm();
});

async function loadBikes() {
    const bikeList = document.getElementById('bike-list');
    
    try {
        const res = await fetch('/api/bikes/all');
        if (res.ok) {
            const bikes = await res.json();
            bikeList.innerHTML = ''; // Clear loading text

            bikes.forEach(bike => {
                const statusClass = bike.status === 'Available' ? 'status-available' : 'status-rented';
                
                const card = document.createElement('div');
                card.className = 'bike-card';
                card.innerHTML = `
                    <i class="fa-solid fa-motorcycle fa-3x" style="color: var(--primary);"></i>
                    <h3>${bike.brand || ''} ${bike.model || 'Bike'}</h3>
                    <p>ID: ${bike.id}</p>
                    <div class="bike-price">Rs. ${bike.price || 0}/day</div>
                    <span class="bike-status ${statusClass}">${bike.status || 'Available'}</span>
                    <button class="btn btn-sm" style="margin-top: 10px;" onclick="rentBike('${bike.id}', '${bike.model}')" ${bike.status === 'Available' ? '' : 'disabled'}>Rent Now</button>
                `;
                bikeList.appendChild(card);
            });
        } else {
            bikeList.innerHTML = '<p class="text-danger">Failed to load bikes.</p>';
        }
    } catch(e) {
        bikeList.innerHTML = '<p class="text-danger">Server error.</p>';
    }
}

function setupRideBookingForm() {
    const form = document.getElementById('ride-booking-form');
    const statusDiv = document.getElementById('booking-status');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const start = document.getElementById('start-location').value;
        const end = document.getElementById('end-location').value;
        const date = document.getElementById('ride-date').value;
        const time = document.getElementById('ride-time').value;
        const vType = document.getElementById('ride-vehicle-type').value;

        const submitBtn = form.querySelector('button');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Checking Availability...';
        submitBtn.disabled = true;

        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
            alert("Please log in or register to book a ride.");
            window.location.href = 'login.html';
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            return;
        }

        fetch('/api/bookings/book-ride', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userEmail: userEmail,
                startLocation: start,
                endLocation: end,
                rideDate: date,
                rideTime: time,
                vehicleType: vType
            })
        })
        .then(res => {
            if (res.ok) {
                statusDiv.innerHTML = `<span class="success"><i class="fa-solid fa-check-circle"></i> Ride successfully booked for ${start} to ${end}!</span>`;
                form.reset();
            } else {
                statusDiv.innerHTML = `<span class="error"><i class="fa-solid fa-times-circle"></i> Failed to book ride. Please try again.</span>`;
            }
        })
        .catch(err => {
            statusDiv.innerHTML = `<span class="error"><i class="fa-solid fa-times-circle"></i> Error connecting to server.</span>`;
        })
        .finally(() => {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        });
    });
}

async function rentBike(bikeId, bikeModel) {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert("Please log in to rent a bike.");
        window.location.href = 'login.html';
        return;
    }

    const daysInput = prompt(`How many days do you want to rent the ${bikeModel}?`);
    if (!daysInput) return;
    const days = parseInt(daysInput);
    if (isNaN(days) || days <= 0) {
        alert("Invalid number of days.");
        return;
    }

    try {
        const res = await fetch('/api/bookings/rent-bike', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userEmail: userEmail,
                bikeId: bikeId,
                bikeModel: bikeModel,
                days: days
            })
        });

        if (res.ok) {
            alert(`Successfully rented ${bikeModel} for ${days} days!`);
            window.location.reload();
        } else {
            alert("Failed to rent bike.");
        }
    } catch (err) {
        alert("Error connecting to server.");
    }
}

function logout() {
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}
