const mongoose = require('mongoose')

const OrganizationSchema = new mongoose.Schema({
companyName:{
type: String,
required:true
},
organiationType:{
 type:String,
 enum:["Vendor","Buyer", "Delivery Partner"]
},
admin:{
type: mongoose.Schema.ObjectId,
default:null,
required:true
},
email:{
type: String,
required:true,
unique:true
},
password:{
type: String,
required:true
},
profileImage:{
type: String
},
gstNumber:{
  type:String,
  unique:true,
  required:true
},
addressLine1:{
type: String,
required: true
},
addressLine2:{
type:String
},
 city:{
type:String,
required:true
},
 state:{
type:String,
required:true
},
postalCode:{
type:String,
required: true
},
isVerified:{
type:Boolean,
default:false
},
 
isBanned:{
type:Boolean,
default:false
}

}
)

module.exports = mongoose.model("Organiation", OrganizationSchema)

 
 
 

