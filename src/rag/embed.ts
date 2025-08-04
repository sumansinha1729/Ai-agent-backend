export function embedText(text:string): number[] {
    const vec=Array(50).fill(0);
    text.toLocaleLowerCase().split(/\W+/).forEach(word=>{
        if(word.length>0){
            const idx=word.length%50;
            vec[idx] += 1;
        }
    });
    return vec;
}