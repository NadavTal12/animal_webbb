async function fetchProducts() {
    try {
        const response = await fetch('/products/list'); // שליחת בקשת GET לשרת
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await response.json(); // קבלת המוצרים כ-JSON
        displayProducts(products); // הצגת המוצרים ב-UI
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function displayProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = ""; // ניקוי רשימת המוצרים הקודמת
    products.forEach(product => {
        const productCard = `
            <div class="product-card">
                <img src="/images/${product.image}" alt="${product.name}" />
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p id="product-list-price">₪${product.price}</p>
                <button onclick="addToCart('${product.uuid}')">הוסף לעגלה</button>
            </div>
        `;
        productList.innerHTML += productCard;
    });
}

// פונקציה להבאת עגלה קיימת או יצירת עגלה חדשה למשתמש
async function getOrCreateCart() {
    let cartId = localStorage.getItem('cart_id');
    let userId = localStorage.getItem('user_id'); // נוודא שיש לנו את user_id מה-localStorage

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
            localStorage.setItem('cart_id', cartId); // שמירת מזהה העגלה ב-localStorage
        } catch (error) {
            console.error('Error getting or creating cart:', error);
            return null; // החזרה של null אם יש בעיה ביצירת העגלה
        }
    }
    return cartId;
}

// פונקציה להצגת הודעה למשתמש לא מחובר
function showLoginPrompt() {
    // יצירת שכבת רקע שקופה שמכסה את כל המסך
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // רקע שחור שקוף
    overlay.style.zIndex = '999'; // מעל כל האלמנטים
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    // יצירת תיבת הודעה במרכז המסך
    const modal = document.createElement('div');
    modal.id = 'login-prompt';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.borderRadius = '10px';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modal.style.textAlign = 'center';
    modal.style.maxWidth = '400px';
    modal.style.width = '100%';
    modal.style.zIndex = '1000'; // מעל ה-overlay

    // הוספת טקסט וכפתורים למודל
    const message = document.createElement('p');
    message.textContent = 'על מנת להוסיף מוצרים לעגלה יש להתחבר';
    modal.appendChild(message);

    const loginButton = document.createElement('button');
    loginButton.textContent = 'התחבר';
    loginButton.style.marginRight = '10px';
    loginButton.onclick = () => {
        window.location.href = '/login-and signup.html'; // הפניה לעמוד ההתחברות
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'סגור';
    closeButton.onclick = () => {
        document.body.removeChild(overlay); // הסרת המודל וה-overlay
    };

    modal.appendChild(loginButton);
    modal.appendChild(closeButton);

    // הוספת המודל ל-overlay
    overlay.appendChild(modal);

    // הוספת ה-overlay לגוף העמוד
    document.body.appendChild(overlay);
}

async function addToCart(productUuid) {
    const userId = localStorage.getItem('user_id'); // בדיקת האם המשתמש מחובר

    if (!userId) {
        // אם אין משתמש מחובר, מציגים הודעה
        showLoginPrompt();
        return;
    }

    try {
        const cartId = await getOrCreateCart(); // מקבל את מזהה העגלה
        if (!cartId) {
            alert('Error creating or fetching cart');
            return; // יציאה אם אין cartId
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
        const data = await response.json();
        alert(`המוצר נוסף לעגלה!`);
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

document.addEventListener("DOMContentLoaded", fetchProducts);
