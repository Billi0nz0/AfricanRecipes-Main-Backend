const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail", // or use SMTP
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // use app password
            },
        });

        const mailOptions = {
            from: `"African Recipes" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Email error:", error.message);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;