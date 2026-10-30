const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
name:{
type: String,
required:true
},
email:{
type: String,
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
}

}
)

const User = mongoose.Model("User",UserSchema)

module.exports = User
 
 

