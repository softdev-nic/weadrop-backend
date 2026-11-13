const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const Organization = require("../Models/Organization")
require("dotenv").config()
const ORGLogin = async(req,res)=>{
    try{

        const {email,password} = req.body
        
        
    const organization = await Organization.findOne({email})

    if(!organization){
        return res.status(403).json({error:"organization not found. Please create one."})
    }
    const isMatch = await bcrypt.compare(password,organization.password)

    if(!isMatch){
        return res.status(403).json({error:"Credentials does not match please try again."})
    }
    const payload = {id:organization._id, adminId: organization.admin}
    const token = jwt.sign(payload, process.env.ORG_SECRET,{expiresIn:"30d"})
    
    
    res.send({access_token:token})
}catch(error){
    res.status(500).json({error:error.message})
}

}


module.exports = ORGLogin