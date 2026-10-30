const express = require("express")
const cors = require("cors")

// const DBConnect = require("")
const app = express()
require("dotenv").config()



app.listen(process.env.PORT,()=>{
    console.log(`running at port: ${process.env.PORT}`)
})