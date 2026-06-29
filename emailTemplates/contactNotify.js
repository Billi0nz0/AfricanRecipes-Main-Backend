const layout = require("./layout");

module.exports = ({ name, email, subject, message }) =>
    layout({
        title: "📩 New Contact Form Submission",
        subtitle: "A visitor has submitted a new enquiry through your website.",
        body: `
            <div
                style="
                    background:#fcf6f3;
                    border-left:4px solid #8d3304;
                    padding:25px;
                    border-radius:12px;
                    margin-bottom:30px;
                "
            >

                <p style="margin:0 0 15px;font-size:15px;">
                    <strong>Name:</strong><br>
                    ${name}
                </p>

                <p style="margin:0 0 15px;font-size:15px;">
                    <strong>Email:</strong><br>
                    ${email}
                </p>

                <p style="margin:0 0 15px;font-size:15px;">
                    <strong>Subject:</strong><br>
                    ${subject}
                </p>

            </div>

            <h3
                style="
                    color:#8d3304;
                    margin-bottom:15px;
                "
            >
                Message
            </h3>

            <div
                style="
                    background:#f9f9f9;
                    padding:20px;
                    border-radius:10px;
                    border:1px solid #eee;
                    color:#555;
                    line-height:1.8;
                    white-space:pre-wrap;
                "
            >
                ${message}
            </div>

            <p
                style="
                    margin-top:35px;
                    font-size:15px;
                    color:#666;
                "
            >
                This message was submitted through the
                <strong>African Recipes Contact Form</strong>.
            </p>
        `
    });