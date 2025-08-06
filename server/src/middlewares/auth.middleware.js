import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { wrapAsync } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";

const verifyJwt = (role) =>
  wrapAsync(async (req, res, next) => {
    try {
      const tokens =
        req.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer", "");
      if (!tokens) {
        return next(new ApiError(401, "User is unauthorized"));
      }
      const decodedToken = jwt.verify(tokens, process.env.ACCESS_TOKEN_KEY);
      if (!decodedToken._id) {
        return next(
          new ApiError(500, "Something went wrong while Decoding the tokens")
        );
      }

      const user = await User.findById(decodedToken._id).select(" -password");
      if (!user) {
        return next(new ApiError(500, "Failed to find the User"));
      }
      if (role && user.role !== role) {
        return next(new ApiError(403, `Access Denied to the ${role}`));
      }

      req.user = user;
      next();
    } catch (error) {
      // Handle JWT expiration and missing token as 401
      if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError" ||
        error.message === "User is unauthorized"
      ) {
        return next(new ApiError(401, "User is unauthorized or token expired"));
      }
      // Other errors
      return next(new ApiError(500, error.message || "Authentication failed"));
    }
  });

export { verifyJwt };
