const APP_NAME = process.env.APP_NAME;
const APP_URL = process.env.APP_URL;
const APP_LOGO = process.env.APP_LOGO;
const APP_TAGLINE = process.env.APP_TAGLINE;

module.exports = ({title, subtitle, body,}) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin:0;padding:0;background:#f4f7f8;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f8;padding:40px 15px;">

<tr>

<td align="center">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:20px;
overflow:hidden;
box-shadow:0 8px 25px rgba(0,0,0,0.08);
">

<!-- ================= HEADER ================= -->

<tr>

<td
align="center"
style="
background:#8d3304;
padding:35px 20px;
">

<img
src="${APP_LOGO}"
alt="African Recipes"
width="90"
style="
display:block;
margin-bottom:15px;
">

<h2
style="
margin:0;
color:#ffffff;
font-size:24px;
font-weight:700;
">

${APP_NAME}

</h2>

<p
style="
margin:8px 0 0;
color:#f5d9c9;
font-size:14px;
">

${APP_TAGLINE}

</p>

</td>

</tr>

<!-- ================= BODY ================= -->

<tr>

<td style="padding:40px;">

<h1
style="
margin-top:0;
margin-bottom:20px;
color:#222;
font-size:28px;
font-weight:700;
">

${title}

</h1>

${
subtitle
? `
<p
style="
font-size:16px;
line-height:1.8;
color:#555;
margin-top:0;
margin-bottom:25px;
">
${subtitle}
</p>
`
: ""
}

${body}

</td>

</tr>

<!-- ================= FOOTER ================= -->

<tr>

<td
align="center"
style="
background:#f8f8f8;
padding:25px;
border-top:1px solid #e8e8e8;
">

<p
style="
margin:0;
color:#777;
font-size:14px;
">

website: ${APP_URL}

</p>

<p
style="
margin:10px 0 0;
color:#999;
font-size:12px;
">

You're receiving this email because you have an account with ${APP_NAME}
or interacted with our platform.

</p>

<p
style="
margin:10px 0 0;
color:#999;
font-size:12px;
">

© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;