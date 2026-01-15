document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Page elements
    const loading = document.getElementById('loading');
    const productDetails = document.getElementById('productDetails');
    const errorView = document.getElementById('error');

    // Order Modal Elements
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const orderModal = document.getElementById('orderModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const orderForm = document.getElementById('orderForm');
    const customerPhoneInput = document.getElementById('customerPhone');
    const orderStatus = document.getElementById('orderStatus');

    let sellerId = null; // To be populated on product load

    if (!productId) {
        showError();
        return;
    }

    const fetchProductDetails = async () => {
        try {
            const res = await fetch(`${API_URL}/products/${productId}`);
            const data = await res.json();

            if (data.success) {
                renderDetails(data.data);
            } else {
                showError();
            }
        } catch (err) {
            console.error('Error fetching product details:', err);
            showError();
        } finally {
            loading.classList.add('hidden');
        }
    };

    const renderDetails = (product) => {
        document.title = `${product.name} | StoreSync`;

        document.getElementById('productImage').src = product.imageUrl;
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productCategory').textContent = product.category || 'Local Choice';
        document.getElementById('productDescription').textContent = product.description;

        const formattedPrice = new Intl.NumberFormat('en-MW', {
            style: 'currency',
            currency: 'MWK'
        }).format(product.price);
        document.getElementById('productPrice').textContent = formattedPrice;

        const business = product.businessId;
        if (business) {
            sellerId = business._id; // get seller ID
            document.getElementById('ownerName').textContent = business.ownerName;
            document.getElementById('businessName').textContent = business.businessName;
            document.getElementById('businessLocation').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${business.location}`;
            document.getElementById('businessContact').innerHTML = `<i class="fas fa-phone"></i> ${business.contactInfo}`;
            document.getElementById('businessBio').textContent = business.bio || 'This business is part of the LocalMarket community.';

            const orderStatusMessage = document.getElementById('orderStatusMessage');

            // Show the place order button if the business can take orders
            if (business.canPlaceOrders) {
                placeOrderBtn.classList.remove('hidden');
                orderStatusMessage.innerHTML = ''; // Clear any previous message
            } else {
                placeOrderBtn.classList.add('hidden');
                placeOrderBtn.disabled = true;
                // Inform kastoma the seller is inactive
                orderStatusMessage.innerHTML = `Ogulitsa sali palayini, Ayimbileni pa : <a href="tel:${business.contactInfo}">${business.contactInfo}</a>`;
                orderStatusMessage.style.color = 'var(--text-muted)';
            }
        }

        productDetails.classList.remove('hidden');
    };

    function showError() {
        loading.classList.add('hidden');
        errorView.classList.remove('hidden');
    }

    // Order Modal Logic
    placeOrderBtn.addEventListener('click', () => {
        orderModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        orderModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.classList.add('hidden');
        }
    });

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customerPhone = customerPhoneInput.value;

        if (!customerPhone || !productId || !sellerId) {
            showOrderStatus('Chinachake chalakwika. yesaniso nthawi ina.', 'error');
            return;
        }

        const orderData = {
            customerPhone,
            productId,
            sellerId,
        };

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });
            const data = await res.json();

            if (data.success) {
                showOrderStatus('Zatheka!, mwatumiza order yanu.', 'success');
                orderForm.reset();
                setTimeout(() => {
                    orderModal.classList.add('hidden');
                    orderStatus.style.display = 'none';
                }, 3000);
            } else {
                showOrderStatus(data.error || 'Pepani!, order yanu sinatumizidwe.Muyese nthawi ina.', 'error');
            }
        } catch (err) {
            console.error('Order submission error:', err);
            showOrderStatus('Chinachake chalakwika. Onani ngati ili netiweki yanu.', 'error');
        }
    });

    function showOrderStatus(message, type) {
        orderStatus.textContent = message;
        orderStatus.className = type; // 'success' or 'error'
        orderStatus.style.display = 'block';
    }

    // Hide the button initially until we confirm the seller is active
    placeOrderBtn.classList.add('hidden');

    fetchProductDetails();
});
