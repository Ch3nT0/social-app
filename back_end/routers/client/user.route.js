const express = require('express');
const router = express.Router();
const controller = require("../../controllers/client/user.controller");
const { optionalVerifyToken, verifyToken } = require('../../middlewares/auth.middleware');

router.get('/suggestions',verifyToken, controller.getSuggestedUsers);
router.get('/friends/:userId',verifyToken, controller.getFriends);
router.get('/search', optionalVerifyToken,controller.searchUsers);
router.get('/:id', controller.getUser);
router.put('/:id',verifyToken, controller.updateUser);
router.delete('/:id',verifyToken, controller.deleteUser);
router.put('/:id/follow',verifyToken, controller.followUser);
router.put('/:id/unfollow',verifyToken, controller.unfollowUser);


module.exports = router;