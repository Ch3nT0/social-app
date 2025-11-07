const router = require('express').Router();
const controller = require('../../controllers/client/comment.controller');
const {verifyToken} = require('../../middlewares/auth.middleware'); 


router.post("/", verifyToken, controller.createComment); 
router.delete("/:id", verifyToken, controller.deleteComment);
router.get("/:postId", controller.getCommentsByPost); 

module.exports = router;