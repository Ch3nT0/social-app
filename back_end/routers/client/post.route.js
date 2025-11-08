const router = require('express').Router();
const controller = require('../../controllers/client/post.controller');
const {verifyToken} = require('../../middlewares/auth.middleware'); 

router.post("/", verifyToken, controller.createPost); 
router.put("/:id", verifyToken, controller.updatePost); 
router.delete("/:id", verifyToken, controller.deletePost);
router.put("/:id/like", verifyToken, controller.likePost); 
router.get("/:id", controller.getPost); 
router.get("/timeline/:userId", controller.getTimelinePosts); 
router.get("/user/:userId", controller.getUserPosts); 

module.exports = router;