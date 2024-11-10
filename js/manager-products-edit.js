document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();

    // Modal elements and form sections
    const addProductSection = document.getElementById("add-product-section");
    const updateProductSection = document.getElementById("update-product-section");
    const modal = document.getElementById("product-modal");
    const closeModalBtn = document.querySelector(".close-modal");
    const openAddProductBtn = document.getElementById("open-add-product-btn");

    // Event listeners for modal controls
    openAddProductBtn.addEventListener("click", () => openModal("add"));
    closeModalBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });

    document.getElementById("add-product-form").addEventListener("submit", addProduct);
    document.getElementById("update-product-form").addEventListener("submit", updateProduct);

    // Event listener for product search
    document.getElementById("search-product-btn").addEventListener("click", searchProduct);

    // Load initial product list
    fetchProducts();
});

// Fetch and display products
async function fetchProducts() {
    try {
        const response = await fetch('/products/list');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Display products in the list with update and remove buttons
function displayProducts(products) {
    const productList = document.getElementById("product-list-manager");
    productList.innerHTML = "";

    products.forEach(product => {
        const productCard = `
            <div class="product-card">
                <img src="/images/${product.image}" alt="${product.name}" />
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p>מחיר: ₪${product.price}</p>
                <p>כמות נמכרה: ${product.amount_sold}</p>
                <div class="manager-buttons">
                    <button onclick='showUpdateForm(${JSON.stringify(product)})'>עדכן מוצר</button>
                    <button class="remove-btn" onclick="removeProduct('${product.uuid}')">הסר מוצר</button>
                </div>
            </div>
        `;
        productList.innerHTML += productCard;
    });
}

async function fetchShops() {
    try {
        const response = await fetch('/stores/list');
        if (!response.ok) {
            throw new Error('Failed to fetch shops');
        }
        const shops = await response.json();
        const shopSelect = document.getElementById("shop-select");
        shopSelect.innerHTML = shops.map(shop => `<option value="${shop.uuid}">${shop.address}</option>`).join('');
    } catch (error) {
        console.error("Error fetching shops:", error);
    }
}

// Function to search products
async function searchProduct() {
    const searchInput = document.getElementById("product-search-input").value.trim().toLowerCase();
    if (!searchInput) {
        alert("אנא הכנס ערך לחיפוש");
        return;
    }

    try {
        const response = await fetch(`/products/list`);
        if (!response.ok) {
            throw new Error('Failed to search products');
        }
        const products = await response.json();
        const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchInput));
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error searching products:', error);
    }
}

// Open modal for add or update form
function openModal(type) {
    const modal = document.getElementById("product-modal");
    const addProductSection = document.getElementById("add-product-section");
    const updateProductSection = document.getElementById("update-product-section");

    // Show the appropriate form based on type
    if (type === "add") {
        addProductSection.style.display = "block";
        updateProductSection.style.display = "none";
    } else if (type === "update") {
        addProductSection.style.display = "none";
        updateProductSection.style.display = "block";
    }

    // Display the modal
    modal.style.display = "flex";
}

// Close the modal
function closeModal() {
    document.getElementById("product-modal").style.display = "none";
}

// Fetch the highest existing UUID and generate the next one
async function getNextUuid() {
    try {
        const response = await fetch('/products/list');
        const products = await response.json();

        // Extract UUIDs and find the highest number
        const maxUuid = products.reduce((max, product) => {
            const num = parseInt(product.uuid.slice(1)); // Assuming UUIDs start with 'p' and follow with numbers
            return num > max ? num : max;
        }, 0);

        // Generate the next UUID
        const nextUuid = `p${(maxUuid + 1).toString().padStart(3, '0')}`; // Format as p002, p003, etc.
        return nextUuid;
    } catch (error) {
        console.error("Error fetching products for UUID generation:", error);
        return "p001"; // Default to p001 if no products or error
    }
}

// Add a new product
async function addProduct(event) {
    event.preventDefault();

    const product = {
        uuid: await getNextUuid(), // Get the next UUID automatically
        name: document.getElementById("new-product-name").value,
        description: document.getElementById("new-product-description").value,
        price: parseFloat(document.getElementById("new-product-price").value),
        image: document.getElementById("new-product-image").value,
        amount_sold: parseInt(document.getElementById("new-product-amount-sold").value),
        supplier: document.getElementById("new-supplier").value
    };

    try {
        const response = await fetch("/products/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
        });

        if (response.ok) {
            alert("מוצר נוסף בהצלחה!");
            fetchProducts();
            document.getElementById("add-product-form").reset();
            closeModal();
        } else {
            console.error("Failed to add product");
        }
    } catch (error) {
        console.error("Error adding product:", error);
    }
}

// Show the update form with the product's current details
function showUpdateForm(product) {
    document.getElementById("update-product-uuid").value = product.uuid;
    document.getElementById("update-product-name").value = product.name;
    document.getElementById("update-product-description").value = product.description;
    document.getElementById("update-product-price").value = product.price;
    document.getElementById("update-product-image").value = product.image;
    document.getElementById("update-product-amount-sold").value = product.amount_sold;
    document.getElementById("update-supplier").value = product.supplier;
    
    fetchShops();
    openModal("update");
}

// Update an existing product
async function updateProduct(event) {
    event.preventDefault();

    const uuid = document.getElementById("update-product-uuid").value;
    const shopUuid = document.getElementById("shop-select").value;
    const newStock = parseInt(document.getElementById("update-amount-in-stock").value);

    const updatedProduct = {
        uuid,
        name: document.getElementById("update-product-name").value,
        description: document.getElementById("update-product-description").value,
        price: parseFloat(document.getElementById("update-product-price").value),
        image: document.getElementById("update-product-image").value,
        amount_sold: parseInt(document.getElementById("update-product-amount-sold").value),
        supplier: document.getElementById("update-supplier").value
    };

    try {
        // Update product details
        const productResponse = await fetch(`/products/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filter: { uuid },
                update: { $set: updatedProduct }
            }),
        });

        // Update inventory for the selected shop
        const inventoryResponse = await fetch(`/stores/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filter: { uuid: shopUuid, 'inventory.product_uuid': uuid },
                update: { $set: { 'inventory.$.amount_in_stock': newStock } }
            }),
        });

        if (productResponse.ok && inventoryResponse.ok) {
            alert("מוצר והמלאי בחנות עודכנו בהצלחה!");
            fetchProducts();
            closeModal();
        } else {
            console.error("Failed to update product or stock");
        }
    } catch (error) {
        console.error("Error updating product:", error);
    }
}

// Remove a product
async function removeProduct(uuid) {
    try {
        const response = await fetch(`/products/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uuid }),
        });

        if (response.ok) {
            alert("המוצר הוסר בהצלחה!");
            fetchProducts();
        } else {
            console.error("Failed to delete product");
        }
    } catch (error) {
        console.error("Error removing product:", error);
    }
}
