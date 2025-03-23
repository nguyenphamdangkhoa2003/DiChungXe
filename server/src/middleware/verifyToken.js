import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(400).json({
            success: false,
            message: 'Unauthorized - no token provided',
        });
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode)
            return res.status(400).json({
                message: 'Unauthorized - invalid token',
                success: false,
            });
        req.userId = decode.userId;
        next();
    } catch (error) {
        console.log('error in verifyToken ', error);
        return res
            .status(500)
            .json({ success: false, message: 'Server error' });
    }
};
