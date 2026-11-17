const user = require("../Models/User")
const getData = require("../Utils/getdata")
require("dotenv").config()



 

        
module.exports =   getData({reqKey:"user", Model:user, exclude: process.env.USER_EXCLUDES})