import { Router } from "express";
import { openai } from "../config/openai";


const router=Router();

router.post('/message',async(req,res)=>{
    const {message}=req.body;
    if(!message) return
    res.status(400).json({error:'message required'});

    try {
        const chatresponse=await openai.chat.completions.create({
            model:'gpt-3.5-turbo',
            messages:[
                {role:'system',content:'You are a helpful assistant'},
                {role:'user',content:message}
            ],
        });

        const reply=
        chatresponse.choices[0]?.message?.content?? 'No reply';
        res.json({reply});
    } catch (error) {
        console.error(error);
        res.status(500).json({error:'OpenAI API error'})
    }
});


export default router;