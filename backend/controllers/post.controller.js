import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";

const createPost = async (req, res, next) => {
  const { text } = req.body;
  let { img } = req.body;
  const userId = req.user._id;
  if (!text || !userId) {
    return res.status(400).json({ message: "Please enter text" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    let imageUrl = "";
    if (img) {
      const updateResponse = await cloudinary.uploader.upload(img);
      imageUrl = updateResponse.secure_url;
    }
    const createPost = await Post.create({ text, img: imageUrl, user: userId });
    return res.status(200).json(createPost);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deletePost = async (req, res, next) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "You can't delete this post" });
    }
    if (post.img) {
      const imgDelete = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgDelete);
    }

    await Post.findByIdAndDelete(id);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const commentOnPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Please enter text" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.comments.push({ text, user: userId });
    await post.save();
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const likeUnlikePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const isLiked = post.likes.includes(userId);
    //dont like our post
    //     if (post.user.toString() === userId.toString()) {
    //   return res.status(400).json({ message: "You cannot like your own post" });
    // }
    if (isLiked) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      return res.status(200).json({ message: "Post unliked" });
    } else {
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 }).populate({
        path: "user",
        select: "-password",
    }).populate({
        path: "comments.user",
        select: "-password",
    });
    if(posts.length === 0){
      return res.status(200).json({message: "No posts found"});
    }
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const getLikedPost = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({likes: userId})
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json({ message: "No posts found" });
    }

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getFollowingPost = async (req, res, next) => {
  try {
    // Authentication စစ်ဆေးခြင်း
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Following ရှိမရှိ စစ်ဆေးခြင်း
    if (!user.following || !Array.isArray(user.following) || user.following.length === 0) {
      return res.status(200).json({ message: "You are not following anyone" });
    }

    // Following ထဲက user တွေရဲ့ posts ရှာဖွေခြင်း
    const posts = await Post.find({ user: { $in: user.following.toString() } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    if (!posts.length) {
      return res.status(200).json({ message: "No posts found" });
    }

    return res.status(200).json(posts);

  } catch (err) {
    console.error("Error in getFollowingPost:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserPost = async(req,res,next) => {
    try{
        const {username} = req.params;
        const user = await User.find({username})
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        });
        if(!posts.length){
            return res.status(200).json({message: "No posts found"});
        }
        return res.status(200).json(posts);
        
    }catch(err){
        return res.status(500).json({message: err.message});
    }
}




export { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts ,getLikedPost ,getFollowingPost ,getUserPost };
