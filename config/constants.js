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
    Cleaner: { name: 'Cleaner', value: 0 },
    Employee: { name: 'Employee', value: 1 },
    Manager: { name: 'Manager', value: 2 },
    Admin: { name: 'Admin', value: 3 },
    SuperAdmin: { name: 'Super Admin', value: 4 },
  }),

  imageDefault: {
    src: 'https://drive.google.com/thumbnail?id=13slEWNdyUJgkgeVHFmQdVIvwqLoAWVXC',
    alt: 'default-img',
  },
  capacityDefault: {
    adult: 1,
    child: 0,
  },

  bedDefault: {
    single: 0,
    double: 1,
  },

  detailDefault: {
    bedRoom: 1,
    bathRoom: 1,
    livingRoom: 0,
    kitchen: 0,
    desc: 'This air-conditioned double room also has a heater option and opens up to views. The seating area features a flat-screen satellite TV, sofa and a mini-bar. The private bathroom comes with a shower or a bath. A bathrobe is provided. Interconnecting rooms are available.',
  },

  sendEmailConfig: {
    EMAIL_HOST: 'smtp.gmail.com',
    EMAIL_PORT: 465,
    EMAIL_USERNAME: 'nguyentuantai412@gmail.com',
    EMAIL_PASSWORD: 'TuanTai@169',
  },

  googleOath2Config: {
    CLIENT_ID:
      '376835607580-9homes1bicj9mtr0651onhoe8q3utrr9.apps.googleusercontent.com',
    CLIENT_SECRET: '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',
    REFRESH_TOKEN_EMAIL:
      '1//042L1zzkrqkx6CgYIARAAGAQSNwF-L9IrqF_f8Uy1EIfq9uu1L4BX0xLgD66rs5FOtbuk-IyW-TJCdofEyTLTTzBGm5MNsfVKFHg',
    REFRESH_TOKEN_DRIVE:
      '1//04nlPyXAijncRCgYIARAAGAQSNwF-L9IraJrwbY4TXNx7TPI5TE2OxwoyVcTsiNggIqPFJqJwucYuQ0_8FJNPXFVqJbeDC0W4vWM',
  },
};
