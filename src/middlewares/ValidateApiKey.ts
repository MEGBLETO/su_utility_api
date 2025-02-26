import express from 'express';

const app = express();



app.use((req, res, next) => {    
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.APP_API_KEY) {
        res.status(401).send('Unauthorized');
        return;
    }
    next();
})


export default app;