document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("product-search");
    const quantityInput = document.getElementById("product-quantity");
    const customerNameInput = document.getElementById("customer-name");
    const dropdown = document.getElementById("dropdown");
    const orderSummary = document.getElementById("order-summary");
    const placeOrderButton = document.getElementById("place-order");
    const totalCostElement = document.getElementById("total-cost");
    const totalSpElement = document.getElementById("total-sp");
    const addProductButton = document.getElementById("add-product");
    const getOrdersButton = document.getElementById("get-orders");
    const orderHistoryElement = document.getElementById("order-history");
    const orderNumberSearchInput = document.getElementById("order-number-search");
    const orderNumberInput = document.getElementById("order-number");
    const editOrderNumberInput = document.getElementById("edit-order-number");
    const fetchOrderToEditBtn = document.getElementById("fetch-order-to-edit");
    const editOrderSection = document.getElementById("edit-order-section");
    const editOrderSummary = document.getElementById("edit-order-summary");
    const editTotalCostElement = document.getElementById("edit-total-cost");
    const editTotalSpElement = document.getElementById("edit-total-sp");
    const saveEditedOrderBtn = document.getElementById("save-edited-order");



    let products = [];
    let selectedProducts = [];

    // Fetch the product list from the backend
    fetch("https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/products", {
        headers: {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            products = data;
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            alert("Failed to load product list. Please try again later.");
        });

    // Add better spacing between quantity field and add button
    quantityInput.style.marginRight = "12px";

    // Filter and display the dropdown as user types
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        dropdown.innerHTML = "";

        if (query) {
            const filtered = products.filter((product) =>
                product.name.toLowerCase().includes(query)
            );

            filtered.forEach((product) => {
                const item = document.createElement("div");
                item.textContent = product.name;
                item.classList.add("dropdown-item");
                item.addEventListener("click", () => {
                    searchInput.value = product.name;
                    dropdown.style.display = "none";
                });
                dropdown.appendChild(item);
            });

            dropdown.style.display = "block";
        } else {
            dropdown.style.display = "none";
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!dropdown.contains(event.target) && event.target !== searchInput) {
            dropdown.style.display = "none";
        }
    });

    // Add product to order with quantity
    function addProductToOrder(product, quantity) {
        const existingProduct = selectedProducts.find(p => p.uid === product.uid);

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            product.quantity = quantity;
            selectedProducts.push(product);
        }

        updateOrderSummary();
        searchInput.value = "";
        quantityInput.value = "0";
        dropdown.style.display = "none";
    }

    // Update order summary
    function updateOrderSummary() {
        orderSummary.innerHTML = "";
        let totalCost = 0;
        let totalSp = 0;

        selectedProducts.forEach((product, index) => {
            const itemCost = product.price * product.quantity;
            const itemSp = product.sp * product.quantity;
            totalCost += itemCost;
            totalSp += itemSp;

            const item = document.createElement("div");
            item.style.display = "flex";
            item.style.justifyContent = "space-between";
            item.style.alignItems = "center";
            item.style.marginBottom = "4px";
            item.style.fontSize = "14px";

            const infoSpan = document.createElement("span");
            infoSpan.textContent = `${product.name} (x${product.quantity}) - Rs. ${itemCost} (SP: ${itemSp})`;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove from Cart";
            removeBtn.style.fontSize = "15px";
            removeBtn.style.padding = "2px 6px";
            removeBtn.style.marginLeft = "300px";
            removeBtn.addEventListener("click", () => {
                selectedProducts.splice(index, 1);
                updateOrderSummary();
            });

            item.appendChild(infoSpan);
            item.appendChild(removeBtn);
            orderSummary.appendChild(item);
        });

        totalCostElement.textContent = `Total Cost: Rs. ${totalCost}`;
        totalSpElement.textContent = `Total SP: ${totalSp}`;
    }

    // Handle Add button to Cart click
    addProductButton.addEventListener("click", () => {
        const query = searchInput.value.toLowerCase().trim();
        const quantity = parseInt(quantityInput.value);
        const customerPhone = document.getElementById("customer-phone").value.trim();
        
        if (!customerPhone) {
            alert("Please enter a phone number before adding products");
            document.getElementById("customer-phone").focus();
            return;
        }
        
        if (!query) {
            alert("Please enter a product name");
            searchInput.focus();
            return;
        }
        
        if (isNaN(quantity) || quantity <= 0) {
            alert("Please enter a valid quantity");
            quantityInput.focus();
            return;
        }
        
        const product = products.find(p => p.name.toLowerCase() === query);
        
        if (product) {
            addProductToOrder(product, quantity);
        } else {
            alert("Product not found. Please select from the dropdown.");
            searchInput.focus();
        }
    });
    // Fetch order by number logic
    getOrdersButton.addEventListener("click", () => {
        const orderNumber = orderNumberSearchInput.value.trim();
        
        if (!orderNumber) {
            orderHistoryElement.innerHTML = "<p>Please enter an order number.</p>";
            return;
        }

        orderHistoryElement.innerHTML = "<p>Loading order...</p>";

        fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?uid=eq.${orderNumber}&select=*`, {
            headers: {
                apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                "Content-Type": "application/json"
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then((orderItems) => {
            console.log('Full order response:', JSON.stringify(orderItems, null, 2)); // Log the full response
            console.log('First order item structure:', orderItems[0] ? Object.keys(orderItems[0]) : 'No items');
            if (orderItems.length === 0) {
                orderHistoryElement.innerHTML = `<p>No order found with number: ${orderNumber}</p>`;
                return;
            }

            // Display the order
            orderHistoryElement.innerHTML = '';
            
            // Get the first order item to display header info
            const firstItem = orderItems[0];
            let items = [];
            
            // Log the structure of the first item for debugging
            console.log('First item structure:', firstItem);
            
            // Parse the product names string into individual items
            if (firstItem && firstItem.product_names) {
                // Split the product names string into individual product entries
                const productEntries = firstItem.product_names.split(',').map(s => s.trim());
                
                // Parse each product entry
                items = productEntries.map(entry => {
                    // Example entry: "PUNARNAVA x Qty: 2 x Price: 989 x SP: 5"
                    const parts = entry.split('x').map(part => part.trim());
                    if (parts.length >= 4) {
                        const name = parts[0].trim();
                        const quantity = parseInt(parts[1].replace('Qty:', '').trim(), 10) || 0;
                        const price = parseInt(parts[2].replace('Price:', '').trim(), 10) || 0;
                        const sp = parseInt(parts[3].replace('SP:', '').trim(), 10) || 0;
                        
                        return {
                            name,
                            quantity,
                            price,
                            sp,
                            total: quantity * price
                        };
                    }
                    return null;
                }).filter(Boolean); // Remove any null entries
            }
            
            const orderContainer = document.createElement('div');
            orderContainer.className = 'order-container';
            
            const orderHeader = document.createElement('div');
            orderHeader.className = 'order-header';
            orderHeader.innerHTML = `
                <h3>Order #${firstItem.uid || orderNumber}</h3>
                <span>${new Date(firstItem.order_date || new Date()).toLocaleString()}</span>
                <span>Customer: ${firstItem.customer_name || 'N/A'}</span>
            `;
            
            const orderDetails = document.createElement('div');
            orderDetails.className = 'order-details';
            
            const itemsList = document.createElement('ul');
            let total = 0;
            
            // Display the items we extracted earlier
            if (items.length > 0) {
                items.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.className = 'order-item';
                    
                    const itemName = document.createElement('span');
                    itemName.className = 'item-name';
                    itemName.textContent = item.name || 'Product';
                    
                    const itemDetails = document.createElement('span');
                    itemDetails.className = 'item-details';
                    itemDetails.textContent = `x ${item.quantity} - ₹${item.price.toFixed(2)} each`;
                    
                    const itemTotal = document.createElement('span');
                    itemTotal.className = 'item-total';
                    itemTotal.textContent = `₹${(item.price * item.quantity).toFixed(2)}`;
                    
                    listItem.appendChild(itemName);
                    listItem.appendChild(itemDetails);
                    listItem.appendChild(itemTotal);
                    
                    itemsList.appendChild(listItem);
                    total += item.price * item.quantity;
                });
                
                // Add the total SP points
                if (firstItem.total_sp) {
                    const spItem = document.createElement('li');
                    spItem.className = 'order-total';
                    spItem.textContent = `Total SP Points: ${firstItem.total_sp}`;
                    itemsList.appendChild(spItem);
                }
            } else {
                // Fallback if no items were found
                const listItem = document.createElement('li');
                listItem.textContent = 'No items found in this order';
                itemsList.appendChild(listItem);
            }
            
            const orderTotal = document.createElement('div');
            orderTotal.className = 'order-total';
            orderTotal.textContent = `Total: ₹${total.toFixed(2)}`;
            
            orderDetails.appendChild(itemsList);
            orderDetails.appendChild(orderTotal);
            
            orderContainer.appendChild(orderHeader);
            orderContainer.appendChild(orderDetails);
            orderHistoryElement.appendChild(orderContainer);
        })
        .catch((error) => {
            console.error("Error fetching order:", error);
            orderHistoryElement.innerHTML = "<p>Failed to load order. Please try again.</p>";
        });
    });

document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target) && event.target !== searchInput) {
        dropdown.style.display = "none";
    }
});

fetchOrderToEditBtn.addEventListener("click", async () => {
    const orderId = editOrderNumberInput.value.trim();
    const phoneNumber = document.getElementById("edit-phone-number").value.trim();

    if (!orderId || isNaN(orderId)) {
        alert("Please enter a valid order number.");
        editOrderNumberInput.focus();
        return;
    }

    if (!phoneNumber) {
        alert("Please enter the phone number associated with this order.");
        document.getElementById("edit-phone-number").focus();
        return;
    }

    try {
        // First, verify the order exists and the phone number matches
        const response = await fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?uid=eq.${orderId}&select=*`, {
            headers: {
                apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                "Content-Type": "application/json",
            }
        });

        const data = await response.json();

        if (data.length === 0) {
            alert("No order found with the provided order number.");
            return;
        }

        const order = data[0];
        
        // Verify the phone number matches
        if (order.phoneNumber !== phoneNumber) {
            alert("The phone number does not match our records for this order. Please check and try again.");
            document.getElementById("edit-phone-number").focus();
            return;
        }

        // If we get here, verification passed - display the order for editing
        displayEditableOrder(order);
    } catch (err) {
        console.error("Failed to fetch order:", err);
        alert("Error fetching order. Please try again.");
    }
});

function displayEditableOrder(order) {
    editOrderSection.style.display = "block";

    // Display the order number being edited
    const orderNumberSpan = document.getElementById("editing-order-number");
    if (orderNumberSpan) {
        orderNumberSpan.textContent = order.uid;
    }

    // Set up cancel button
    const cancelButton = document.getElementById("cancel-edit");
    if (cancelButton) {
        cancelButton.onclick = () => {
            editOrderSection.style.display = "none";
            document.getElementById("edit-order-number").value = "";
            document.getElementById("edit-phone-number").value = "";
        };
    }

    editOrderSummary.innerHTML = `
        <div class="edit-order-controls" style="margin-bottom: 15px;">
            <input type="text" id="edit-product-search" placeholder="Search products to add" style="width: 200px; padding: 5px;">
            <input type="number" id="edit-product-quantity" value="1" min="1" style="width: 60px; padding: 5px; margin: 0 10px;">
            <h2>     </h2>
            <button id="edit-add-product" style="padding: 5px 10px;">Add Product</button>
            <div id="edit-product-dropdown" class="dropdown" style="position: absolute; z-index: 1000;"></div>
        </div>
        <div id="edit-order-items"></div>
    `;

    // Parse fresh copy of items every time to avoid duplicating
    const items = order.product_names.split(", ").map(item => {
        const [namePart, qtyPart, pricePart, spPart] = item.split(" x ");
        return {
            name: namePart.trim(),
            quantity: parseInt(qtyPart.split(": ")[1]),
            price: parseFloat(pricePart.split(": ")[1]),
            sp: parseFloat(spPart.split(": ")[1])
        };
    });

    // Initialize search functionality for edit order
    const editSearchInput = document.getElementById("edit-product-search");
    const editQuantityInput = document.getElementById("edit-product-quantity");
    const editDropdown = document.getElementById("edit-product-dropdown");
    const editAddButton = document.getElementById("edit-add-product");

    // Handle product search in edit mode
    editSearchInput.addEventListener("input", () => {
        const query = editSearchInput.value.toLowerCase();
        editDropdown.innerHTML = "";

        if (query) {
            const filtered = products.filter((product) =>
                            product.name.toLowerCase().includes(query)
            );

            filtered.forEach(product => {
                const item = document.createElement("div");
                item.textContent = product.name;
                item.classList.add("dropdown-item");
                item.addEventListener("click", () => {
                    editSearchInput.value = product.name;
                    editDropdown.style.display = "none";
                    editAddButton.onclick = () => addProductToEditOrder(product, parseInt(editQuantityInput.value) || 1);
                });
                editDropdown.appendChild(item);
            });

            editDropdown.style.display = filtered.length ? "block" : "none";
        } else {
            editDropdown.style.display = "none";
        }
    });

    // Handle click outside dropdown
    document.addEventListener("click", (e) => {
        if (!editDropdown.contains(e.target) && e.target !== editSearchInput) {
            editDropdown.style.display = "none";
        }
    });

    // Function to add product to edit order
    function addProductToEditOrder(product, quantity) {
        if (!product || !quantity || quantity < 1) return;

        const existingItem = items.find(item => item.name.toLowerCase() === product.name.toLowerCase());
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            items.push({
                name: product.name,
                price: product.price,
                sp: product.sp,
                quantity: quantity
            });
        }

        editSearchInput.value = "";
        editQuantityInput.value = "1";
        renderUI();
    }

    function renderUI() {
        const editOrderItems = document.getElementById("edit-order-items");
        if (!editOrderItems) return;

        editOrderItems.innerHTML = "";
        let totalCost = 0;
        let totalSp = 0;

        items.forEach((item, index) => {
            const row = document.createElement("div");
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.marginBottom = "6px";

            const nameSpan = document.createElement("span");
            nameSpan.textContent = item.name;

            const qtyInput = document.createElement("input");
            qtyInput.type = "number";
            qtyInput.min = "0";
            qtyInput.value = item.quantity;
            qtyInput.style.width = "60px";
            qtyInput.classList.add("edit-qty");

            qtyInput.setAttribute("data-price", item.price);
            qtyInput.setAttribute("data-sp", item.sp);

            qtyInput.addEventListener("input", () => {
                const newQty = parseInt(qtyInput.value);
                if (!isNaN(newQty)) {
                    item.quantity = newQty;
                    updateTotals();
                }
            });

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.style.fontSize = "10px";
            removeBtn.style.marginLeft = "10px";
            removeBtn.addEventListener("click", () => {
                items.splice(index, 1);
                renderUI();  // re-render after removing
            });

            const itemGroup = document.createElement("div");
            itemGroup.appendChild(nameSpan);
            itemGroup.appendChild(qtyInput);
            itemGroup.appendChild(removeBtn);

            row.appendChild(itemGroup);
            editOrderItems.appendChild(row);
        });

        updateTotals();
    }

    function updateTotals() {
        let totalCost = 0;
        let totalSp = 0;

        items.forEach(item => {
            totalCost += item.price * item.quantity;
            totalSp += item.sp * item.quantity;
        });

        // Update the total displays
        const editTotalCostElement = document.getElementById("edit-total-cost");
        const editTotalSpElement = document.getElementById("edit-total-sp");
        if (editTotalCostElement) editTotalCostElement.textContent = `Total Cost: ₹${totalCost.toFixed(2)}`;
        if (editTotalSpElement) editTotalSpElement.textContent = `Total SP: ${totalSp.toFixed(2)}`;
    }

    // Set up save button
    const saveBtn = document.getElementById("save-edited-order");
    if (saveBtn) {
        saveBtn.onclick = () => saveEditedOrder(order.uid, items);
    }

    // Set up add button
    if (editAddButton) {
        editAddButton.onclick = () => {
            const productName = editSearchInput.value.trim();
            const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
            if (product) {
                addProductToEditOrder(product, parseInt(editQuantityInput.value) || 1);
            } else {
                alert("Please select a valid product from the dropdown");
            }
        };
    }

    renderUI();

    setTimeout(() => {
        document.querySelector(".edit-qty")?.focus();
    }, 100);
}



function saveEditedOrder(orderUid) {
    const rows = editOrderSummary.querySelectorAll("div[style*='display: flex']");
    const updatedItems = [];

    rows.forEach((row) => {
        const itemGroup = row.querySelector("div");
        if (!itemGroup) return;

        const name = itemGroup.querySelector("span")?.textContent.trim();
        const qtyInput = itemGroup.querySelector("input.edit-qty");
        if (!name || !qtyInput) return;

        const quantity = parseInt(qtyInput.value);
        const price = parseFloat(qtyInput.getAttribute("data-price"));
        const sp = parseFloat(qtyInput.getAttribute("data-sp"));

        if (isNaN(quantity) || isNaN(price) || isNaN(sp)) return;

        updatedItems.push({ name, quantity, price, sp });
    });

    if (updatedItems.length === 0) {
        alert("Cannot save an empty order.");
        return;
    }

    const updatedProductNames = updatedItems.map(item =>
        `${item.name} x Qty: ${item.quantity} x Price: ${item.price} x SP: ${item.sp}`
    ).join(", ");

    const updatedTotalCost = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const updatedTotalSp = updatedItems.reduce((sum, item) => sum + item.sp * item.quantity, 0);

    const updatedOrder = {
        product_names: updatedProductNames,
        total_cost: updatedTotalCost,
        total_sp: updatedTotalSp
    };

    console.log("Before patch request",updatedOrder);

    fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?uid=eq.${orderUid}`, {
        method: "PATCH",
        headers: {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        },
        body: JSON.stringify(updatedOrder)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Update failed. Status: ${response.status}`);
        }
        alert("Order updated successfully!");
        editOrderSection.style.display = "none";
    })
    .catch(error => {
        console.error("Error saving edited order:", error);
        alert("Failed to update the order. Please try again.");
    });
}




    // Place order logic
    placeOrderButton.addEventListener("click", () => {
        if (selectedProducts.length === 0) {
            alert("No products selected!");
            return;
        }

        const customerName = customerNameInput.value.trim() || "Anonymous Customer";
        const customerPhone = document.getElementById("customer-phone").value.trim();

        if (!customerPhone) {
            alert("Please enter a phone number.");
            return;
        }

        const orderData = {
            customer_name: customerName,
            phoneNumber: customerPhone,
            product_names: selectedProducts.map((p) => `${p.name} x Qty: ${p.quantity} x Price: ${p.price} x SP: ${p.sp}`).join(", "),
            total_cost: selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0),
            total_sp: selectedProducts.reduce((sum, p) => sum + p.sp * p.quantity, 0),
        };
        
        console.log("orderData", orderData);
        fetch("https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders", {
            method: "POST",
            headers: {
                apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: JSON.stringify(orderData),
        })
            .then((response) => {
                if (response.status === 201) {
                    return response.json();
                } else {
                    throw new Error(`Failed to place order. Status: ${response.status}`);
                }
            })
            .then((data) => {
                alert("Order placed successfully!");
                selectedProducts = [];
                customerNameInput.value = "";
                document.getElementById("customer-phone").value = "";
                updateOrderSummary();
                console.log("Order created:", data);
            })
            .catch((error) => {
                console.error("Error placing order:", error);
                alert("Failed to place order. Please try again. Error: " + error.message);
            });
    });
       // Handle Order File Download
               document.getElementById("download-order-details").addEventListener("click", downloadOrderFile);

               async function downloadOrderFile() {
                   const orderId = orderNumberInput.value.trim();

                   if (!orderId || isNaN(orderId)) {
                               alert("Please enter a valid order number.");
                               return;
                   }

                   try {
                       const response = await fetch(`https://gfyuuslvnlkbqztbduys.supabase.co/rest/v1/orders?uid=eq.${orderId}`,{
                           headers: {
                               "Content-Type": "application/json",
                               "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8",
                               "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeXV1c2x2bmxrYnF6dGJkdXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMwODQzOSwiZXhwIjoyMDU1ODg0NDM5fQ.oTifqXRyaBFyJReUHWIO21cwNBDd7PbplajanFdhbO8"
                           }
                       });

                       const orders = await response.json();

                       if (orders.length === 0) {
                           alert("No orders found for this customer.");
                           return;
                       }

                       const order = orders[0];
                       const orderItems = order.product_names.split(", ");
                       const orderDate = new Date(order.order_date);
                       // Convert to IST by adding 5.5 hours (330 minutes)
                       orderDate.setMinutes(orderDate.getMinutes() + 330);
                       // Format the date
                       const formattedDate = orderDate.toLocaleString('en-IN', {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit',
                           second: '2-digit',
                           hour12: true
                       });

                       const { jsPDF } = window.jspdf;
                        const doc = new jsPDF();
                        // Add this after creating the doc
                        doc.setFontSize(12);
                        doc.setFont("helvetica", "bold");

                        // Add left image
//                        doc.addImage(data:image/png;base64,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, 'PNG', 10, 10, 20, 20);
                        doc.addImage('data:image/png;base64,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', 'PNG', 10, 10, 20, 20);

                        // Add text in the center
                        doc.text("JAGANNATH WELLNESS", 105, 10, { align: "center" });

                        // Add right image
//                        doc.addImage(data:image/png;base64,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, 'PNG', 180, 15, 20, 20);
                        doc.addImage('data:image/png;base64,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', 'PNG', 180, 10, 20, 20);
                        // Continue with the rest of your code
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(7);
                        doc.text("(An AWPL Franchise)", 105, 13, { align: "center" });
                        doc.setFontSize(9);
                        doc.text("BDA Colony, Chandrasekharpur, Khordha, Bhubaneswar - 751016", 105, 16, { align: "center" });
                        doc.text("Contact: +91-7381716240", 105, 20, { align: "center" });
                        doc.line(20, 25, 190, 25);
                        let y = 30;
                                    doc.text(`Customer Name: ${order.customer_name}`, 20, y);
                                    doc.setFont('helvetica', 'bold');
                                    const currentSize = doc.getFontSize();
                                    doc.setFontSize(currentSize + 2);
                                    doc.text(`Bill Number: ${order.uid}`, 160, y);
                                    doc.setFontSize(currentSize);
                                    doc.setFont('helvetica', 'normal');
                                    y += 5;
                                    doc.text(`Order Date: ${orderDate}`, 20, y);
                                    y += 5;
                                    doc.text("Order Details:", 20, y);
                                    y += 5;

                                    doc.text("Item", 20, y);
                                    doc.text("Qty", 70, y);
                                    doc.text("Price", 100, y);
                                    doc.text("SP", 130, y);
                                    doc.text("Product Cost", 160, y);
                                    y += 3;
                                    doc.line(20, y, 190, y);
                                    y += 4;

                                    orderItems.forEach((item, index) => {
                                        if (y > 270) {
                                            doc.addPage();
                                            y = 20;
                                        }

                                        const parts = item.split(" x ");
                                        const name = parts[0];
                                        const qty = parseInt(parts[1].split(": ")[1]);
                                        const priceVal = parseFloat(parts[2].split(": ")[1]);
                                        const sp = parts[3].split(": ")[1];
                                        const productCost = qty * priceVal;

                                        doc.text(`${index + 1}. ${name}`, 20, y);
                                        doc.text(`${qty}`, 70, y);
                                        doc.text(`Rs. ${priceVal.toFixed(2)}`, 100, y);
                                        doc.text(sp, 130, y);
                                        doc.text(`Rs. ${productCost.toFixed(2)}`, 160, y);
                                        y += 5;
                                    });

                                    y += 5;
                                    doc.text(`Total Cost: Rs. ${order.total_cost}`, 20, y);
                                    doc.text(`Total SP: ${order.total_sp}`, 20, y + 5);
                                    y += 10;
                                    doc.setFontSize(8);
                                    doc.text("Pay to | SBI A/c Name: Jagannath Wellness, A/c No.: 40877005106, IFSC: SBIN0017948 | UPI: 7381716240", 20, y);

                                    const fileName = `Order_${order.customer_name}_${order.uid}.pdf`;
                                    y += 10; // Add some space for the thank you message
                                    doc.setFontSize(10);
                                    doc.setFont('helvetica', 'bold');
                                    doc.text('Thank you for visiting. Hope to see you again.', 105, y, { align: 'center' });
                                    doc.setFont('helvetica', 'normal');
                                    doc.save(fileName);

                   } catch (error) {
                       console.error("Error fetching order:", error);
                       alert("Failed to fetch the last order. Please try again.");
            }
        }
    });
