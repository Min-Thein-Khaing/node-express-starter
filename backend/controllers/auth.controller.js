import { generateTokenAndSetCookie } from "../lib/util/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const signUp = async (req, res, next) => {
  const { username, fullname, email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      fullname,
      email,
      password: hashedPassword,
    });
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (user) {
      generateTokenAndSetCookie(newUser._id, res);
    }

    return res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      fullname: newUser.fullname,
      email: newUser.email,
      followers: newUser.followers,
      following: newUser.following,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
      bio: newUser.bio,
      links: newUser.links,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    generateTokenAndSetCookie(user._id, res);
    return res.status(200).json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
      links: user.links,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const logout = (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const getUser = async(req,res,next) => {
  try {
    // const user = await User.findById(req.params.id);//other user ko lo chin yin
    const user = await User.findById(req.user._id);//current user ko lo chin yin
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    return res.status(200).json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
      links: user.links,
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
const getUserAll = async(req,res,next) => {
  try {
    const user = await User.find({});//current user ko lo chin yin
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    return res.status(200).json(user);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export { signUp, login, logout,getUser ,getUserAll };
