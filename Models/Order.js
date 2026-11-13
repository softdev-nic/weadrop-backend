const mongoose = require("mongoose")


const  OrderSchema = new mongoose.Schema({
    ItemName:{
        type:String,
        required:true
    },
    Quantity:{
        type: Number,
        required: true,
        default: 0
    }
})