const layout = require("../emailTemplates/layout");

module.exports = ({ name }) =>
    layout({
        title: `Hello ${name}! 👋`,
        subtitle: "We've successfully received your message.",
        body: `
            <p style="font-size:16px;line-height:1.8;color:#555;">
                Thank you for reaching out to <strong>African Recipes</strong>.
            </p>

            <p style="font-size:16px;line-height:1.8;color:#555;">
                Your message has been delivered successfully and is now with our team.
                We'll review it and get back to you as soon as possible.
            </p>

            <div
                style="
                    background:#fcf6f3;
                    border-left:4px solid #8d3304;
                    padding:20px;
                    border-radius:12px;
                    margin:30px 0;
                "
            >
                <p style="margin:0;font-size:15px;color:#444;line-height:1.7;">
                    We typically respond within <strong>24–48 hours</strong>.
                    If your enquiry is urgent, please mention it in your reply and we'll do our best to assist sooner.
                </p>
            </div>

            <p style="font-size:16px;line-height:1.8;color:#555;">
                In the meantime, feel free to continue exploring authentic African recipes,
                discover new cuisines, and connect with our growing food community.
            </p>

            <div style="text-align:center;margin-top:35px;">
                <a
                    href="${process.env.APP_URL}/recipes"
                    style="
                        display:inline-block;
                        padding:14px 28px;
                        background:#8d3304;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:8px;
                        font-size:15px;
                        font-weight:600;
                    "
                >
                    Explore Recipes
                </a>
            </div>

            <p style="margin-top:35px;font-size:16px;color:#555;">
                Warm regards,<br>
                <strong style="color:#8d3304;">
                    The African Recipes Team
                </strong>
            </p>
        `
    });