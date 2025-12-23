import Agenda from "agenda";
import dotenv from "dotenv";

dotenv.config();

const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URL,
    collection: "agendaJobs",
  },
  processEvery: "1 minute",
  maxConcurrency: 5,
  defaultConcurrency: 5,
});

// listen for agenda events
agenda.on("ready", () => console.log("Agenda connected to MongoDB"));
agenda.on("error", (err) => console.error("Agenda connection error:", err));

export default agenda;
