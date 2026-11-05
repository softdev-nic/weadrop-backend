const user = require("../Models/User")
const bcrypt = require('bcryptjs');


const verification = async (req,res)=>{
    try{
        const {token} = req.params
        const user = await User.findOne({verificationToken:token}) 
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        user.isEmailVerified = true
        user.emailVerificationToken = undefined
        await user.save()
        return res.status(200).json({message:"Email verified successfully"})    
    }catch(error){
        return res.status(500).json({error:"internal server error", error: error.message})
    }
}

    module.exports = verification