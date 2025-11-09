import mongoose from "mongoose"

export const connectDB= async ()=>{
    try{
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL environment variable is not defined");
        }
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected DB successfully`);

    }catch(error){
        console.error("MongoDB connection error: ",error);
        process.exit(1);
    }
}