

import express, { NextFunction } from "express";

import {JWT_SECRET} from "./config.js";

import jwt from "jsonwebtoken";

export const userMiddleware = async (req :Request,res :Response,next :NextFunction)=>{
    // @ts-ignore
    const header = req.headers["authorization"];
    if (!header) {
        // @ts-ignore
        return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(header as string , JWT_SECRET);


    if (decoded){
        // @ts-ignore
        req.userId = decoded.id;
        next();
    }
    else{
        // @ts-ignore
        res.status(401).json({ message: "Unauthorized User" });
    }




}





