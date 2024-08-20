const express = require("express");
const cors = require("cors");
const { menuItems, orders } = require("./data");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/menu", (req, res) => {
    res.json(menuItems);
});

app.post("/order", (req, res) => {
    const newOrder = {
        id: orders.length + 1,
        customerName: req.body.name,
        items: req.body.cartItems,
        status: "Preparing",
        estimatedTime: 20,
    };
    orders.push(newOrder);
    res.json({ orderId: newOrder.id });
});

app.get("/order-status/:orderId", (req, res) => {
    const order = orders.find((order) => order.id == req.params.orderId);
    res.json({ status: order ? order.status : "Order Not Found" });
});

app.post("/payment", (req, res) => {
    const order = orders.find((order) => order.id == req.body.orderId);
    if (order) {
        order.status = "Paid";
        res.json({ message: "Payment successful!" });
    } else {
        res.status(404).json({ message: "Order not found" });
    }
});

app.get("/orders", (req, res) => {
    res.json(orders);
});

app.post("/update-order-status", (req, res) => {
    const { orderId, status } = req.body;
    const order = orders.find((order) => order.id == orderId);
    if (order) {
        order.status = status;
        res.json({ message: "Order status updated!" });
    } else {
        res.status(404).json({ message: "Order not found" });
    }
});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
