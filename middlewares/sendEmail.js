const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    try {
        const response = await resend.emails.send({
            from: "African Recipes <noreply@afrirecipes.com>",
            to,
            subject,
            html,
        });

        console.log("Email sent successfully", response);
    } catch (error) {
        console.error("Email error:", error);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;
