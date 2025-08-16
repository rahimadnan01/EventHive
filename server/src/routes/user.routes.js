import Router from "express";
import { upload } from "../middlewares/multer.middelware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  deleteAllUsers,
  deleteSingleUser,
  getAllUsers,
  getSingleUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from "../controllers/User.controller.js";
const router = Router();
router
  .route("/user")
  .get(verifyJwt("admin"), getAllUsers)
  .delete(verifyJwt("admin"), deleteAllUsers);
router
  .route("/user/:userId")
  .get(getSingleUser)
  .delete(verifyJwt("admin"), deleteSingleUser)
  .put(
    upload.fields([
      {
        name: "profilePic",
        maxCount: 1,
      },
    ]),
    updateUser
  );
router.route("/user/register").post(registerUser);
router.route("/user/login").post(loginUser);
router.route("/user/logout").post(logoutUser);
export default router;
