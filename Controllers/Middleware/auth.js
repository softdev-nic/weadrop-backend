

const auth = (req,res,next)=>{
    try{
        const token = req.headers['auth-token'];
        if(!token){
            return res.status(401).json({ message: 'Access denied' });

        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = auth;