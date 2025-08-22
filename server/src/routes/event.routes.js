import Router from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addEvent,
  bookEvent,
  deleteAllEvents,
  deleteSingleEvent,
  getAllEvents,
  getEventWithParticipants,
  getSingleEvent,
  updateEvent,
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
  .post(verifyJwt(), bookEvent)
  .put(
    verifyJwt(),
    upload.fields([
      {
        name: "photo",
        maxCount: 1,
      },
    ]),
    updateEvent
  )
  .get(getSingleEvent)
  .delete(verifyJwt(), deleteSingleEvent);
router
  .route("/events")
  .get(getAllEvents)
  .delete(verifyJwt("admin"), deleteAllEvents);

router
  .route("/events/:eventId/participants")
  .get(verifyJwt(), getEventWithParticipants);
export default router;
