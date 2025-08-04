import fs from 'fs';
import path from 'path';
import { embedText } from './embed';
import { cosineSim } from '../utils/cosine';

const CHUNK_SIZE=400;

export type DocChunk={
    text:String;
    embedding:number[];
    file:string;
};

let db:DocChunk[]=[];

export function loadDocs(){
    const files=fs.readdirSync(path.join(__dirname,'files'));
    db=[];
    for(const file of files){
        const content=fs.readFileSync(path.join(__dirname,'files',file),'utf-8');
        for(let i=0;i<content.length;i+=CHUNK_SIZE){
            const chunk=content.slice(i,i+CHUNK_SIZE);
            db.push({text:chunk, embedding:embedText(chunk),file});
        }
    }
};

export function queryDocs(query:string, topK=3): DocChunk[]{
    const qVec=embedText(query);
    return db.map(chunk=>({
        ...chunk,
        score:cosineSim(qVec,chunk.embedding)
    }))
    .sort((a,b)=>b.score-a.score)
    .slice(0,topK);
}

