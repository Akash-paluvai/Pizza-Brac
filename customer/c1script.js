// Initialize cart as an empty array
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchMenu();
});

function fetchMenu() {
    fetch("http://localhost:8000/menu")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(menuItems => {
            const menuContainer = document.getElementById("menu-items");
            menuItems.forEach(item => {
                const card = document.createElement("div");
                card.classList.add("card");
                card.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price}</p>
                    <p>Prep Time: ${item.time} mins</p>
                    <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})">Add to Cart</button>
                `;
                menuContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching menu:', error));
}

function addToCart(id, name, price) {
    cart.push({ id, name, price });
    renderCart();
}

function renderCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    cartItemsContainer.innerHTML = "";
    let totalPrice = 0;
    cart.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>Price: $${item.price}</p>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItemsContainer.appendChild(card);
        totalPrice += item.price;
    });
    document.getElementById("total-price").textContent = totalPrice.toFixed(2);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

document.getElementById("checkout-btn").addEventListener("click", () => {
    document.getElementById("order-form").classList.remove("hidden");
});

document.getElementById("place-order-btn").addEventListener("click", () => {
    const name = document.getElementById("customer-name").value;
    const contact = document.getElementById("customer-contact").value;

    fetch("http://localhost:8000/order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, contact, cartItems: cart })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("order-id").textContent = data.orderId;
        document.getElementById("order-status").classList.remove("hidden");
        trackOrder(data.orderId);
    })
    .catch(error => console.error('Error placing order:', error));
});

function trackOrder(orderId) {
    document.getElementById("status").textContent = "Preparing";
    const interval = setInterval(() => {
        fetch(`http://localhost:8000/order-status/${orderId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById("status").textContent = data.status;
                if (data.status === "Finished") {
                    clearInterval(interval);
                    document.getElementById("payment").classList.remove("hidden");
                }
            })
            .catch(error => console.error('Error tracking order:', error));
    }, 8000);
}

document.getElementById("pay-btn").addEventListener("click", () => {
    const cardNumber = document.getElementById("card-number").value;
    fetch("http://localhost:8000/payment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId: document.getElementById("order-id").textContent, cardNumber })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(() => {
        alert("Payment successful!");
        document.getElementById("status").textContent = "Paid";
    })
    .catch(error => console.error('Error processing payment:', error));
});
