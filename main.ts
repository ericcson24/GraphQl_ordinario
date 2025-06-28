import { MongoClient } from 'mongodb'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from "./typeDefs.ts";
import { resolvers } from "./resolvers.ts";
import { Restaurante } from "./types.ts"

const MONGO_URL = Deno.env.get("MONGO_URL")
if(!MONGO_URL) throw new Error("Error con MONGO_URL")

const client = new MongoClient(MONGO_URL)
await client.connect()
console.log("Conectado a MongoDB")

const db = client.db("ordinario")
const RestauranteCollection = db.collection<Restaurante>("restaurante")  // Nombre consistente

const server = new ApolloServer({typeDefs, resolvers})
const { url } = await startStandaloneServer(server, {
  context: async() => ({ RestauranteCollection })  // Nombre consistente
})

console.log(`🚀  Server ready at: ${url}`);