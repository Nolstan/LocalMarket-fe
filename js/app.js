const productGrid = document.getElementById('productGrid');


//  Animate counter values

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.innerHTML = current.toLocaleString() + '+';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}


//   Fetch and animate hero stats

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const result = await response.json();
        if (result.success) {
            animateValue("productCounter", 0, result.data.products, 2000);
            animateValue("shopCounter", 0, result.data.shops, 2000);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        // Remove misleading fake stats, more like overiding after leads dynamic data
        document.getElementById('productCounter').innerText = '0+';
        document.getElementById('shopCounter').innerText = '0+';
    }
}

let allProducts = [];


//  Fetch  products from the backend

async function loadProducts(search = '', location = '') {
    try {
        loadStats();
        let url = `${API_URL}/products?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (location) url += `location=${encodeURIComponent(location)}&`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        allProducts = data.data;
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        productGrid.innerHTML = `
            <div class="loader">
                Unable to load products. <br>
                <small>either database is disconnected or the server is down.</small>
            </div>`;
    }
}

// Add event listeners for search and location
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const locationFilter = document.getElementById('locationFilter');
    const searchBtn = document.getElementById('searchBtn');

    const triggerSearch = () => {
        const searchTerm = searchInput ? searchInput.value : '';
        const locationTerm = locationFilter ? locationFilter.value : '';
        loadProducts(searchTerm, locationTerm);
    };

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            triggerSearch();
        });
    }

    if (locationFilter) {
        locationFilter.addEventListener('change', triggerSearch);
    }

    // Optional: Real-time search with debounce or on Enter key
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                triggerSearch();
            }
        });
    }
}


//  Render product cards into the grid ,............

function renderProducts(products) {
    if (!products || products.length === 0) {
        productGrid.innerHTML = '<div class="loader">No products found. Start exploring!</div>';
        return;
    }

    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.imageUrl || 'https://via.placeholder.com/400x300?text=Product'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h4 class="product-title">${product.name}</h4>
                <span class="product-shop">By ${product.businessId?.ownerName || 'Local Seller'}</span>
                <div class="product-footer">
                    <span class="product-price">MWK ${product.price.toLocaleString()}</span>
                    <button class="btn-buy" onclick="window.location.href='product-details.html?id=${product._id}'">Onani Zonse</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupFilters();
});
