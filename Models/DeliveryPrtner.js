const mongoose = require('mongoose')

const DPSchema = new mongoose.Schema({

dpId:{
    type:mongoose.Schema.ObjectId,
    requied:true
},
organizationId:{
     type:mongoose.Schema.ObjectId,
     default:null
},
profileImage:{
type: String,
required: true
},
licenseNumber:{
    type:String,
    required:true
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


module.exports = mongoose.Model("DeliveryPartner",DPSchema)

 
 

