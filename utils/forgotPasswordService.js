const sendEmail = require("../utils/emailService");

const sendPasswordResetEmail = async (userEmail, resetLink) => {
  return sendEmail({
    to: userEmail,
    subject: "Reset Your Password - African Recipes",
    html: `
      <div>
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to continue:</p>
        <a href="${resetLink}">${resetLink}</a>
        <br/>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendPasswordResetEmail;