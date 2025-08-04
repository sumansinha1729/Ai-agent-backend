export async function weatherplugin(query:string): Promise<string>{
    if(query.toLowerCase().includes("bangalore")){
        return "Current weather in Bangalore: 27 degree C, Mostly Sunny.";
    };

    return "Weather plugin only supports Bangalore.";  
}