import { GraphQLError } from "graphql";
import { API_datetime, API_lat_lon, APIPhone } from "./types.ts";

export const validatephone=async(telefono:string)=>{

    const API_KEY = Deno.env.get("API_KEY")
    if(!API_KEY) throw new Error("Error cogiendo la api key")

    const data= await fetch(`https://api.api-ninjas.com/v1/validatephone?number=${telefono}`,{
        headers:{
            'X-Api-Key': API_KEY
        }
    })

    if (data.status !== 200)throw new Error("error al pillar los datos validar telefono")

    const result:APIPhone=await data.json()

    return{
        is_valid:result.is_valid,
        country:result.country
    }

}

export const getTemperatura=async(lat:number,lon:number)=>{
    const API_KEY=Deno.env.get("API_KEY")
    if(!API_KEY) throw new Error("error en la api key")

    const data=await fetch(`https://api.api-ninjas.com/v1/weather?lat=${lat}&lon=${lon}`,{
        headers:{
            'X-Api-Key': API_KEY
        }
    })

    if (data.status !== 200) throw new GraphQLError("error al pillar los datos temperatura")

    const result=await data.json()
    
    if(!result || result.temp === undefined) {
        throw new GraphQLError("Temperatura no disponible para estas coordenadas")
    }
    
    return {
        temperatura: result.temp
    }
}



export const getLatLon = async(ciudad: string) => {
    const API_KEY=Deno.env.get("API_KEY")
    if(!API_KEY) throw new Error("Error con la API_KEY")
    const url = `https://api.api-ninjas.com/v1/city?name=${ciudad}`
    const data = await fetch(url, {
        headers: {
            'X-Api-Key': API_KEY
          }
    })
    if(data.status !== 200) throw new GraphQLError("Fallo al solicitar a la API")
    const result = await data.json()
    
    // Add validation to check if result array is not empty
    if(!result || result.length === 0) {
        throw new GraphQLError(`No se encontró información para la ciudad: ${ciudad}`)
    }
    
    const aux:API_lat_lon = result[0]
    
    // Add validation to check if latitude and longitude exist
    if(aux.latitude === undefined || aux.longitude === undefined) {
        throw new GraphQLError(`Coordenadas no disponibles para la ciudad: ${ciudad}`)
    }
    
    return {
        latitud: aux.latitude,
        longitud: aux.longitude
    }
}

export const getDatetime = async(lat: number, lon: number) => {
    const API_KEY=Deno.env.get("API_KEY")
    if(!API_KEY) throw new Error("Error con la API_KEY")
        const url = `https://api.api-ninjas.com/v1/worldtime?lat=${lat}&lon=${lon}`
        const data = await fetch(url, {
            headers: {
                'X-Api-Key': API_KEY
              }
        })
        if(data.status !== 200) throw new GraphQLError("Fallo al solicitar a la API")
        const result:API_datetime = await data.json()
        return {
            hora: result.hour,
            minuto: result.minute
        }
}