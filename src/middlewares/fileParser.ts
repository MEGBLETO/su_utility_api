import express from "express";
import * as formidable from 'formidable';

const app = express();

app.use((req, res, next) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
      
        req.body = fields;
        req.files = files;
        next();
    });
});

export default app;
