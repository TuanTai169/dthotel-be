module.exports = {
  appConstant: {
    dbConnect:
      'mongodb+srv://dthotel:dthotel@dthotel.dohjt.mongodb.net/kltn-dthotel?retryWrites=true&w=majority',
    accessTokenSecret: 'dthotel',
    jwtExpiresIn: '14d',
    baseUrl: 'api',
    nameApp: 'DTHotel',
  },
  regex: {
    email:
      /^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/,
    phoneNumber: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
    password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
  },

  RoomStatus: Object.freeze({
    Ready: { name: 'Ready', value: 0, color: 'green' },
    Occupied: { name: 'Occupied', value: 1, color: 'red' },
    Cleaning: { name: 'Cleaning', value: 2, color: '#ccc' },
    Fixing: { name: 'Fixing', value: 3, color: 'yellow' },
    Booking: { name: 'Booking', value: 4, color: 'blue' },
  }),

  BookingStatus: Object.freeze({
    Booking: { name: 'Booking', value: 0, color: 'blue' },
    checkIn: { name: 'Check In', value: 1, color: 'green' },
    checkout: { name: 'Check out', value: 2, color: 'red' },
    cancelled: { name: 'Cancelled', value: 3, color: '#ccc' },
  }),

  userRoles: Object.freeze({
    Staff: { name: 'Staff', value: 0 },
    Employee: { name: 'Employee', value: 1 },
    Manager: { name: 'Manager', value: 2 },
    Admin: { name: 'Admin', value: 3 },
    SuperAdmin: { name: 'Super Admin', value: 4 },
  }),

  imageDefault: {
    src: 'https://drive.google.com/thumbnail?id=1wssym_RCzfAETooYk690s0mlcAv_CVhw',
    alt: 'default-img',
  },
  capacityDefault: {
    adult: 1,
    child: 0,
  },

  sendEmailConfig: {
    EMAIL_HOST: 'smtp.gmail.com',
    EMAIL_PORT: 465,
    EMAIL_USERNAME: 'nguyentuantai412@gmail.com',
    EMAIL_PASSWORD: 'tuantai412',
  },

  googleOath2Config: {
    CLIENT_ID:
      '47620239037-e8eb239e11n69e62uv73ehqra5rqp4n0.apps.googleusercontent.com',
    CLIENT_SECRET: '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',
    REFRESH_TOKEN_EMAIL:
      '1//04ZkSOk24aVJqCgYIARAAGAQSNwF-L9IrZ9kZnKrQCpWHmVMP1QWAhS7SOyKvFhZhVZY39LmGSv_DMVDZYF82xP1HCnDkKpR_agk',
    REFRESH_TOKEN_DRIVE:
      '1//04gyeaYOTGdqyCgYIARAAGAQSNwF-L9IrDAwsjeoWircHb02HeuKv-gnFLHbMnYqWOaFZaziJa0uBGTebTMsPXZHElLvIxMrqBMg',
  },
};
