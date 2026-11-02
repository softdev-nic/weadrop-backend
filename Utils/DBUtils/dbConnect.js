const mongoose =  require("mongoose")
require("dotenv").config
const DBConnect = ()=>{
    try{
        mongoose.connect(process.env.MONGODB_URI)
        console.log("DB connected successfully")
    }catch(error)
    {
        console.log({error})
    }
}

module.exports = DBConnect