import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary"

const getUserProfile = async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const followUnfollowUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    if (!currentUser || !userToModify) {
      return res.status(404).json({ message: "User not found" });
    }
    const isFollowing = currentUser.following.includes(id.toString());
    if (isFollowing) {
      //unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      return res.status(200).json({ message: "Unfollow successful" });
    } else {
      //follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      const notification = new Notification({
        from: req.user._id,
        to: userToModify._id,
        type: "follow",
      });
      await notification.save();
      return res.status(200).json({ message: "Follow successful" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const getSuggestedUsers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userFollowByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      { $match: { _id: { $ne: userId }} }, // stage 1: filter
      { $sample: { size: 10 } }, // stage 2: random 10 users
    ]);
    const filteredUsers = users.filter(user => !userFollowByMe.following.includes(user._id.toString()));
    const suggestedUser = filteredUsers.slice(0,4)
    suggestedUser.forEach(user => {
        user.password = null
    })

    return res.status(200).json(suggestedUser);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res, next) => {
    const {username,fullname,email,bio,links,currentPassword,newPassword} = req.body;
    let{ profileImg,coverImg} = req.body;
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if(!currentPassword && newPassword || newPassword && !currentPassword){
            return res.status(400).json({message:"Please enter current password and new password"});
        }
        if(currentPassword && newPassword){
            const checkPassword = await bcrypt.compare(currentPassword,user.password);
            if(!checkPassword){
                return res.status(400).json({message:"Invalid current password"});
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword,salt);
            user.password = hashedPassword;
        }
        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadResponse.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadResponse.secure_url;
        }
        user.username = username || user.username;
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.links = links || user.links;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        const userData = await user.save();
        user.password = null
        return res.status(200).json({message:"Update successful",data: userData});
        
        
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
export { getUserProfile, followUnfollowUser, getSuggestedUsers ,updateUser };
