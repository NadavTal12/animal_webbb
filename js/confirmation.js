// פונקציה להצגת פרטי ההזמנה בדף האישור
async function displayOrderConfirmation() {
    const user = JSON.parse(localStorage.getItem('user')); // קבלת פרטי המשתמש מה-localStorage
    const orderId = localStorage.getItem('last_order_id'); // קבלת מספר ההזמנה מה-localStorage

    if (!user || !orderId) {
        alert("שגיאה בטעינת פרטי ההזמנה.");
        return;
    }

    try {
        // בקשה לשרת לקבלת פרטי ההזמנה
        const response = await fetch(`/orders/search?attribute=uuid&value=${orderId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }
        const { order, user: userDetails, store, products } = await response.json(); // קבלת פרטי ההזמנה

        console.log('Order Details:', order); // בדיקה שההזמנה מתקבלת כראוי

        if (!order) {
            alert("שגיאה בטעינת ההזמנה.");
            return;
        }

        // הצגת פרטי המשתמש, מספר ההזמנה, תאריך ההזמנה, כתובת החנות וכתובת המשלוח
        document.getElementById('greeting').textContent = `שלום ${userDetails.name}, הזמנתך מספר ${order.uuid} בוצעה בהצלחה`;
        document.getElementById('order-date').textContent = `תאריך ההזמנה: ${new Date(order.date).toLocaleString()}`;
        document.getElementById('store-address').textContent = `כתובת החנות הנבחרת: ${store.address}`;
        document.getElementById('shipping-address').textContent = `כתובת למשלוח: ${order.address}`;
        document.getElementById('order-total').textContent = `סכום ההזמנה: ₪${order.price.toFixed(2)}`;
        document.getElementById('confirmation-email').textContent = `אישור ההזמנה נשלח למייל: ${userDetails.email}`;

        // יצירת טבלת המוצרים שהוזמנו
        const orderProductsTable = document.getElementById('order-products');
        if (products && products.length > 0) {
            products.forEach((product) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>₪${product.price.toFixed(2)}</td>
                    <td>₪${(product.price * product.quantity).toFixed(2)}</td>
                `;
                orderProductsTable.appendChild(row);
            });
        } else {
            // במקרה שאין מוצרים בהזמנה
            const noProductsRow = document.createElement('tr');
            noProductsRow.innerHTML = `<td colspan="4">אין מוצרים בהזמנה.</td>`;
            orderProductsTable.appendChild(noProductsRow);
        }
    } catch (error) {
        console.error('Error fetching order details:', error);
    }
}

// קריאה לפונקציה כאשר הדף נטען והוספת מאזין לאירוע לחזרה לדף הראשי
document.addEventListener('DOMContentLoaded', function() {
    displayOrderConfirmation(); // קריאה אחת בלבד

    // הוספת מאזין אירועים לכפתור חזרה לדף הראשי
    document.getElementById('back-to-home-btn').addEventListener('click', function() {
        window.location.href = '/index.html'; // הפניה לדף הראשי
    });
    document.getElementById('back-to-cust-btn').addEventListener('click', function() {
        window.location.href = '/customer.html'; // הפניה לדף אזור אישי
    });
});
