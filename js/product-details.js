document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (productId) {
        try {
            const response = await fetch(`/products/${productId}`);
            const product = await response.json();

            const productDetailsContainer = document.getElementById("product-details");
            productDetailsContainer.innerHTML = `
                <h2>${product.name}</h2>
                <img src="${product.image}" alt="${product.name}">
                <p>${product.description}</p>
                <p>מחיר: ₪${product.price}</p>
                <p>כמות נמכרה: ${product.amount_sold}</p>
            `;
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    } else {
        document.getElementById("product-details").innerHTML = "<p>Product not found.</p>";
    }
});


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