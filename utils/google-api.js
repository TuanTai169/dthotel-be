const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const OAuth2 = google.auth.OAuth2;
const { sendEmailConfig, googleOath2Config } = require('../config/constants');

const oauth2ClientEmail = new OAuth2(
  googleOath2Config.CLIENT_ID, // ClientID
  googleOath2Config.CLIENT_SECRET, // Client Secret
  'https://developers.google.com/oauthplayground' // Redirect URL
);

const oauth2ClientDrive = new OAuth2(
  googleOath2Config.CLIENT_ID, // ClientID
  googleOath2Config.CLIENT_SECRET, // Client Secret
  'https://developers.google.com/oauthplayground' // Redirect URL
);

oauth2ClientEmail.setCredentials({
  refresh_token: googleOath2Config.REFRESH_TOKEN_EMAIL,
});

oauth2ClientDrive.setCredentials({
  refresh_token: googleOath2Config.REFRESH_TOKEN_DRIVE,
});

const drive = google.drive({
  version: 'v3',
  auth: oauth2ClientDrive,
});

const sendEmail = async (options) => {
  const accessToken = oauth2ClientEmail.getAccessToken();

  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: sendEmailConfig.EMAIL_USERNAME,
      clientId: googleOath2Config.CLIENT_ID,
      clientSecret: googleOath2Config.CLIENT_SECRET,
      refreshToken: googleOath2Config.REFRESH_TOKEN_EMAIL,
      accessToken: accessToken,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // Active in gmail "less secure app" option
  });
  // Define the email options
  const mailOptions = {
    from: `DT HOTEL <${sendEmailConfig.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    //text: options.message,
    html: options.message,
  };
  // Actually send the email
  await transporter.sendMail(mailOptions);
};

const uploadImage = async (options) => {
  try {
    const res = await drive.files.create({
      requestBody: {
        name: options.name,
        mimeType: 'image/jpg, image/png',
      },
      media: {
        mimeType: 'image/jpg, image/png',
        body: fs.createReadStream(options.filePath),
      },
    });

    if (!!res && !!res.data) {
      const publicUrl = await generateUrl(res.data.id);
      return publicUrl;
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteImage = async (fileId) => {
  try {
    const res = await drive.files.delete({
      fileId,
    });
    console.log(res.data);
  } catch (error) {
    console.log(error.message);
  }
};

const generateUrl = async (fileId) => {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const res = await drive.files.get({
      fileId,
      fields: 'webViewLink, webContentLink',
    });

    if (!!res && !!res.data) return res.data;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { sendEmail, uploadImage, deleteImage };
