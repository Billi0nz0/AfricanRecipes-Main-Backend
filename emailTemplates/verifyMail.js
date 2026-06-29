const layout = require("../emailTemplates/layout");

module.exports = ({ name, verificationLink }) =>
    layout({
        title: "Verify Your Email Address",
        subtitle: "One final step before you start exploring African Recipes.",
        body: `
            <p style="font-size:16px;line-height:1.8;color:#555;">
                Hello <strong>${name}</strong>,
            </p>

            <p style="font-size:16px;line-height:1.8;color:#555;">
                Thank you for creating your African Recipes account.
                To keep your account secure and ensure we can contact you when needed,
                please verify your email address.
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
                    Click the button below to verify your email address.
                    This verification link will expire in <strong>24 hours</strong>.
                </p>
            </div>

            <div style="text-align:center;margin:35px 0;">
                <a
                    href="${verificationLink}"
                    style="
                        display:inline-block;
                        padding:14px 30px;
                        background:#8d3304;
                        color:#fff;
                        text-decoration:none;
                        border-radius:8px;
                        font-size:15px;
                        font-weight:600;
                    "
                >
                    Verify Email
                </a>
            </div>

            <p style="font-size:15px;line-height:1.8;color:#555;">
                If the button doesn't work, copy and paste the link below into your browser:
            </p>

            <p
                style="
                    background:#f8f8f8;
                    border:1px solid #eee;
                    padding:15px;
                    border-radius:8px;
                    word-break:break-all;
                    color:#8d3304;
                    font-size:14px;
                "
            >
                ${verificationLink}
            </p>

            <p style="font-size:15px;line-height:1.8;color:#555;">
                If you didn't create an African Recipes account, you can safely ignore
                this email. No further action is required.
            </p>

            <p style="margin-top:35px;font-size:16px;color:#555;">
                Thank you,<br><br>

                <strong style="color:#8d3304;">
                    The African Recipes Team
                </strong>
            </p>
        `
    });