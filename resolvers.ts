import { Collection, ObjectId } from "mongodb";
import { Restaurante } from "./types.ts"
import { getDatetime, getLatLon, getTemperatura, validatephone } from "./utils.ts";
import { GraphQLError } from "graphql";

//Siempre hay que poner el contexto
type Context={
  RestauranteCollection:Collection<Restaurante>
}

//Valores que usaremos para las Mutaciones
type MutationArgs={
    id: string,
    nombre: string,
    direccion: string,
    ciudad: string,
    telefono: string,
    pais: string,
    latitud: number,
    longitud: number
}

//una vez establecido eso, vamos con los resolvers, esdonde se define que hacen los gets,add...

export const resolvers={

  //hay como 3 categorias, el contexto, querys(para los gets), y mutation(para añadir, update,delete)

  //aui resolvemos de lo que ve el usuario(restaurante definido en typedefs) a lo que hay en back end(types.ts)
  Restaurante:{
    //cogemos el id 
    id:(parent:Restaurante)=>parent._id?.toString(),
    //para direccion total, por ejemplo, es el sumatorio de los sitios
    direccion_total:(parent:Restaurante)=>`${parent.direccion}, ${parent.ciudad}, ${parent.pais}`,
    //cuando usemos apis, ponemos lo de async
    temperatura:async(parent:Restaurante)=>{
      const result = await getTemperatura(parent.latitud,parent.longitud)
      return result.temperatura
    },
    hora: async(parent:Restaurante)=>{
      const {hora,minuto}= await getDatetime(parent.latitud,parent.longitud)
      return `${hora}:${minuto}`
    }

  },

  Query:{
    //aqui van los gets

    getRestaurante: async(
      //ponemos las 3 cosas
      _:unknown,
      args:MutationArgs,
      context:Context
    ):Promise<Restaurante>=>{
        const result=await context.RestauranteCollection.findOne({_id:new ObjectId(args.id)})
        if(!result) throw new GraphQLError("no encontrado")
        return result
    },

    getRestaurantes:async(
      _:unknown,
      args:MutationArgs,
      context:Context
    ):Promise<Restaurante[]>=>{
      const result=await context.RestauranteCollection.find({ciudad:args.ciudad}).toArray()
      if(result.length === 0) throw new GraphQLError("No existen restaurantes en esa zona")
      return result

    }


  },

  Mutation:{
  //aqui va lo de add, delete, update todo eso
    addRestaurante:async(
      _:unknown,
      args:MutationArgs,
      context:Context
    ):Promise<Restaurante>=>{
      //comprobamos si existe restaurante ocn ese telefono
      const existe_telefono= await context.RestauranteCollection.findOne({telefono:args.telefono})
      if(existe_telefono) throw new GraphQLError("Ya existe el telefono")

      const{is_valid, country}=await validatephone(args.telefono)
      if(!is_valid)throw new GraphQLError("El telefono no es valido")

      //si es valido, entonces metemos la lat y long
      const{latitud,longitud}=await getLatLon(args.ciudad)

      args={...args, pais:country, latitud,longitud}

      const{insertedId}= await context.RestauranteCollection.insertOne({...args})

      return{
        _id:insertedId,
        ...args
      }

    },

    //update
    updateRestaurante: async(
      _:unknown,
      args:MutationArgs,
      context:Context
    ):Promise<Restaurante>=>{
      
      const { id, telefono, ciudad } = args
      
      // Si hay teléfono, validarlo y obtener country
      if(telefono) {
        const { is_valid, country } = await validatephone(telefono)
        if(!is_valid) throw new GraphQLError("El teléfono no es válido")
        
        // Agregar country a los args
        args = {...args, pais:country} 
      }
      
      // Si hay ciudad, obtener las coordenadas
      if(ciudad) {
        const { latitud, longitud } = await getLatLon(ciudad)
        // Agregar coordenadas a los args
        args = {...args, latitud, longitud} 
      }
      
      // Verificar si el teléfono ya existe en otro restaurante
      if(telefono) {
        const phone_exist = await context.RestauranteCollection.findOne({telefono})
        if(phone_exist) throw new GraphQLError("Ya existe otro restaurante con ese teléfono")
      }
      
      // Realizar la actualización
      const result = await context.RestauranteCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$set: {...args}}, 
        {returnDocument: "after"}
      )
      
      if(!result) throw new GraphQLError("Restaurante no encontrado")
      
      return result
    },
    
    //delete
    deleteRestaurante:async(
      _:unknown,
      args:MutationArgs,
      context:Context
    ):Promise<boolean>=>{
      const {deletedCount}=await context.RestauranteCollection.deleteOne({_id: new ObjectId(args.id)})
      if(deletedCount===0) return false
      return true
      
    }


  }



}