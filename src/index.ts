import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import authRoute from './routes/authRoute';
import sequenceRoute from './routes/sequenceRoute';

dotenv.config();

const app: Application = express();


const allowedOrigins = [
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/sequences', sequenceRoute);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});