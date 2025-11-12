const router = require('express').Router();
const controller = require('../../controllers/client/notification.controller');
const {verifyToken} = require('../../middlewares/auth.middleware'); 

router.get("/", verifyToken, controller.getNotifications); 
router.put("/", verifyToken, controller.markAsRead); 

module.exports = router;