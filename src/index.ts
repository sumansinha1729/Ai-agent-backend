import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import agentRouter from './routes/agent';
import { loadDocs } from './rag';

dotenv.config();

const app=express();
app.use(bodyParser.json());

loadDocs();  // load and index markdown docs at startup



app.use('/agent',agentRouter);

app.get('/',(req,res)=>{
    res.send('AI agent backend is running!');
});

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`server is running on port: ${PORT}`);
})