"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkModel = exports.ContentModel = exports.UserModel = exports.dbConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
exports.dbConnect = mongoose_1.default.connect("mongodb+srv://Ishhwarr:Ishwar_123@cluster0.33fxw.mongodb.net/Brainly");
const UserSchema = new mongoose_2.Schema({
    username: { type: String, unique: true },
    password: String,
});
exports.UserModel = (0, mongoose_2.model)("User", UserSchema);
const ContentSchema = new mongoose_2.Schema({
    title: String,
    Link: String,
    tags: [{ type: mongoose_1.default.Types.ObjectId, ref: "tag" }],
    userId: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: "User",
            require: true
        }]
});
exports.ContentModel = (0, mongoose_2.model)("Content", ContentSchema);
const LinkSchema = new mongoose_2.Schema({
    hash: String,
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'User', required: true, unique: true }
});
exports.LinkModel = (0, mongoose_2.model)("Links", LinkSchema);
