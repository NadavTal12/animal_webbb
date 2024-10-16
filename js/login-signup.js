function toggleForm(formType) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn'); // כפתור יציאה

    if (!isUserLoggedIn()) {
        if (formType === 'login') {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            loginBtn.classList.add('active');
            signupBtn.classList.remove('active');
        } else {
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            signupBtn.classList.add('active');
            loginBtn.classList.remove('active');
        }
    }
}

async function handleLogin(event) {
    event.preventDefault(); // למנוע את ברירת המחדל של שליחת הטופס

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login successful:', data);
            localStorage.setItem('user', JSON.stringify(data.user)); // שמירת המשתמש ב-localStorage
            localStorage.setItem('user_id', data.user.uuid); // שמירת ה-user_id ב-localStorage
            window.location.reload(); // רענון הדף להציג את שם המשתמש
        } else {
            console.error('Login failed:', data.error);
            alert(data.error); // הצגת הודעת שגיאה למשתמש
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function handleSignup(event) {
    event.preventDefault(); // למנוע את ברירת המחדל של שליחת הטופס

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const address = document.getElementById('signup-address').value;

    if (password !== confirmPassword) {
        alert('הסיסמאות אינן תואמות.');
        return;
    }

    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, address })
        });

        const data = await response.json();

        if (response.ok) {
            alert('הרשמה הצליחה!'); // הודעה למשתמש על הצלחה

            // שמירת המשתמש ב-localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('user_id', data.user.uuid);

            // יצירת עגלה ריקה אוטומטית למשתמש
            await createEmptyCart(data.user.uuid);

            window.location.href = '/index.html'; // הפניה לאתר הראשי
        } else {
            alert(data.error); // הודעת שגיאה
        }
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה בהרשמה');
    }
}

// פונקציה ליצירת עגלה ריקה אוטומטית
async function createEmptyCart(userId) {
    try {
        const response = await fetch('/cart/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error('Error creating cart');
        }
    } catch (error) {
        console.error('Error creating cart:', error);
    }
}

function logout() {
    localStorage.removeItem('user'); // להסיר את המשתמש מה-localStorage
    localStorage.removeItem('user_id'); // איפוס מזהה המשתמש בעת יציאה
    localStorage.removeItem('cart_id'); // איפוס העגלה בעת יציאה
    window.location.reload(); // רענון הדף
}

function isUserLoggedIn() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null && localStorage.getItem('user_id') !== null; // בדיקה גם של user וגם של user_id
}

document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('signup-form').addEventListener('submit', handleSignup);

const user = JSON.parse(localStorage.getItem('user'));
const userGreeting = document.getElementById('user-greeting');
const welcomeMessage = document.getElementById('welcome-message');

if (user) {
    userGreeting.classList.remove('hidden'); // להציג את ברכת הברוך הבא
    welcomeMessage.textContent = `היי ${user.name}, אתה מחובר!`; // עדכון להציג את שם המשתמש

    if (user.is_admin) {
        welcomeMessage.textContent = `היי המנהל ${user.name}, אתה מחובר!`;
    }

    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-btn').classList.add('hidden');
    document.getElementById('signup-btn').classList.add('hidden');
} else {
    userGreeting.classList.add('hidden');
}

document.getElementById('logout-btn').addEventListener('click', logout);
