export type Message={
    role:'user' | 'assistant';
    content:string;
};

type sessionMemory={
    [sessionId: string]: Message[];
};

const memory:sessionMemory ={};

export function appendMessage(sessionId:string,msg:Message){
    if(!memory[sessionId]){
        memory[sessionId]=[];
    };
    memory[sessionId].push(msg);
};

export function getSessionMemory(sessionId:string,n:number=2):Message[]{
    return (memory[sessionId] || []).slice(-n)
;}