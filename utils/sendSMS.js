require('dotenv').config();

const sendSMS = async (name, numberPhone) => {
  try {
    const accountSid = 'AC697abba4f0f6f204fc1ecd4a71575e88';
    const authToken = '543c2bb72cefd9d11667b9bba964b372';
    const client = require('twilio')(accountSid, authToken);

    let convertPhone = numberPhone;
    convertPhone = convertPhone.replace('0', '+84');

    const res = await client.messages.create({
      body: `Hi ${name}, a new room has been check out. Please check it at : https://dthotel-cleaner.vercel.app/`,
      from: '+19708251054',
      to: convertPhone,
    });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = { sendSMS };
