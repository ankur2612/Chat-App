import { generateToken } from '../lib/utils.js';
import User from '../models/users.js'
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';

export const signup= async (req,res)=>{
    try {
        const {fullname,email,password}= req.body
        if(!fullname || !email || !password){
            return res.status(400).json({message:`All Fields are Required`})
        }
        if(password.length<6){
            return res.status(400).json({message:`Password Should be greater than 6 characters`})
        }
        const user= await User.findOne({email});
        if(user){
            return res.status(400).json({message:`User Already Exists`})
        }

        const salt= await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password,salt);

        const newUser=  new User({
            fullname, 
            email,
            password: hashedPassword
        });
        if(newUser) {
            await newUser.save();
            const token = generateToken(newUser._id, res);

            return res.status(201).json({
                _id: newUser._id,  
                fullname: newUser.fullname,
                email: newUser.email,
                token: token
            }); 
        }else {
            return res.status(500).json({message:`User Not Created`})
        }
    } catch (error) {
        res.status(500).json({message:`Error Occurred: ${error.message}`})
    }
}

export const login = async (req,res)=>{
    try {
        const {email,password}= req.body
        if(!email || !password){
            return res.status(400).json({message:`All Fields are Required`})
        }
        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({message:`User Not Found`})
        }

        const isPasswordValid= await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({message:`Invalid Credentials`})
        }

        const token = generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,  
            token: token
        });
    } catch (error) {
        res.status(500).json({message:`Error Occurred: ${error.message}`})
    }
}

export const logout= async (req,res)=>{
    try {
        res.cookie('jwt', '', {
            maxAge: 0,
        })
        res.status(200).json({message: 'User Logged Out Successfully'});
    } catch (error) {
        res.status(500).json({message:`Error Occurred: ${error.message}`})
    }
}

export const updateProfile= async (req,res)=>{
    try {
        const {profilePic}= req.body
        const userId=req.user._id
        if(!profilePic){
            return res.status(400).json({message:`Profile Picture is Required`})
        }
        
        let uploadResponse;
        try {
            uploadResponse= await cloudinary.uploader.upload(profilePic)
        } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            return res.status(500).json({message:`Failed to upload image`})
        }
        
        const updatedUser= await User.findByIdAndUpdate(userId, {
            profilePic: uploadResponse.secure_url
        }, {new: true});
        
        if (!updatedUser) {
            return res.status(404).json({message:`User not found`})
        }
        
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({message:`Error Occurred: ${error.message}`})
    }
}

export const checkAuth= (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({message:`Error Occurred: ${error.message}`})
    }
}
