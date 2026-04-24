const express=require("express");
const router=express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
} = require("../controllers/userController");

const authMiddleware=require("../middleware/authMiddleware");
const upload=require("../middleware/uploadMiddleware")

router.post("/register",registerUser)
router.post("/login", loginUser);
router.get("/profile",authMiddleware,getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.put("/change-password",authMiddleware,changePassword)
router.post("/upload-avatar",authMiddleware,upload.single("avatar"),uploadAvatar)
module.exports=router;

