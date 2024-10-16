// פונקציה להבאת החנויות מהשרת
async function fetchStores() {
    try {
        const response = await fetch('/stores/list'); // ודא שהנתיב הוא /stores/list
        if (!response.ok) {
            throw new Error('Failed to fetch stores');
        }
        const stores = await response.json(); // מוודאים שתגובה היא בפורמט JSON
        populateStoreDropdown(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
    }
}

// פונקציה למילוי dropdown עם חנויות
function populateStoreDropdown(stores) {
    const storeSelect = document.getElementById('store-select');
    storeSelect.innerHTML = ''; // מנקה את הבחירות הקיימות
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'בחר חנות';
    storeSelect.appendChild(defaultOption);

    stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store.uuid;
        option.textContent = store.address; // מציגים את הכתובת של החנות
        storeSelect.appendChild(option);
    });
}

// פונקציה להצגת הכתובת מה-localStorage בתיבת טקסט ניתנת לעריכה
function displayUserAddress() {
    const user = JSON.parse(localStorage.getItem('user'));
    const shippingAddressInput = document.getElementById('shipping-address-input');
    
    if (user && user.address) {
        shippingAddressInput.value = user.address; // מציב את הכתובת של המשתמש
    } else {
        shippingAddressInput.value = ''; // אם אין כתובת, שדה ריק
    }
}

// עיצוב התאריך של כרטיס האשראי - הוספת "/"
document.getElementById('card-expiry').addEventListener('input', function (e) {
    let input = e.target.value.replace(/\D/g, ''); // מסיר כל מה שלא ספרות
    if (input.length >= 2) {
        input = input.slice(0, 2) + '/' + input.slice(2, 4); // מוסיף "/"
    }
    e.target.value = input;
});

// וידוא פרטי תשלום
function validatePaymentDetails() {
    const cardNumber = document.getElementById('card-number').value.replace(/\D/g, '');
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCVV = document.getElementById('card-cvv').value;

    if (cardNumber.length !== 16) {
        alert('מספר כרטיס אשראי לא תקין');
        return false;
    }

    const [month, year] = cardExpiry.split('/');
    if (!month || !year || month > 12 || year < new Date().getFullYear() % 100) {
        alert('תאריך תוקף לא תקין');
        return false;
    }

    if (cardCVV.length !== 3) {
        alert('CVV לא תקין');
        return false;
    }

    return true;
}

// פונקציה לטיפול בתשלום
async function handlePayment(event) {
    event.preventDefault();

    if (!validatePaymentDetails()) {
        return; // אם יש שגיאה בפרטי התשלום, עצור את התהליך
    }

    const storeId = document.getElementById('store-select').value;
    const cardNumber = document.getElementById('card-number').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCVV = document.getElementById('card-cvv').value;
    const cardHolder = document.getElementById('card-holder').value;
    const shippingAddress = document.getElementById('shipping-address-input').value; // כתובת שהמשתמש ערך

    if (!storeId) {
        alert('יש לבחור חנות.');
        return;
    }

    const cartId = localStorage.getItem('cart_id');

    try {
        const response = await fetch('/payment/user_pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cart_id: cartId,
                shipping_address: shippingAddress, // כתובת שנערכה נשלחת
                store_id: storeId,
                payment_details: {
                    card_number: cardNumber,
                    card_expiry: cardExpiry,
                    card_cvv: cardCVV,
                    card_holder: cardHolder
                }
            })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('last_order_id', data.order_id); // שמירת מזהה ההזמנה ב-localStorage
            alert('התשלום הצליח! מספר הזמנה: ' + data.order_id);
            localStorage.removeItem('cart_id'); // ריקון העגלה לאחר תשלום
            window.location.href = '/confirmation.html'; // הפניה לדף אישור
        } else {
            alert('שגיאה בתשלום: ' + data.error);
        }
    } catch (error) {
        console.error('Error processing payment:', error);
    }
}

// הוספת אירועים כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
    fetchStores(); // הבאת חנויות
    displayUserAddress(); // הצגת כתובת ניתנת לעריכה
    document.getElementById('payment-form').addEventListener('submit', handlePayment);
});
