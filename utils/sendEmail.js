const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };
    

    // const res =  await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to,
    //   subject,
    //   text,
    // });

    const res = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", res);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

module.exports = sendEmail;
