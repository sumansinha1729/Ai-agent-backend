import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

const app=express();
app.use(bodyParser.json());

app.get('/',(req,res)=>{
    res.send('AI agent backend is running!');
});

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`server is running on port: ${PORT}`);
})