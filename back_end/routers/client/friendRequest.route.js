const router = require('express').Router();
const controller = require('../../controllers/client/friendRequest.controller');
const {verifyToken} = require('../../middlewares/auth.middleware'); 

router.post("/add/:receiverId", verifyToken, controller.sendFriendRequest); 
router.put("/accept/:requestId", verifyToken, controller.acceptFriendRequest); 
router.put("/reject/:requestId", verifyToken, controller.rejectFriendRequest);
router.delete("/cancel/:requestId", verifyToken, controller.cancelFriendRequest);
router.get("/requests/:userId", verifyToken, controller.getPendingRequests); 

module.exports = router;