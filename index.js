require('dotenv').config();
require('./config/database').connectDB();
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');

//Import Routes
const routes = require('./routes');

//Middleware
app.use(express.json());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(routes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  //set static
  app.use(express.static(path.join(__dirname, 'app', 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'client', 'build', 'index.html'));
  });
}

//Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on post ${PORT}`));
