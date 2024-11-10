async function fetchTopSellingProducts() {
    try {
        const response = await fetch('/products/list');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        const topProducts = products
            .sort((a, b) => b.amount_sold - a.amount_sold)
            .slice(0, 3);
        
        displayTopProducts(topProducts);
    } catch (error) {
        console.error('Error fetching top-selling products:', error);
    }
}

function displayTopProducts(products) {
    const featuredSection = document.querySelector("#featured-products .products-grid");
    featuredSection.innerHTML = "";
    
    products.forEach(product => {
        const productHTML = `
            <div class="product">
                <img src="/images/${product.image}" alt="${product.name}" />
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>₪${product.price}</p>
                <button onclick="addToCart('${product.uuid}')" class="btn">קנה עכשיו</button>
            </div>
        `;
        featuredSection.innerHTML += productHTML;
    });
}

async function addToCart(productUuid) {
    const userId = localStorage.getItem('user_id'); 

    if (!userId) {
        showLoginPrompt();
        return;
    }

    try {
        const cartId = await getOrCreateCart();
        if (!cartId) {
            alert('Error creating or fetching cart');
            return;
        }
        
        const response = await fetch('/cart-manager/add_to_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productUuid, cart_id: cartId, user_id: userId })
        });
        if (!response.ok) {
            throw new Error('Failed to add product to cart');
        }
        alert('המוצר נוסף לעגלה!');
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

async function getOrCreateCart() {
    let cartId = localStorage.getItem('cart_id');
    const userId = localStorage.getItem('user_id');

    if (!cartId) {
        try {
            const response = await fetch(`/cart-manager/get_cart?user_id=${userId || 'guest'}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to get or create cart');
            }
            const data = await response.json();
            cartId = data.cart.uuid;
            localStorage.setItem('cart_id', cartId);
        } catch (error) {
            console.error('Error getting or creating cart:', error);
            return null;
        }
    }
    return cartId;
}

function showLoginPrompt() {
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.classList.add('overlay');

    const modal = document.createElement('div');
    modal.id = 'login-prompt';
    modal.classList.add('modal');

    const message = document.createElement('p');
    message.textContent = 'על מנת להוסיף מוצרים לעגלה יש להתחבר';
    modal.appendChild(message);

    const loginButton = document.createElement('button');
    loginButton.textContent = 'התחבר';
    loginButton.classList.add('modal-button');
    loginButton.onclick = () => {
        window.location.href = '/login-and-signup.html';
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'סגור';
    closeButton.classList.add('modal-button');
    closeButton.onclick = () => {
        document.body.removeChild(overlay);
    };

    modal.appendChild(loginButton);
    modal.appendChild(closeButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

document.addEventListener("DOMContentLoaded", fetchTopSellingProducts);
