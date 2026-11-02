const express = require("express")
const cors = require("cors")
const userRegistration = require("./Controllers/userRegistration")    

const DBConnect = require("./Utils/DBUtils/dbConnect")
const app = express()
require("dotenv").config()


DBConnect()
app.use(cors())
app.use(express.json())
app.post("/api/user/register", userRegistration)

app.listen(process.env.PORT,()=>{
    console.log(`running at port: ${process.env.PORT}`)
})