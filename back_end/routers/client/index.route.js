const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const postRoute = require("./post.route");
const commentRoute = require("./comment.route");
const friendRequestRoute = require("./friendRequest.route");
const notificationRoute = require("./notifications.route")

module.exports = (app)=>{
    app.use("/auth",authRoute);
    app.use("/posts",postRoute);
    app.use("/comments",commentRoute);
    app.use("/friends",friendRequestRoute);
    app.use("/users",userRoute);
    app.use("/notifications",notificationRoute);

}