"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("./db.js");
const config_js_1 = require("./config.js");
const middleware_js_1 = require("./middleware.js");
const zod_1 = __importDefault(require("zod"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// @ts-ignore
function random(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredBody = zod_1.default.object({
        username: zod_1.default.string().min(3).max(10),
        password: zod_1.default.string().min(4).max(10) //.regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[!@#$%^&*(),.?":{}|<>]/)
    });
    const peseddatawithsuccess = requiredBody.safeParse(req.body);
    if (!peseddatawithsuccess.success) {
        res.json({
            message: "incorrect format try again!",
            error: peseddatawithsuccess.error
        });
        return;
    }
    const username = req.body.username;
    const password = req.body.password;
    console.log("Signup request received");
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 5);
        const user = yield db_js_1.UserModel.create({ username, password: hashedPassword });
        console.log("User created:", user);
        res.json({ message: "User created" });
    }
    catch (e) {
        // @ts-ignore
        console.error("Error creating user:", e.message);
        res.status(409).json({ message: "User already exists" });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const existingUser = yield db_js_1.UserModel.findOne({ username: username });
        if (!existingUser || !existingUser.password) {
            res.status(401).json({ message: "User not found" });
        }
        else {
            const passwordMatch = yield bcrypt_1.default.compare(password, existingUser.password);
            if (!passwordMatch) {
                res.status(401).json({ message: "Invalid password" });
            }
            else {
                const token = jsonwebtoken_1.default.sign({ id: existingUser._id, username: existingUser.username }, config_js_1.JWT_SECRET, { expiresIn: '1h' }); // optional expiry time);
                res.status(200).json({ message: "Login successful", token: token, user: existingUser, });
            }
        }
    }
    catch (e) {
        console.error("Error during signin:", e);
        res.status(500).json({ message: "Server error" });
    }
}));
// @ts-ignore
app.post("/api/v1/content", middleware_js_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type, title } = req.body;
    const content = yield db_js_1.ContentModel.create({
        link,
        type,
        title,
        // @ts-ignore
        userId: req.userId,
        tags: []
    });
    // @ts-ignore
    res.json({ message: "Content added", userId: req.userId, contentcreted: content });
}));
// @ts-ignore
app.get("/api/v1/content", middleware_js_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const content = yield db_js_1.ContentModel.find({ userId: userId }).populate("userId", "username");
    res.json(content);
}));
// @ts-ignore
app.delete("/api/v1/content", middleware_js_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body;
    // @ts-ignore
    yield db_js_1.ContentModel.deleteMany({ contentId, userId: req.userId });
    res.json({ message: "Deleted" });
}));
// @ts-ignore
app.post("/api/v1/brain/share", middleware_js_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    if (share) {
        // @ts-ignore
        const existingLink = yield db_js_1.LinkModel.findOne({ userId: req.userId });
        if (existingLink) {
            res.json({ hash: existingLink.hash });
            return;
        }
        // @ts-ignore
        const hash = random(10);
        // @ts-ignore
        yield db_js_1.LinkModel.create({ userId: req.userId, hash });
        res.json({ hash });
    }
    else {
        // @ts-ignore
        yield db_js_1.LinkModel.deleteOne({ userId: req.userId });
        res.json({ message: "Removed link" }); // Send success response.
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    // Find the link using the provided hash.
    const link = yield db_js_1.LinkModel.findOne({ hash });
    if (!link) {
        res.status(404).json({ message: "Invalid share link" }); // Send error if not found.
        return;
    }
    // Fetch content and user details for the shareable link.
    const content = yield db_js_1.ContentModel.find({ userId: link.userId });
    const user = yield db_js_1.UserModel.findOne({ _id: link.userId });
    if (!user) {
        res.status(404).json({ message: "User not found" }); // Handle missing user case.
        return;
    }
    res.json({
        username: user.username,
        content
    });
}));
app.listen(5001, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_js_1.dbConnect;
        console.log("Connected to DB");
    }
    catch (error) {
        console.log("Unable to connect to DB");
        console.log(error);
    }
    console.log(`Listening at port ${5001}`);
}));
