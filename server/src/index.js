import {connectDB} from "./config/db.js";
import { app } from "./app.js";
const port = process.env.PORT || 8000;
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`app is listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(`Failed to listen ${error.message}`);
  });
