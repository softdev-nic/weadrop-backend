const isVerified = (req, res, next) => {
    const user = req.user;
    try {
    if (!user.isverified) {
        return res.status(403).json({ message: 'Account not verified' });
    }
    next();
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
}   
}
module.exports = isVerified;


