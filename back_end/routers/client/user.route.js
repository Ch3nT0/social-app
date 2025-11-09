const express = require('express');
const router = express.Router();
const controller = require("../../controllers/client/user.controller");
const { optionalVerifyToken } = require('../../middlewares/auth.middleware');

router.get('/search', optionalVerifyToken,controller.searchUsers);
router.get('/:id', controller.getUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);
router.put('/:id/follow', controller.followUser);
router.put('/:id/unfollow', controller.unfollowUser);
router.get('/:id/friends/:userId', controller.getFriends);


module.exports = router;