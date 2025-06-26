import mongoose from "mongoose";
import {model, Schema} from "mongoose";
require('dotenv').config();
//@ts-ignore
exports.dbConnect = mongoose.default.connect(process.env.MONGODB_URI);
// ...existing code...

const UserSchema = new Schema({
    username : {type : String , unique : true},
    password : String,

})

export const UserModel = model("User",UserSchema);

const ContentSchema = new Schema({
    title : String,
    Link : String,
    tags : [{type : mongoose.Types.ObjectId,ref: "tag"}],
    userId: [{
        type : mongoose.Types.ObjectId,
        ref : "User",
        require : true
    }]
})

export const ContentModel = model("Content",ContentSchema);

const LinkSchema = new Schema({
    hash : String ,
    userId : {type : mongoose.Types.ObjectId,ref : 'User',required : true , unique : true}
})

export const LinkModel = model("Links",LinkSchema);