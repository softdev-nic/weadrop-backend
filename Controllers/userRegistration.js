const User = require("../Models/User")
const bcrypt = require('bcryptjs')
const UserRegister = async(req,res)=>{
    try{
        const {
  name,
  email,
  mobileNumber,
  password,
  profileImage,
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
} = req.body;
        ``
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({error:"User already exists"})
        }
        const hashed = await bcrypt.hash(password,10)
        const newUser = new User({
            name,email,password:hashed,addressLine1,mobileNumber,addressLine2,city,profileImage,state,postalCode

        })
        await newUser.save()
        return res.status(200).json({message:"User registered successfully"})
    }catch(error){
        return res.status(500).json({error:"internal server error", error: error.message})
    }
}

module.exports = UserRegister
