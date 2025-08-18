import Router from "express";
import {
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../controllers/Admin.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/admin/register").post(verifyJwt("admin"), registerAdmin);
router.route("/admin/login").post(loginAdmin);
router.route("/admin/logout").post(logoutAdmin);
export default router;
