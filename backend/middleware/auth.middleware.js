import User from "../models/user.model.js";
import jwt from "jsonwebtoken";


export const authMiddleware = async(req,res,next) => {
    try {
        const token = req.cookie.jwt;
        if(!token){
            return res.status(401).json({message:"Unauthorized"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}