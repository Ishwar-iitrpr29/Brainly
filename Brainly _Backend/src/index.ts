import express from "express";
import jwt from "jsonwebtoken";
import {dbConnect,UserModel,ContentModel,LinkModel} from "./db.js"
import { JWT_SECRET } from "./config.js";
import {userMiddleware} from "./middleware.js";
import z from "zod";
import bcrypt from "bcrypt";
import {random} from "./utils.js";

const app = express();

app.use(express.json());

// // @ts-ignore
// function random(length) {
//     const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//         result += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return result;
// }

app.post("/api/v1/signup",async (req,res) =>{
    const requiredBody = z.object({
        username  : z.string().min(3).max(10),
        password : z.string().min(4).max(10)//.regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[!@#$%^&*(),.?":{}|<>]/)
    })

    const peseddatawithsuccess = requiredBody.safeParse(req.body);
    if (!peseddatawithsuccess.success){
        res.json({
            message : "incorrect format try again!",
            error : peseddatawithsuccess.error
        })
        return 
    }

    const username = req.body.username;
    const password = req.body.password;
    console.log("Signup request received");
    try {
        const hashedPassword = await bcrypt.hash (password,5);
        const user = await UserModel.create({username,password : hashedPassword});
        console.log("User created:", user);
        res.json({ message: "User created" });
    }
    catch (e){
        // @ts-ignore
        console.error("Error creating user:", e.message);
        res.status(409).json({ message: "User already exists" });

    }

})

app.post("/api/v1/signin",async (req,res) =>{
    try {
    const username = req.body.username;
    const password = req.body.password;

    const existingUser = await UserModel.findOne({username : username});

    if (!existingUser || !existingUser.password) {
        res.status(401).json({ message: "User not found" });
    }
    else {
        const passwordMatch = await bcrypt.compare(password,existingUser.password);

        if (!passwordMatch) {
                    res.status(401).json({ message: "Invalid password" });
        }
        else{
            const token = jwt.sign({ id: existingUser._id, username: existingUser.username },JWT_SECRET,{ expiresIn: '1h' } ); // optional expiry time);
            res.status(200).json({message: "Login successful",token: token,user: existingUser,});
        }
    }   
    }catch(e){
            console.error("Error during signin:", e);
            res.status(500).json({ message: "Server error" });
    }
})
// @ts-ignore
app.post("/api/v1/content",userMiddleware,async (req,res) =>{
    const {link,type,title} = req.body;
    const content = await ContentModel.create({
        link,
        type,
        title,
        // @ts-ignore
        userId : req.userId,
        tags: []
    })
    // @ts-ignore
    res.json({ message: "Content added" ,userId : req.userId,contentcreted : content}); 

    
})

// @ts-ignore
app.get("/api/v1/content",userMiddleware,async (req,res) =>{
    // @ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({userId: userId}).populate("userId","username");
    res.json(content);
    
})

// @ts-ignore
app.delete("/api/v1/content",userMiddleware,async (req,res) =>{
    const contentId = req.body;
    // @ts-ignore

    await ContentModel.deleteMany({contentId,userId: req.userId});
    res.json({ message: "Deleted" });
})

// @ts-ignore
app.post("/api/v1/brain/share",userMiddleware,async (req,res) =>{
        const {share} = req.body;
        if (share){
            // @ts-ignore
            const existingLink = await LinkModel.findOne({userId : req.userId});
            if (existingLink){
                res.json({hash : existingLink.hash});
                return;
            }
            // @ts-ignore
            const hash = random(10);
            // @ts-ignore
            await LinkModel.create({userId : req.userId,hash});
            res.json({
                message: "updated to sharable link " ,hash});
        }
        else{
            // @ts-ignore
                await LinkModel.deleteOne({ userId: req.userId });
                res.json({ message: "Removed link" }); // Send success response.
        }

    
})

app.get("/api/v1/brain/share/:shareLink",async (req,res) =>{
        const hash = req.params.shareLink;

    // Find the link using the provided hash.
    const link = await LinkModel.findOne({ hash });
    if (!link) {
        res.status(404).json({ message: "Invalid share link" }); // Send error if not found.
        return;
    }

    // Fetch content and user details for the shareable link.
    const content = await ContentModel.find({ userId: link.userId });
    const user = await UserModel.findOne({ _id: link.userId });

    if (!user) {
        res.status(404).json({ message: "User not found" }); // Handle missing user case.
        return;
    }

    res.json({
        username: user.username,
        content
    }); 

    
})



app.listen(5001, async () => {
    try {
      await dbConnect;
      console.log("Connected to DB");
    } catch (error) {
      console.log("Unable to connect to DB");
      console.log(error);
    }
    console.log(`Listening at port ${5001}`);
  });
