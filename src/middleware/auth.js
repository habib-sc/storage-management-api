import httpStatus from "http-status";
import { verifyToken } from "../utils/jwt.js";
import User from "../modules/user/user.model.js";

const auth = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      // get token from header
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: "You are not authorized",
        });
      }

      // verify token
      let decoded;
      try {
        decoded = verifyToken(token);
      } catch (err) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: "Invalid token",
        });
      }

      const { id, role } = decoded;

      // check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
          success: false,
          message: "User not found",
        });
      }

      // check role
      if (requiredRoles.length && !requiredRoles.includes(role)) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: "You don't have permission to access this resource",
        });
      }

      // set user to req
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
