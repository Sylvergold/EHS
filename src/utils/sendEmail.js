import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async (to, subject, htmlContent) => {
  try {
   const transporter = nodemailer.createTransport({
       service: "gmail",
       auth: {
         user: process.env.EMAIL_ADDRESS,
         pass: process.env.EMAIL_PASSWORD,
       },
     });
 

    const mailOptions = {
      from: `"The Ogeri Health Foundation" <${process.env.EMAIL_ADDRESS}>`,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmail;
