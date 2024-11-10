document.addEventListener("DOMContentLoaded", () => {
    fetchSuppliers();

    const modal = document.getElementById("supplier-modal");
    const closeModalBtn = document.querySelector(".close-modal");
    const openAddSupplierBtn = document.getElementById("open-add-supplier-btn");

    openAddSupplierBtn.addEventListener("click", () => openModal("add"));
    closeModalBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });

    document.getElementById("add-supplier-form").addEventListener("submit", addSupplier);
    document.getElementById("update-supplier-form").addEventListener("submit", updateSupplier);
});

async function fetchSuppliers() {
    try {
        const response = await fetch('/suppliers');
        if (!response.ok) throw new Error('Failed to fetch suppliers');
        const suppliers = await response.json();
        displaySuppliers(suppliers);
        
        setTimeout(() => initAllMaps(suppliers), 100);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
    }
}

function displaySuppliers(suppliers) {
    const supplierList = document.getElementById("supplier-list");
    supplierList.innerHTML = "";

    suppliers.forEach(supplier => {
        const supplierCard = `
            <div class="supplier-card">
                <h2>${supplier.name}</h2>
                <p>${supplier.addr}</p>
                <div id="map-${supplier.uuid}" class="google-map" style="height: 200px;"></div>
                <div class="manager-buttons">
                    <button class="update-btn" onclick='showUpdateForm(${JSON.stringify(supplier)})'>עדכן ספק</button>
                    <button class="remove-btn" onclick="removeSupplier('${supplier.uuid}')">הסר ספק</button>
                </div>
            </div>
        `;
        supplierList.innerHTML += supplierCard;
    });
}

// Initialize maps for all suppliers
function initAllMaps(suppliers) {
    suppliers.forEach(supplier => {
        initMap(supplier.addr, `map-${supplier.uuid}`);
    });
}

function initMap(address, mapElementId) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, (results, status) => {
        if (status === 'OK') {
            const map = new google.maps.Map(document.getElementById(mapElementId), {
                zoom: 15,
                center: results[0].geometry.location
            });
            new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            console.error(`Geocode failed for address: "${address}" with status: ${status}`);
            document.getElementById(mapElementId).innerText = "Location not found";
        }
    });
}

function openModal(type) {
    const modal = document.getElementById("supplier-modal");
    const addSupplierSection = document.getElementById("add-supplier-section");
    const updateSupplierSection = document.getElementById("update-supplier-section");

    if (type === "add") {
        addSupplierSection.style.display = "block";
        updateSupplierSection.style.display = "none";
    } else if (type === "update") {
        addSupplierSection.style.display = "none";
        updateSupplierSection.style.display = "block";
    }

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("supplier-modal").style.display = "none";
}

async function addSupplier(event) {
    event.preventDefault();

    const supplier = {
        uuid: document.getElementById("new-uuid").value,
        name: document.getElementById("new-supplier-name").value,
        addr: document.getElementById("new-supplier-addr").value,
    };

    try {
        const response = await fetch("/suppliers/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(supplier),
        });

        if (response.ok) {
            alert("ספק נוסף בהצלחה!");
            fetchSuppliers();
            document.getElementById("add-supplier-form").reset();
            closeModal();
        } else {
            console.error("Failed to add supplier");
        }
    } catch (error) {
        console.error("Error adding supplier:", error);
    }
}

function showUpdateForm(supplier) {
    document.getElementById("update-supplier-uuid").value = supplier.uuid;
    document.getElementById("update-supplier-name").value = supplier.name;
    document.getElementById("update-supplier-addr").value = supplier.addr;
    openModal("update");
}

async function updateSupplier(event) {
    event.preventDefault();

    const uuid = document.getElementById("update-supplier-uuid").value;
    const updatedSupplier = {
        uuid,
        name: document.getElementById("update-supplier-name").value,
        addr: document.getElementById("update-supplier-addr").value,
    };

    try {
        const response = await fetch(`/suppliers/${uuid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedSupplier),
        });

        if (response.ok) {
            alert("ספק עודכן בהצלחה!");
            fetchSuppliers();
            closeModal();
        } else {
            console.error("Failed to update supplier");
        }
    } catch (error) {
        console.error("Error updating supplier:", error);
    }
}

async function removeSupplier(uuid) {
    try {
        const response = await fetch(`/suppliers/${uuid}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            alert("הספק הוסר בהצלחה!");
            fetchSuppliers();
        } else {
            console.error("Failed to delete supplier");
        }
    } catch (error) {
        console.error("Error removing supplier:", error);
    }
}
