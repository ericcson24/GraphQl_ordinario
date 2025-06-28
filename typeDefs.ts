export const typeDefs =`#graphql



    type Restaurante {
      id: ID!,
      nombre: String!,
      direccion_total: String!
      telefono: String!,
      temperatura: Int!,
      hora: String!
        
    }
    
    type Query {
      getRestaurante(id:ID!):Restaurante!
      getRestaurantes(ciudad:String!):[Restaurante!]!
    }

    type Mutation {
      addRestaurante(nombre:String!, telefono:String!, direccion:String!, ciudad:String!):Restaurante!
      deleteRestaurante(id:ID!):Boolean
      updateRestaurante(id:ID!, nombre:String, telefono:String, direccion:String, ciudad:String):Restaurante!
    }
`