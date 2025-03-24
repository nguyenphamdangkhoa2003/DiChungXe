import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(400).json({
      success: false,
      message: "Unauthorized - no token provided",
    });
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decode.id;
    next();
  } catch (error) {
    return res.status(400).json({
      message: "Unauthorized - invalid token",
      success: false,
    });
  }
};
