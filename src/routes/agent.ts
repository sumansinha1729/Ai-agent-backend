import { Router } from "express";
import { openai } from "../config/openai";
import { appendMessage,getSessionMemory } from "../memory/store";
import { queryDocs } from "../rag";
import OpenAI from "openai";



const router=Router();

router.post('/message',async(req,res)=>{
    const {message,session_id}=req.body;
    if(!message || !session_id) return res.status(400).json({error:'message and session_id required'});

    appendMessage(session_id,{role:'user',content:message});
    const sessionMessages=getSessionMemory(session_id,2);

    // get top 3 relevant doc chunks for context
    const ragChunks=queryDocs(message,3);

    const promptMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content: 'You are a helpful assistant with memory and access to the following documents:\n\n' +
      ragChunks.map(c => `[${c.file}] ${c.text.slice(0,200)}`).join('\n\n')
  },
  ...sessionMessages,
  { role: 'user', content: message }
];


    try {
        const chatresponse=await openai.chat.completions.create({
            model:'gpt-4o-mini',
            messages: promptMessages
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