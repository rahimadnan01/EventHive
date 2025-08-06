import { AppError } from "../utils/AppError.js";
export const notFoundHandler = (req, res, next) => {
  next(new AppError(404, `Not Found ${req.originalUrl}`));
};
