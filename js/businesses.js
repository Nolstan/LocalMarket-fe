document.addEventListener('DOMContentLoaded', () => {
    const businessGrid = document.getElementById('businessGrid');
    const loading = document.getElementById('loading');
    const noBusinesses = document.getElementById('noBusinesses');


    const fetchBusinesses = async () => {
        try {
            const res = await fetch(`${API_URL}/businesses`);
            const data = await res.json();

            if (data.success) {
                renderBusinesses(data.data);
            } else {
                showNoBusinesses();
            }
        } catch (err) {
            console.error('Error fetching businesses:', err);
            showNoBusinesses();
        } finally {
            loading.classList.add('hidden');
        }
    };

    const renderBusinesses = (businesses) => {
        businessGrid.innerHTML = '';

        if (businesses.length === 0) {
            noBusinesses.classList.remove('hidden');
            return;
        }

        noBusinesses.classList.add('hidden');

        businesses.forEach(business => {
            const card = document.createElement('div');
            card.className = 'business-card';

            card.innerHTML = `
                <div class="business-card-header">
                    <img src="${business.logo || 'https://via.placeholder.com/150'}" alt="${business.businessName} logo" class="business-logo">
                    <div class="business-card-title">
                        <h3>${business.businessName}</h3>
                        <p>${business.ownerName}</p>
                    </div>
                    <div class="status-indicator">
                        <span class="status-badge ${business.isActive ? 'active' : 'inactive'}">
                            ${business.isActive ? 'Accepting Orders' : 'Offline'}
                        </span>
                    </div>
                </div>
                <div class="business-card-body">
                    <p class="business-location"><i class="fas fa-map-marker-alt"></i> ${business.location}</p>
                    <p class="business-contact"><i class="fas fa-phone"></i> ${business.contactInfo}</p>
                    <p class="business-bio">${business.bio || 'A proud local business.'}</p>
                </div>
            `;
            businessGrid.appendChild(card);
        });
    };

    const showNoBusinesses = () => {
        businessGrid.innerHTML = '';
        noBusinesses.classList.remove('hidden');
    };

    fetchBusinesses();
});
