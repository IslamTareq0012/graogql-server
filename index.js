import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';


import { v4 } from "uuid";
import verify from 'jsonwebtoken';
// Don't harcode! this is just a demo
const jwtSecret = 'test';

// Function for verifying JWT
const verifyJwt = (jwtToken, secret) => {
    return new Promise((resolve, reject) => {
        verify.verify(jwtToken, secret, function (err, decoded) {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};

const products = [
    {
        id: "53a0724c-a416-4cac-ae45-bfaedce1f147",
        name: "Steel Pot",
        description: "Silver steel pot that is perfect for cooking",
        quantity: 230,
        price: 42.44,
        image: "img-1",
        onSale: false,
        categoryId: "c01b1ff4-f894-4ef2-b27a-22aacc2fca70",
    },
    {
        id: "c2af9adc-d0b8-4d44-871f-cef66f86f7f6",
        name: "Salad Bowl",
        description: "Round wooden bowl perfect for tossing and making salads",
        quantity: 33,
        price: 53.5,
        image: "img-2",
        onSale: false,
        categoryId: "c01b1ff4-f894-4ef2-b27a-22aacc2fca70",
    },
    {
        id: "2c931e7e-510f-49e5-aed6-d6b44087e5a1",
        name: "Spoon",
        description: "Small and delicate spoon",
        quantity: 4266,
        price: 1.33,
        image: "img-3",
        onSale: true,
        categoryId: "c01b1ff4-f894-4ef2-b27a-22aacc2fca70",
    },
    {
        id: "404daf2a-9b97-4b99-b9af-614d07f818d7",
        name: "Shovel",
        description: "Grey rounded shovel for digging",
        quantity: 753,
        price: 332,
        image: "img-4",
        onSale: false,
        categoryId: "34115aac-0ff5-4859-8f43-10e8db23602b",
    },
    {
        id: "6379c436-9fad-4b3f-a427-2d7241f5c1b1",
        name: "Fertilizer",
        description: "Nitrogen based fertitlizer",
        quantity: 53453,
        price: 23.11,
        image: "img-5",
        onSale: true,
        categoryId: "34115aac-0ff5-4859-8f43-10e8db23602b",
    },
    {
        id: "f01bcdec-6783-464e-8f9e-8416830f7569",
        name: "Basketball",
        description: "Outdoor or indoor basketball",
        quantity: 128,
        price: 59.99,
        image: "img-6",
        onSale: true,
        categoryId: "d914aec0-25b2-4103-9ed8-225d39018d1d",
    },
    {
        id: "a4824a31-5c83-42af-8c1b-6e2461aae1ef",
        name: "Golf Clubs",
        description: "Good for golfing",
        quantity: 3,
        price: 427.44,
        image: "img-7",
        onSale: false,
        categoryId: "d914aec0-25b2-4103-9ed8-225d39018d1d",
    },
    {
        id: "b553085a-a7e0-4c9b-8a12-f971919c3683",
        name: "Baseball Gloves",
        description: "Professional catcher gloves",
        quantity: 745,
        price: 77.0,
        image: "img-8",
        onSale: true,
        categoryId: "d914aec0-25b2-4103-9ed8-225d39018d1d",
    },
    {
        id: "47bf3941-9c8b-42c0-9c72-7f3985492a5b",
        name: "Soccer Ball",
        description: "Round ball",
        quantity: 734,
        price: 93.44,
        image: "img-9",
        onSale: false,
        categoryId: "d914aec0-25b2-4103-9ed8-225d39018d1d",
    },
];

let categories = [
    {
        id: "c01b1ff4-f894-4ef2-b27a-22aacc2fca70",
        name: "Kitchen",
    },
    {
        id: "34115aac-0ff5-4859-8f43-10e8db23602b",
        name: "Garden",
    },
    {
        id: "d914aec0-25b2-4103-9ed8-225d39018d1d",
        name: "Sports",
    },
];


const typeDefs = `
    type Query{

        queryTest: String


        product(name: String!): Product!
        products(filter: ProductsFilter): [Product!]!


        categories: [Category!]!
        category(categoryId : ID!): Category
    }

    type Mutation {

        login(input: LoginInput!): AccessToken

        addCategory(input: AddCategoryInput!): Category!

        updateCategory(id: ID!, input: UpdateCategoryInput!): Category
    }

    type Product {
        id: ID!
        name: String!
        description: String!
        quantity: Int!
        image: String!
        price: Float!
        onSale: Boolean!
        category: Category!
      }

    type Category {
        id: ID!
        name: String!
        products(filter: ProductsFilter): [Product!]!
      }


    type AccessToken{
        token: String
    }

    input ProductsFilter{
        onSale: Boolean
    }

    input AddCategoryInput {
        name: String!
    }

    input UpdateCategoryInput {
        name: String!
    }

    
    input LoginInput {
        username: String!
        passwrord: String!
    }
`

const resolvers = {
    Query: {
        products: (parent, { filter }, context) => {
            if (context.permissions?.includes('read:items')) {
                if (filter) {
                    return products.filter(x => x.onSale === true);
                }
                return products;
            }
            throw new GraphQLError('User is not authenticated', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                    http: { status: 401 },
                }
            });
        },
        product: (parent, { name }, context) => {
            return products.find(x => x.name === name);
        },

        categories: () => categories,
        category: (parent, args, context) => categories.find((category) => category.id === args.categoryId),

        queryTest: (parent, args, context) =>{
            return "Hello World!"
        }
    },


    Mutation: {
        addCategory: (parent, { input }, context) => {
            const { name } = input;

            const newCategory = {
                id: v4(),
                name,
            };

            categories.push(newCategory);

            return newCategory;
        },

        updateCategory: (parent, { id, input }, context) => {
            const index = categories.findIndex((category) => category.id === id);
            if (index === -1) return null;
            categories[index] = {
                ...categories[index],
                ...input,
            };
            return categories[index];
        },
        login: (parent, { username, password }, context) => {
            return {
                token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1c2VySWQiOiJ1aWRfMTIzMTIzIiwib3JnSWQiOiJkZWZhdWx0X3N0b3JlIiwicGVybWlzc2lvbnMiOlsicmVhZDppdGVtcyJdfQ.Ij__uqjVLuCMCXP-nk_VUU9mGtZlE8xU_vXQ2ncrDrs`
            }
        }
    },

    Category: {
        products: (parent, { filter }, context) => {
            if (filter) {
                return products.filter(x => x.onSale && x.categoryId === parent.id);

            }
            return products.filter(x => x.categoryId === parent.id)
        }
    },

    Product: {
        category: (parent, args, context) => categories.find(x => x.id === parent.categoryId)
    }
}



const server = new ApolloServer({
    typeDefs,
    resolvers
})


const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    // Note: This example uses the `req` argument to access headers,
    // but the arguments received by `context` vary by integration.
    // This means they vary for Express, Fastify, Lambda, etc.

    // For `startStandaloneServer`, the `req` and `res` objects are
    // `http.IncomingMessage` and `http.ServerResponse` types.
    context: async ({ req, res }) => {
        try {
            // Get the user token from the headers.
            const token = req.headers.authorization.split(' ') || '';
            let user = null;
            // Try to retrieve a user with the token
            user = await verifyJwt(token[1], jwtSecret);
            if (user) {
                // Add the user to the context
                return {
                    tenantid: user.orgId,
                    permissions: user.permissions
                };
            }
            // Add the user to the context
            return {
                tenantid: null,
                permissions: null
            };
        } catch (error) {
            // Add the user to the context
            return {
                tenantid: null,
                permissions: null
            };
        }
    },
});


console.log(`🚀  Server ready at: ${url}`);