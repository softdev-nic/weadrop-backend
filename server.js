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
const getUserData = require("./Controllers/getdata");

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: [process.env.FRONTEND_URL, "http://localhost:3000"] }));
app.use(express.json());

app.post("/api/user/register", Limiter({ limit: 10 }), domainValidator, userRegistration);
app.post("/api/user/login", Limiter(), userLogin);
app.get("/api/user/verify/:token", userVerification);
app.get("/api/user/data", auth, getUserData);

const PORT = process.env.PORT || 5000;

DBConnect().then(() => {
  app.listen(PORT, () => console.log(`running at port: ${PORT}`));
});