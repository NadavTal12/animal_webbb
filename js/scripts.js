function loadFile(file, elementId) {
    fetch(file)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error loading file: ${file}`);
            }
            return response.text();
        })
        .then((data) => {
            document.getElementById(elementId).innerHTML = data;
            if (elementId === "header") {
                updateHeaderWithUserInfo(); // עדכון ה-Header לאחר הטעינה
            }
        })
        .catch((error) => console.error('Error loading file:', error));
}

function updateHeaderWithUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    const headerElement = document.getElementById('user-navigation');
    const userInfoElement = document.getElementById('user-info');

    if (user) {
        const isAdmin = user.is_admin;
        const userName = user.name || user.email;

        let navContent = '';
        if (isAdmin) {
            navContent = `
                <ul>
                <li id="home"><a href="/index.html">ראשי</a></li>
                <li id="products"><a href="/products-catalog.html">מוצרים</a></li>
                <li id="blog" class="dropdown">
                    <a href="#" class="dropbtn">בלוג</a>
                    <ul class="dropdown-content">
                        <li><a href="/blog-posts/how-to-feed-you-animal.html">איך להאכיל את החיה</a></li>
                        <li><a href="/blog-posts/how-to-train-your-dog.html">איך לאלף את הכלב</a></li>
                        <li><a href="/blog-posts/understand-you-cat.html">איך להבין מה החתול חושב</a></li>
                    </ul>
                </li>
                <li id="about"><a href="/about-and-contact.html">אודות</a></li>
                <li id="cart"><a href="/cart.html">עגלת קניות</a></li>
                <li id="manager"><a href="/manager.html">אזור מנהל</a></li>
                <li id="bi"><a href="/bi-and-stats.html">דוחות</a></li>
                <li id="search">
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="חיפוש" />
                    </div>
                </li>
            </ul>`;
        } else {
            navContent = `
                <ul>
                <li id="home"><a href="/index.html">ראשי</a></li>
                <li id="products"><a href="/products-catalog.html">מוצרים</a></li>
                <li id="blog" class="dropdown">
                    <a href="#" class="dropbtn">בלוג</a>
                    <ul class="dropdown-content">
                        <li><a href="/blog-posts/how-to-feed-you-animal.html">איך להאכיל את החיה</a></li>
                        <li><a href="/blog-posts/how-to-train-your-dog.html">איך לאלף את הכלב</a></li>
                        <li><a href="/blog-posts/understand-you-cat.html">איך להבין מה החתול חושב</a></li>
                    </ul>
                </li>
                <li id="about"><a href="/about-and-contact.html">אודות</a></li>
                <li id="cart"><a href="/cart.html">עגלת קניות</a></li>
                <li id="customer"><a href="/customer.html">אזור אישי</a></li>
                <li id="search">
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="חיפוש" />
                    </div>
                </li>
            </ul>`;
        }

        const greetingText = isAdmin ? `היי המנהל, ${userName}` : `היי ${userName}`;
        const userGreeting = `<div class="user-greeting">${greetingText}</div>`;
        const logoutButton = `<button id="logout-btn">התנתקות</button>`;

        headerElement.innerHTML = navContent;
        userInfoElement.innerHTML = userGreeting + logoutButton;

        document.getElementById('logout-btn').addEventListener('click', function () {
            logoutUser();
        });

    } else {
        headerElement.innerHTML = `
            <ul>
                <li id="home"><a href="/index.html">ראשי</a></li>
                <li id="products" class="dropdown">
                    <a href="/products-catalog.html" class="dropbtn">מוצרים</a>
                </li>
                <li id="blog" class="dropdown">
                    <a href="#" class="dropbtn">בלוג</a>
                    <ul class="dropdown-content">
                        <li><a href="/blog-posts/how-to-feed-you-animal.html">איך להאכיל את החיה</a></li>
                        <li><a href="/blog-posts/how-to-train-your-dog.html">איך לאלף את הכלב</a></li>
                        <li><a href="/blog-posts/understand-you-cat.html">איך להבין מה החתול חושב</a></li>
                    </ul>
                </li>
                <li id="about"><a href="/about-and-contact.html">אודות</a></li>
                <li id="cart"><a href="/cart.html">עגלת קניות</a></li>
                <li id="login"><a href="/login-and signup.html">התחברות</a></li>
                <li id="loging" style="display:none;"><a href="/customer.html">אזור אישי</a></li>
                <li id="search">
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="חיפוש" />
                    </div>
                </li>
            </ul>`;

        userInfoElement.innerHTML = '';
    }
}

// פונקציית התנתקות
function logoutUser() {
    localStorage.removeItem('user');
    localStorage.removeItem('cart_id');
    localStorage.removeItem('user_id');
    window.location.href = '/login-and signup.html';
}

// הטענת קבצי ה-header וה-footer כשנפתח הדף
document.addEventListener("DOMContentLoaded", function () {
    loadFile("/headet.html", "header");
    loadFile("/footer.html", "footer");
});
