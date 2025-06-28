import { OptionalId } from "mongodb";

//Definicion del restaurante

export type Restaurante=OptionalId<{
    nombre: string,
    direccion: string,
    ciudad: string,
    telefono: string, 
    pais: string,
    latitud: number,
    longitud: number
}>


//Definicion de API

export type APIPhone={
    is_valid:boolean,
    country:string
}
export type ApiTemperatura={
    temperatura:number
}
export type API_lat_lon = {
    latitude: number,
    longitude: number 
}

export type API_datetime = {
    hour: number,
    minute: number
}