// פונקציה להצגת פרטי המשתמש מה-DB
async function fetchUserDetails() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        alert('משתמש לא מחובר');
        return;
    }

    try {
        const response = await fetch(`/users/search?attribute=uuid&value=${user.uuid}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const [userData] = await response.json();
        document.getElementById('profileName').textContent = userData.name;
        document.getElementById('profileEmail').textContent = userData.email;
        document.getElementById('profileAddress').textContent = userData.address;

        setupEditButtons(userData); // הפעלת פונקציית העריכה
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
}

// פונקציה לאפשר למשתמש לערוך את פרטיו
function setupEditButtons(user) {
    const nameField = document.getElementById('profileName');
    const emailField = document.getElementById('profileEmail');
    const addressField = document.getElementById('profileAddress');

    setupEditButton('edit-name-btn', nameField, user.name);
    setupEditButton('edit-email-btn', emailField, user.email);
    setupEditButton('edit-address-btn', addressField, user.address);
}

// פונקציה להכנסת הלוגיקה של כפתורי "עריכה", "אישור עריכה" ו"ביטול עריכה"
function setupEditButton(buttonId, fieldElement, originalValue) {
    const editButton = document.getElementById(buttonId);

    editButton.addEventListener('click', () => {
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = originalValue;

        // החלפת הכפתור לשני כפתורים חדשים
        const saveButton = document.createElement('button');
        saveButton.textContent = 'אישור עריכה';
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'ביטול עריכה';

        fieldElement.textContent = ''; // מחיקת התוכן הנוכחי
        fieldElement.appendChild(inputField); // הצגת שדה קלט לעריכה

        editButton.style.display = 'none'; // הסתרת כפתור עריכה
        fieldElement.parentNode.appendChild(saveButton); // הוספת כפתור אישור עריכה
        fieldElement.parentNode.appendChild(cancelButton); // הוספת כפתור ביטול עריכה

        // פונקציה ללחיצה על כפתור אישור
        saveButton.addEventListener('click', async () => {
            const newValue = inputField.value;

            // עדכון ה-HTML עם הערך החדש
            fieldElement.textContent = newValue;

            // קריאה לפונקציית עדכון המשתמש בשרת
            await updateUserDetails(fieldElement, newValue);

            // החזרת המצב לכפתור עריכה
            resetToEditButton(editButton, saveButton, cancelButton);
        });

        // פונקציה ללחיצה על כפתור ביטול
        cancelButton.addEventListener('click', () => {
            // החזרת הערך המקורי לשדה
            fieldElement.textContent = originalValue;

            // החזרת המצב לכפתור עריכה
            resetToEditButton(editButton, saveButton, cancelButton);
        });
    });
}

// פונקציה להחזרת המצב לכפתור עריכה לאחר לחיצה על אישור או ביטול
function resetToEditButton(editButton, saveButton, cancelButton) {
    saveButton.remove();
    cancelButton.remove();
    editButton.style.display = 'inline';
}

// פונקציה לעדכון פרטי המשתמש בשרת
async function updateUserDetails(fieldElement, newValue) {
    const user = JSON.parse(localStorage.getItem('user'));
    const updatedUser = {
        ...user,
        [fieldElement.id.replace('profile', '').toLowerCase()]: newValue
    };

    try {
        const response = await fetch(`/users/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        });

        if (response.ok) {
            alert('הפרטים עודכנו בהצלחה!');
            localStorage.setItem('user', JSON.stringify(updatedUser));
            fetchUserDetails(); // עדכון הפרטים המוצגים
        } else {
            const errorMsg = await response.json();
            console.error('Server error:', errorMsg);
            throw new Error('עדכון פרטי המשתמש נכשל.');
        }
    } catch (error) {
        console.error('Error updating user details:', error);
    }
}

// פונקציה להצגת היסטוריית ההזמנות מה-DB
async function fetchUserOrders() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        alert('משתמש לא מחובר');
        return;
    }

    try {
        // בקשה להיסטוריית ההזמנות מהשרת
        const response = await fetch(`/orders/search?attribute=user&value=${user.uuid}`);
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();
        console.log('Orders:', orders); // בדוק את מבנה ההזמנות
        const ordersTableBody = document.querySelector('.profile-orders tbody'); // עדכון לטבלת ההזמנות של המשתמש
        ordersTableBody.innerHTML = ''; // ניקוי התוכן הקיים

        if (orders.length === 0) {
            const noOrdersRow = document.createElement('tr');
            noOrdersRow.innerHTML = '<td colspan="8">אין הזמנות להצגה.</td>'; // עדכון העמודה למספר העמודות
            ordersTableBody.appendChild(noOrdersRow);
        } else {
            // הצגת כל ההזמנות בטבלה
            orders.forEach(order => {
                // בדוק שה-`order` לא ריק ושהוא מכיל את המידע הנדרש
                if (order.order && order.order.price !== undefined) {
                    const totalUnits = order.products.reduce((total, product) => total + Number(product.quantity), 0);
                    const productDetails = order.products.map(product => `${product.name} (x${product.quantity})`).join(', ');

                    const orderRow = document.createElement('tr');
                    orderRow.innerHTML = `
                        <td>${new Date(order.order.date).toLocaleDateString()}</td>
                        <td>${order.products.length}</td>
                        <td>${totalUnits}</td>
                        <td>${productDetails}</td>
                        <td>${order.order.address || 'לא צוינה כתובת'}</td>
                        <td>${order.order.status || 'סטטוס לא ידוע'}</td>
                        <td>₪${order.order.price.toFixed(2)}</td>
                        <td>
                            <button class="order-confirmation-btn" data-order-id="${order.order.uuid}">
                                לאישור הזמנה
                            </button>
                        </td>
                    `;
                    ordersTableBody.appendChild(orderRow);
                } else {
                    console.error('Invalid order structure:', order);
                }
            });
            // הוספת מאזינים לכפתורים "לאישור הזמנה"
            document.querySelectorAll('.order-confirmation-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const orderId = this.getAttribute('data-order-id');
                    localStorage.setItem('last_order_id', orderId); // שמירת מספר ההזמנה ב-localStorage
                    window.location.href = '/confirmation.html'; // הפניה לדף אישור ההזמנה
                });
            });
        }
    } catch (error) {
        console.error('Error fetching user orders:', error);
    }
}


// קריאה לפונקציות בעת טעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    fetchUserDetails(); // הצגת פרטי המשתמש
    fetchUserOrders(); // הצגת היסטוריית ההזמנות
});
