import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import agenda from "./config/agenda.js";
import defineEmailJob from "./jobs/emailJob.js";

dotenv.config();

const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Initialize Agenda
defineEmailJob();
(async function () {
  await agenda.start();
  console.log("Agenda jobs started");
})();

app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${port}`
  );
});
