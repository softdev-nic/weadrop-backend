 const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
name:{
type: String,
required:true
},
email:{
type: String,
required:true,
unique:true
},
mobileNumber:{
type:String,
required:true
},
password:{
type: String,
required:true
},
profileImage:{
type: String
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
},
verificationToken:{
type:String,
default:null
},
verificationTokenExpiry:{
type:Date,
default:null
},
limitExceeded:{
type:Boolean,
default:false   
  
},
attempts:{
type:Number,
default:0
}
}
)

const User = mongoose.model("User", UserSchema)

module.exports = User