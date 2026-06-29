const layout = require("../emailTemplates/layout");

module.exports = ({ name }) =>
    layout({
        title: `Welcome to African Recipes, ${name}! 🎉`,
        subtitle: "Your culinary journey across Africa starts here.",
        body: `
            <p style="font-size:16px;line-height:1.8;color:#555;">
                Thank you for joining <strong>African Recipes</strong>.
                We're excited to welcome you to a community passionate about celebrating
                Africa's rich and diverse culinary heritage.
            </p>

            <p style="font-size:16px;line-height:1.8;color:#555;">
                Whether you're looking for family favourites, discovering dishes from
                different regions, or sharing your own recipes with the world, you've
                found the right place.
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
                <p style="margin:0 0 15px;font-size:16px;color:#444;">
                    Here's what you can do:
                </p>

                <ul style="margin:0;padding-left:20px;color:#555;line-height:2;">
                    <li>🍲 Discover authentic African recipes.</li>
                    <li>❤️ Save your favourite dishes.</li>
                    <li>✍️ Share your own recipes with the community.</li>
                    <li>🌍 Explore cuisines from across Africa.</li>
                    <li>👨‍🍳 Connect with fellow food lovers.</li>
                </ul>
            </div>

            <div style="text-align:center;margin-top:35px;">
                <a
                    href="${process.env.APP_URL}/recipes"
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
                    Start Exploring
                </a>
            </div>

            <p style="margin-top:35px;font-size:16px;color:#555;">
                Happy cooking! 🍛<br><br>

                <strong style="color:#8d3304;">
                    The African Recipes Team
                </strong>
            </p>
        `
    });