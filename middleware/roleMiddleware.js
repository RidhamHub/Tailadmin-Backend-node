const roleMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ msg: "Access denied. Only admin can perform this action." });
    }

    next();
};

module.exports = roleMiddleware;
