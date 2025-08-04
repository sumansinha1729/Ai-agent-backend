import { Router } from "express";
import { openai } from "../config/openai";
import { appendMessage,getSessionMemory } from "../memory/store";


const router=Router();

router.post('/message',async(req,res)=>{
    const {message,session_id}=req.body;
    if(!message || !session_id) return res.status(400).json({error:'message and session_id required'});

    appendMessage(session_id,{role:'user',content:message});
    const sessionMessages=getSessionMemory(session_id,2);

    const promptMessages=[
        {role:'system',content:'You are a helpful assistant with memory.'},
        ...sessionMessages,
        {role:'user',content:message}
    ];

    try {
        const chatresponse=await openai.chat.completions.create({
            model:'gpt-4o-mini',
            messages:[
                {role:'system',content:'You are a helpful assistant with memory.'},
    ...sessionMessages
            ],
        });

        const reply=
        chatresponse.choices[0]?.message?.content?? 'No reply';

        appendMessage(session_id,
            {role:'assistant',content:reply}
        )

        res.json({reply});
    } catch (error) {
        console.error(error);
        res.status(500).json({error:'OpenAI API error'})
    }
});


export default router;