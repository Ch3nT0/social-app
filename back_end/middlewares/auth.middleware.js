const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; 
    
    if (!authHeader) {
        return res.status(401).json("Bạn chưa được xác thực (Thiếu token).");
    }

    const token = authHeader.split(" ")[1]; 

    jwt.verify(token, process.env.JWT_SECRET || "social_app_secret_key", (err, user) => {
        if (err) {
            return res.status(403).json("Token không hợp lệ hoặc đã hết hạn.");
        }
        req.user = user; 
        next(); 
    });
};

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json("Bạn không có quyền quản trị (Admin).");
        }
    });
};

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.userId || req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json("Bạn không được phép thực hiện hành động này.");
        }
    });
};

const optionalVerifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        req.user = null;
        return next(); 
    }
    const token = authHeader.split(" ")[1]; 
    jwt.verify(token, process.env.JWT_SECRET , (err, user) => {
        if (err) {
            req.user = null;
            return next();
        }
        req.user = user; 
        next(); 
    });
};

module.exports = {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndAuthorization,
    optionalVerifyToken,
};