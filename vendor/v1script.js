document.addEventListener("DOMContentLoaded", () => {
    fetchOrders();
});

function fetchOrders() {
    fetch("http://localhost:8000/orders")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(orders => {
            const orderListContainer = document.getElementById("order-list");
            orderListContainer.innerHTML = ""; // Clear existing orders
            orders.forEach(order => {
                const card = document.createElement("div");
                card.classList.add("card");
                card.innerHTML = `
                    <h3>Order ID: ${order.id}</h3>
                    <p>Customer: ${order.customerName}</p>
                    <p>Status: ${order.status}</p>
                    <button onclick="updateOrderStatus(${order.id}, 'Preparing')">Start Preparing</button>
                    <button onclick="updateOrderStatus(${order.id}, 'Finished')">Mark as Finished</button>
                `;
                orderListContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
}

function updateOrderStatus(orderId, status) {
    fetch("http://localhost:8000/update-order-status", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId, status })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(() => {
        alert("Order status updated!");
        fetchOrders(); // Refresh the orders list
    })
    .catch(error => console.error('Error updating order status:', error));
}
