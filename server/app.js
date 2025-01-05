require('express-async-errors');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');
const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
// IMPORT ROUTERS AND MIDDLEWARES
const authRouter = require('./routes/auth');
const dataRouter = require('./routes/data');
const playbackRouter = require('./routes/playback');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// SECURITY and MIDDLEWARES
app.set('trust proxy', 1);
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
}));
app.use(express.json());
app.use(cors());
app.use(xss());
app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"], // Restrict everything by default to 'self'
          "script-src": ["'self'", "https://sdk.scdn.co"], // Allow Spotify SDK
          "img-src": ["'self'", "https://mosaic.scdn.co", "data:"], // Allow Spotify images
          "object-src": ["'none'"], // Disallow <object>, <embed>, etc.
          // Add more directives as needed
        },
      },
    })
  );
app.use(express.static(path.resolve(__dirname, '../client/build')));

// ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/data', dataRouter);
app.use('/api/v1/playback', playbackRouter);

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

// ERROR MIDDLEWARES
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 4000;
const start = async ()=>{
    try {
        app.listen(port, ()=>{
            console.log(`Server listening on port ${port}...`);
        });
    } catch (error) {
        console.log(error);
    };
};
start();