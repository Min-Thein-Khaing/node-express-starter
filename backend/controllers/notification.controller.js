import Notification from "../models/notification.model.js";
const getNotification = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: userId }, { read: true });
    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteNotification = async (req, res, next) => {
    try{
        const userId= req.user._id;
        await Notification.deleteMany({to: userId});
        return res.status(200).json({message: "Notifications deleted"});

    }catch(err){
        return res.status(500).json({message: err.message});
    }
};
const deleteNotificationOne = async (req,res,next) => {
try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    const notification = await Notification.findById(notificationId);
    if (notification.to.toString() !== userId.toString()) {
      return res.status(401).json({ message: "You can't delete this notification" });
    }
    if(notificationId.to)
    await Notification.findByIdAndDelete(notificationId);
    return res.status(200).json({ message: "Notification deleted successfully" });
    
} catch (err) {
    return res.status(500).json({ message: err.message });
}
}


export { getNotification, deleteNotification ,deleteNotificationOne};
