import { Router } from "express";
import { openai } from "../config/openai";
import { appendMessage,getSessionMemory } from "../memory/store";
import { queryDocs } from "../rag";
import { mathplugin } from "../plugins/math";
import { weatherplugin } from "../plugins/weather";
import OpenAI from "openai";



const router=Router();

router.post('/message',async(req,res)=>{
    const {message,session_id}=req.body;
    if(!message || !session_id) return res.status(400).json({error:'message and session_id required'});
    
    // save user message to memory
    appendMessage(session_id,{role:'user',content:message});

    // get last 2 messages for memory context
    const sessionMessages=getSessionMemory(session_id,2);

    // get top 3 relevant doc chunks for context
    const ragChunks=queryDocs(message,3);

    // plugin detection and execution
    let pluginOutput='';
    let pluginName='';

    // detect 'weather in bangalore'
    if(/weather in (\w+)/i.test(message)){
        pluginName="weather";
        pluginOutput=await weatherplugin(message);
    }
    // detect math expressions 
    else if(/^[\d+\-*/().\s]+[=|?]?$/.test(message.trim())){
        pluginName="math";
        pluginOutput=mathplugin(message.replace(/[=?]/g,'').trim());
    };


    // build prompts
    const promptMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content: 'You are a helpful assistant with memory and access to the following documents:\n\n' +
    '[SESSION MEMORY]\n'+
    sessionMessages.map(m=>m.role + ': '+ m.content).join('\n')+
    '\n\n[RETRIEVED CONTEXT]\n'+
      ragChunks.map(c => `[${c.file}] ${c.text.slice(0,200)}`).join('\n\n')+
      (pluginOutput? `\n\n[PLUGIN OUTPUT: ${pluginName}]\n${pluginOutput}` : '')
  },
  ...sessionMessages,
  { role: 'user', content: message }
];


// call OpenAI API with the built prompt

    try {
        const chatresponse=await openai.chat.completions.create({
            model:'gpt-4o-mini',
            messages: promptMessages
        });
        
        // get reply
        const reply=
        chatresponse.choices[0]?.message?.content?? 'No reply';
        
        // store AI agent reply in memory
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