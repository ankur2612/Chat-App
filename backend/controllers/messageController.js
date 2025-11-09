import cloudinary from '../lib/cloudinary.js';
import Message from '../models/messages.js'
import User from '../models/users.js';
import { getReceiverSocketId } from '../lib/socket.js';
import { io } from '../lib/socket.js';
export const getUsersForSidebar= async (req,res)=>{
    try {
        const loggedInUserId= req.user._id;
        const filteredUsers= await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
        res.status(200).json(filteredUsers);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMessages= async (req,res)=>{
    try {
        const {id: userToChatId}= req.params;
        const myId= req.user._id;
        
        // Validate userToChatId is a valid ObjectId
        if (!userToChatId || userToChatId === 'undefined') {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        
        // Validate the other user exists
        const otherUser = await User.findById(userToChatId);
        if (!otherUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const messages= await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendMessage= async (req,res)=>{
    try {
        const {text, image}= req.body
        const {id: receiverId}= req.params;
        const senderId= req.user._id;
        
        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found" });
        }
        
        let imageUrl;
        if(image){
            try {
                const uploadResponse= await cloudinary.uploader.upload(image);
                imageUrl= uploadResponse.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: "Failed to upload image" });
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        await newMessage.save();

        // Emit the message to the receiver using socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.status(201).json(newMessage);

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: "Internal Server Error" });   
    }
}