import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Middleware cơ bản
app.use(express.json({ limit: '10kb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to our API!',
        version: '1.0.0',
        status: 'running',
    });
});

export default app;
