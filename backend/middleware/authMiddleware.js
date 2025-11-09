import jwt from 'jsonwebtoken';
import User from '../models/users.js';

export const protectRoute = async (req, res, next) => {
   try {
    const token= req.cookies.jwt;
    if(!token){
        return res.status(401).json({message: 'Not Authorized, No Token'});
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({message: 'JWT_SECRET not configured'});
    }

    const decoded= jwt.verify(token, process.env.JWT_SECRET);
    if(!decoded){
        return res.status(401).json({message: 'Not Authorized, Invalid Token'});
    }

    const user= await User.findById(decoded.userId).select('-password');

    if(!user){
        return res.status(404).json({message: 'Not Authorized, User Not Found'});
    }

    req.user = user;
    next();

   } catch (error) {
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({message: 'Not Authorized, Invalid Token'});
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({message: 'Not Authorized, Token Expired'});
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({message:`Error Occurred: ${error.message}`})
   } 
}

