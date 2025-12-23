import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${port}`
  );
});
