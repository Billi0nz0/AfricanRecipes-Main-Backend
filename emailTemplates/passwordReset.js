module.exports = (user, resetURL) => `
    <!DOCTYPE html>
    <html>
        <div style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, sans-serif;">
            
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr>
                    <td align="center">

                        <table
                            width="500"
                            cellpadding="0"
                            cellspacing="0"
                            style="
                            width:100%;
                            max-width:500px;
                            background:#ffffff;
                            border-radius:16px;
                            padding:30px;
                            box-shadow:0 10px 25px rgba(0,0,0,0.08);
                            text-align:center;
                            "
                        >

                            <tr>
                                <td align="center" style="padding-bottom:20px;">
                                    <img
                                    src="https://www.afrirecipes.com/logo.svg"
                                    alt="African Recipes"
                                    width="80"
                                    style="display:block;"
                                    />
                                </td>
                            </tr>

                            // HEADER 
                            <tr>
                                <td>
                                    <h2 style="color:#8d3304; margin-bottom:10px;">
                                    Reset Your Password
                                    </h2>

                                    <p style="color:#666; font-size:14px;">
                                    Secure your account with a new password
                                    </p>
                                </td>
                            </tr>

                            // DIVIDER 
                            <tr>
                                <td>
                                    <div
                                    style="
                                        height:1px;
                                        background:#eee;
                                        margin:20px 0;
                                    "
                                    ></div>
                                </td>
                            </tr>

                            // CONTENT
                            <tr>
                                <td
                                    style="
                                    text-align:left;
                                    color:#333;
                                    font-size:14px;
                                    "
                                >
                                    <p>
                                    Hi <strong>${user.username}</strong>,
                                    </p>

                                    <p>
                                    We received a request to reset your password.
                                    Click the button below to continue.
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:25px 0;">
                                    <a
                                    href="${resetURL}"
                                    style="
                                        display:inline-block;
                                        padding:14px 28px;
                                        background:#8d3304;
                                        color:#ffffff;
                                        text-decoration:none;
                                        border-radius:8px;
                                        font-size:14px;
                                        font-weight:bold;
                                        letter-spacing:0.5px;
                                    "
                                    >
                                    Reset Password
                                    </a>
                                </td>
                            </tr>

                            // EXPIRY 
                            <tr>
                            <td style="color:#999; font-size:13px;">
                                This link expires in <strong>15 minutes</strong>.
                            </td>
                            </tr>

                            //FOOTER
                            <tr>
                            <td
                                style="
                                padding-top:20px;
                                color:#aaa;
                                font-size:12px;
                                "
                            >
                                <p>
                                If you didn’t request this,
                                you can safely ignore this email.
                                </p>
                            </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </div>
    `;
