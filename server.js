 require("dotenv").config();

const express = require("express");
const cors = require("cors");

const DBConnect = require("./Utils/DBUtils/dbConnect");
const Limiter = require("./Utils/limiter");
const domainValidator = require("./Controllers/Middleware/domainValidator");
const userRegistration = require("./Controllers/userRegistration");
const userLogin = require("./Controllers/userLogin");
const userVerification = require("./Controllers/userVerification");
const auth = require("./Controllers/Middleware/auth");
const isVerified = require("./Controllers/Middleware/isVerified");
const registerOrganization = require("./Controllers/ornanizationRegistration")
const organizationLogin = require("./Controllers/organizationLogin")
const orgAuth = require("./Controllers/Middleware/organizationAuth")
const getUserData = require("./Controllers/getUserData")
const createOrder = require("./Controllers/Orders/createOrder")
const createPaymentOrder = require("./Controllers/Orders/orderPayment");
const verifyPayment = require("./Controllers/Orders/verifyPayment");
const paymentWebhook = require("./Controllers/Orders/paymentWebhook");
const getPaymentStatus = require("./Controllers/Orders/getPaymentAStatus");
const listVendors = require("./Controllers/Orders/listVendors");
const vendorOnly = require("./Controllers/Middleware/vendorOnly");
const createProduct = require("./Controllers/Products/createProduct");
const updateProduct = require("./Controllers/Products/updateProduct");
const deleteProduct = require("./Controllers/Products/deleteProduct");
const getMyProducts = require("./Controllers/Products/getMyProducts");
const { listProducts, getCatalogueOptions } = require("./Controllers/Products/listProducts");
const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: [process.env.FRONTEND_URL, "https://weadrop-frontend.vercel.app","http://localhost:3000"] }));

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), paymentWebhook);

app.use(express.json());

app.post("/api/user/register", Limiter({ limit: 10 }), domainValidator, userRegistration);
app.post("/api/user/login", Limiter(), userLogin);
app.get("/api/user/verify/:token", Limiter({ limit: 20 }), userVerification);
app.get("/api/user/data", auth, getUserData);
app.post("/api/organization/register", auth, registerOrganization)
app.post("/api/organization/login", auth, organizationLogin )
app.post("/api/organization/orders/place",auth,orgAuth, createOrder)
app.post("/api/orders/place", auth, isVerified, createOrder);
app.get("/api/vendors", auth, listVendors);

app.get("/api/products/options", getCatalogueOptions);
app.get("/api/products/mine", auth, vendorOnly, getMyProducts);
app.get("/api/products", auth, listProducts);
app.post("/api/products", auth, isVerified, vendorOnly, createProduct);
app.put("/api/products/:id", auth, vendorOnly, updateProduct);
app.delete("/api/products/:id", auth, vendorOnly, deleteProduct);

app.post("/api/payments/create", Limiter({ limit: 20 }), auth, isVerified, createPaymentOrder);
app.post("/api/payments/verify", Limiter({ limit: 20 }), auth, verifyPayment);
app.get("/api/payments/status/:orderId", auth, getPaymentStatus);

const PORT = process.env.PORT || 5000;

DBConnect().then(() => {
  app.listen(PORT, () => console.log(`running at port: ${PORT}`));
});