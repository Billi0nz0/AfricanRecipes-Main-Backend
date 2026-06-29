// controllers/contactController.js

const sendEmail = require("../utils/emailService");

const contactNotification = require("../emailTemplates/contactNotify");
const contactConfirmation = require("../emailTemplates/contactMailConfirm");
const RECIEVE = process.env.CONTACT_EMAIL

exports.contactUs = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address."
            });
        }

        if (message.trim().length < 10) {
            return res.status(400).json({
                message: "Message is too short."
            });
        }

        // Send notification to admin
        await sendEmail({
            to: RECIEVE,
            subject: `📩 Contact Form • ${subject}`,
            replyTo: email,
            html: contactNotification({
                name,
                email,
                subject,
                message,
            }),
        });

        // Send confirmation to sender
        await sendEmail({
            to: email,
            subject: "We've received your message",
            html: contactConfirmation({
                name,
            }),
        });

        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully."
        });

    } catch (error) {
        console.error("Contact Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};