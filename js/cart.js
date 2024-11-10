async function fetchCart() {
    const userId = localStorage.getItem('user_id'); // ווידוא שמשתמש מוגדר, ללא guest כברירת מחדל
    if (!userId) {
        console.log('No user logged in.');
        return; // אין משתמש, אין עגלה
    }

    try {
        const response = await fetch(`/cart-manager/get_cart?user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }
        const { cart } = await response.json();
        if (!cart) {
            console.log('No cart found for the user');
            return; // אין עגלה, לא מציג כלום
        }
        // שמירת cart_id בעגלה
        localStorage.setItem('cart_id', cart.uuid);
        displayCartItems(cart.products);
    } catch (error) {
        console.error('Error fetching cart:', error);
    }
}

// פונקציה שתביא את פרטי המוצר לפי ה-UUID שלו ממסד הנתונים
async function getProductById(product_uuid) {
    try {
        const response = await fetch(`/products/search?attribute=uuid&value=${product_uuid}`);
        if (!response.ok) {
            throw new Error('Failed to fetch product');
        }
        const productData = await response.json();
        return productData[0];  // מחזירים את המוצר הראשון שתואם את ה-UUID
    } catch (error) {
        console.error('Error fetching product data:', error);
        return null;
    }
}

// פונקציה להסרת מוצר מהעגלה
async function removeFromCart(product_uuid) {
    try {
        const cartId = localStorage.getItem('cart_id');
        const response = await fetch('/cart-manager/remove_from_cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart_id: cartId, product_id: product_uuid })
        });

        if (!response.ok) {
            throw new Error('Failed to remove product from cart');
        }

        // רענון העגלה לאחר ההסרה
        fetchCart();
    } catch (error) {
        console.error('Error removing product from cart:', error);
    }
}

// עדכון כמות מוצר בעגלה
async function updateProductQuantity(product_uuid, newQuantity) {
    try {
        const cartId = localStorage.getItem('cart_id');
        const response = await fetch('/cart-manager/update_product_quantity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart_id: cartId, product_id: product_uuid, quantity: newQuantity })
        });

        if (!response.ok) {
            throw new Error('Failed to update product quantity');
        }

        // רענון העגלה לאחר עדכון הכמות
        fetchCart();
    } catch (error) {
        console.error('Error updating product quantity:', error);
    }
}

async function displayCartItems(products) {
    const cartItems = document.getElementById('cart-items');
    let totalPrice = 0;
    const checkoutButton = document.getElementById('checkout-btn');

    cartItems.innerHTML = ''; // ניקוי עגלת הקניות הקודמת

    if (products.length === 0) {
        checkoutButton.disabled = true; // השבתת כפתור התשלום אם אין מוצרים
        return; // אין מוצרים, אין מה להציג
    }

    checkoutButton.disabled = false; // הפעלת כפתור התשלום אם יש מוצרים

    for (const productEntry of products) {
        const product = await getProductById(productEntry.product_uuid); // מציאת המוצר לפי UUID
        if (product) {
            const quantity = productEntry.quantity;

            const row = `
                <tr>
                    <td>
                        <div class="product-info">
                            <img src="/images/${product.image}" alt="${product.name}">
                            <p>${product.name}</p>
                        </div>
                    </td>
                    <td>
                        <input type="number" value="${quantity}" min="1" onchange="updateProductQuantity('${productEntry.product_uuid}', this.value)" />
                    </td>
                    <td>₪${product.price}</td>
                    <td>₪${(product.price * quantity).toFixed(2)}</td>
                    <td><button class="remove-btn" onclick="removeFromCart('${productEntry.product_uuid}')">X</button></td>
                </tr>
            `;
            cartItems.innerHTML += row;
            totalPrice += product.price * quantity;
        }
    }

    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
    fetchCart();

    // הוספת אירוע לכפתור התשלום
    const checkoutButton = document.getElementById('checkout-btn');
    checkoutButton.addEventListener('click', () => {
        window.location.href = '/checkout.html'; // העברה לדף התשלום
    });
});
