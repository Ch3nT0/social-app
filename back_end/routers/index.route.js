const userRoute = require("./user.route");

module.exports = (app)=>{
    app.use("/users",userRoute);

}