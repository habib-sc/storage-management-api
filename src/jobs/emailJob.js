import agenda from "../config/agenda.js";
import sendEmail from "../utils/sendEmail.js";

const defineEmailJob = () => {
  agenda.define(
    "send-email",
    { priority: "high", concurrency: 10 },
    async (job) => {
      const { to, subject, html } = job.attrs.data;
      try {
        await sendEmail(to, subject, html);
        console.log(`Email sent successfully to ${to}`);
      } catch (error) {
        console.error(`Failed to send email to ${to}:`, error.message);
        // Agenda will automatically retry if we throw an error (depending on config)
        // We can also manually handle retries if needed
        throw error;
      }
    }
  );
};

export default defineEmailJob;
