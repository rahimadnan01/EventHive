import Router from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addEvent,
  deleteAllEvents,
  deleteSingleEvent,
  getAllEvents,
  getSingleEvent,
} from "../controllers/Event.controller.js";
import { upload } from "../middlewares/multer.middelware.js";
const router = Router();
router.route("/events/create").post(
  verifyJwt("user" || "admin"),
  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
  ]),
  addEvent
);
router
  .route("/events/:eventId")
  .get(getSingleEvent)
  .delete(verifyJwt(), deleteSingleEvent);
router
  .route("/events")
  .get(getAllEvents)
  .delete(verifyJwt("admin"), deleteAllEvents);
export default router;
