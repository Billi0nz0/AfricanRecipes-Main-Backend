const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, replyTo }) => {
  try {
    const response = await resend.emails.send({
      from: "African Recipes <noreply@afrirecipes.com>",
      to,
      subject,
      html,
      reply_to: replyTo, // optional
    });

    console.log("Email sent successfully:", response);
    return response;

  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;