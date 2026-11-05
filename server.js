const express = require("express")
const cors = require("cors")
const userRegistration = require("./Controllers/userRegistration")
const userLogin = require("./Controllers/userLogin")
const domainValidator = require("./Controllers/Middleware/domainValidator")
const Limiter = require("./Utils/limiter")
const DBConnect = require("./Utils/DBUtils/dbConnect")

const userVerification = require("./Controllers/userVerification")
const app = express()
require("dotenv").config()

DBConnect()
app.use(cors())
app.use(express.json())
app.post("/api/user/register", domainValidator, userRegistration)
app.post("/api/user/login", Limiter(), userLogin)
app.get("/api/user/verify/:token", userVerification)

app.listen(process.env.PORT,()=>{
    console.log(`running at port: ${process.env.PORT}`)
})