import User from '../models/user.model.js';
const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const allowedRoles = ['admin']; 

    if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Permission denied' });
    }
    next();
};
export default isAdmin;