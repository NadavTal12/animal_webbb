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
        document.getElementById('managerName').textContent = userData.name;
        document.getElementById('managerEmail').textContent = userData.email;
        document.getElementById('managerAddress').textContent = userData.address;

        setupEditButtons(userData); // הפעלת פונקציית העריכה
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
}

// פונקציה לאפשר למשתמש לערוך את פרטיו
function setupEditButtons(user) {
    const nameField = document.getElementById('managerName');
    const emailField = document.getElementById('managerEmail');
    const addressField = document.getElementById('managerAddress');

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
        [fieldElement.id.replace('manager', '').toLowerCase()]: newValue
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
async function fetchUsersOrders() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        alert('משתמש לא מחובר');
        return;
    }

    try {
        // בקשה להיסטוריית ההזמנות מהשרת
        const response = await fetch(`/orders/list`); // עדכן לכתובת הנכונה
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();
        const ordersTableBody = document.querySelector('.manager-orders tbody');
        ordersTableBody.innerHTML = ''; // ניקוי התוכן הקיים

        if (orders.length === 0) {
            const noOrdersRow = document.createElement('tr');
            noOrdersRow.innerHTML = '<td colspan="9">אין הזמנות להצגה.</td>'; // עדכון העמודה למספר העמודות
            ordersTableBody.appendChild(noOrdersRow);
        } else {
            // הצגת חמש הזמנות ראשונות
            const firstFiveOrders = orders.slice(0, 5);
            firstFiveOrders.forEach(order => {
                const totalUnits = order.products.reduce((total, product) => total + Number(product.quantity), 0);
                const productDetails = order.products.map(product => `${product.name} (x${product.quantity})`).join(', ');

                const orderRow = document.createElement('tr');
                orderRow.innerHTML = `
                    <td>${order.userName || 'לא ידוע'}</td> <!-- הוסף את שם המשתמש כאן -->
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>${order.products.length}</td>
                    <td>${totalUnits}</td>
                    <td>${productDetails}</td>
                    <td>${order.address || 'לא צוינה כתובת'}</td>
                    <td>${order.status || 'סטטוס לא ידוע'}</td>
                    <td>₪${order.price.toFixed(2)}</td>
                    <td>
                        <button class="order-confirmation-btn" data-order-id="${order.uuid}">
                            לאישור הזמנה
                        </button>
                    </td>
                `;
                ordersTableBody.appendChild(orderRow);
            });

            // הוספת כפתור להציג את שאר ההזמנות
            if (orders.length > 5) {
                const showMoreButton = document.createElement('button');
                showMoreButton.textContent = 'הצג עוד הזמנות';
                showMoreButton.addEventListener('click', () => {
                    showMoreOrders(orders, ordersTableBody);
                    showMoreButton.style.display = 'none'; // הסתר את הכפתור לאחר הלחיצה
                });
                ordersTableBody.appendChild(showMoreButton);
            }
        }
    } catch (error) {
        console.error('Error fetching user orders:', error);
    }
}

// פונקציה להציג את כל ההזמנות
function showMoreOrders(orders, ordersTableBody) {
    const additionalOrders = orders.slice(5); // קח את שאר ההזמנות

    additionalOrders.forEach(order => {
        const totalUnits = order.products.reduce((total, product) => total + Number(product.quantity), 0);
        const productDetails = order.products.map(product => `${product.name} (x${product.quantity})`).join(', ');

        const orderRow = document.createElement('tr');
        orderRow.innerHTML = `
            <td>${order.userName || 'לא ידוע'}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>${order.products.length}</td>
            <td>${totalUnits}</td>
            <td>${productDetails}</td>
            <td>${order.address || 'לא צוינה כתובת'}</td>
            <td>${order.status || 'סטטוס לא ידוע'}</td>
            <td>₪${order.price.toFixed(2)}</td>
            <td>
                <button class="order-confirmation-btn" data-order-id="${order.uuid}">
                    לאישור הזמנה
                </button>
            </td>
        `;
        ordersTableBody.appendChild(orderRow);
    });
}

// פונקציה להצגת כל המשתמשים מה-DB
async function fetchAllUsers() {
    try {
        const response = await fetch(`/users/list`); // בקשה לשרת
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        const usersTableBody = document.getElementById('usersTableBody');
        usersTableBody.innerHTML = ''; // ניקוי התוכן הקיים

        // הצגת פרטי המשתמשים בטבלה
        users.forEach(user => {
            const userRow = document.createElement('tr');
            userRow.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.address}</td>
                <td>${user.is_admin ? 'כן' : 'לא'}</td>
                <td>
                    <button class="make-admin-btn" data-user-uuid="${user.uuid}">
                        ${user.is_admin ? 'הסר מנהל' : 'עשה מנהל'}
                    </button>
                </td>
            `;
            usersTableBody.appendChild(userRow);
        });

        // הוספת מאזינים לכפתורים "עשה מנהל"
        document.querySelectorAll('.make-admin-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const userUuid = this.getAttribute('data-user-uuid');
                await toggleAdminStatus(userUuid);
            });
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// פונקציה לשינוי סטטוס המנהל של המשתמש
async function toggleAdminStatus(userUuid) {
    try {
        // בקשת המידע על המשתמש כדי לקבוע את הסטטוס הנוכחי
        const response = await fetch(`/users/search?attribute=uuid&value=${userUuid}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }
        
        const [user] = await response.json();

        // קביעת סטטוס המנהל החדש
        const newIsAdminStatus = !user.is_admin; // הופך את הסטטוס הקיים

        const updateResponse = await fetch(`/users/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uuid: userUuid,
                is_admin: newIsAdminStatus, // עדכון הסטטוס החדש
                // לא צריך לשלוח שדות נוספים כמו name, email, address
            }),
        });

        if (updateResponse.ok) {
            alert('סטטוס המנהל עודכן בהצלחה!');
            fetchAllUsers(); // עדכון רשימת המשתמשים
        } else {
            const errorMsg = await updateResponse.json();
            console.error('Server error:', errorMsg);
            throw new Error('עדכון סטטוס המנהל נכשל.');
        }
    } catch (error) {
        console.error('Error toggling admin status:', error);
    }
}


// קריאה לפונקציות בעת טעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    fetchUserDetails(); // הצגת פרטי המשתמש
    fetchUsersOrders(); // הצגת היסטוריית ההזמנות
    fetchAllUsers(); // הצגת כל המשתמשים
});