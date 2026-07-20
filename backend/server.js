// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const { ApolloServer } = require('apollo-server-express');
// const { Server } = require('socket.io');

// const connectDB = require('./config/db');
// const typeDefs = require('./graphql/schema');
// const resolvers = require('./graphql/resolvers');
// const { getUserFromToken } = require('./middleware/auth');
// const initSocket = require('./socket');

// const start = async () => {
//   const { PrismaClient } = require('@prisma/client');
//   const prisma = new PrismaClient();

//   const app = express();
//   app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
//   app.use(express.json());

//   app.get('/', (_, res) => res.json({ status: 'API running' }));

//   const httpServer = http.createServer(app);
//   const io = new Server(httpServer, {
//     cors: { origin: process.env.CLIENT_ORIGIN, credentials: true },
//   });
//   initSocket(io);

//   const apollo = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: async ({ req }) => {
//       const user = await getUserFromToken(req.headers.authorization);
//       return { user, io };
//     },
//   });

//   await apollo.start();
//   apollo.applyMiddleware({ app, cors: false });

//   const PORT = process.env.PORT || 5000;
//   httpServer.listen(PORT, () => {
//     console.log(`Server: http://localhost:${PORT}`);
//     console.log(`GraphQL: http://localhost:${PORT}${apollo.graphqlPath}`);
//   });
// };

// start();

require('dotenv').config();                                                                                       
  const express = require('express');                                                                             
  const http = require('http');
  const cors = require('cors');
  const { ApolloServer } = require('apollo-server-express');                                                        
  const { Server } = require('socket.io');
                                                                                                                    
  const connectDB = require('./config/db');                                                                       
  const typeDefs = require('./graphql/schema');
  const resolvers = require('./graphql/resolvers');                                                                 
  const { getUserFromToken } = require('./middleware/auth');
  const initSocket = require('./socket');
  
  const path = require('path');

                                                                                                                    
  const start = async () => {
    await connectDB();                                                                                              
                                                                                                                  
    const app = express();
    app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
    app.use(express.json());
    
    //app.use(express.static(path.join(__dirname, 'public')));
    //app.get('*', (req, res) => {
      //res.sendFile(path.join(__dirname, 'public', 'index.html'));
    //});
  
    // app.get('/', (_, res) => res.json({ status: 'API running' }));
    
                                                                                                                  
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: { origin: process.env.CLIENT_ORIGIN, credentials: true },                                               
    });
    initSocket(io);                                                                                                 
                                                                                                                  
    const apollo = new ApolloServer({                                                                               
      typeDefs,
      resolvers,                                                                                                    
      context: async ({ req }) => {                                                                               
        const user = await getUserFromToken(req.headers.authorization);
        return { user, io };                                                                                        
      },
    });                                                                                                             
                                                                                                                  
    await apollo.start();
    apollo.applyMiddleware({ app, cors: false });

    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    const PORT = process.env.PORT || 5000;                                                                          
    httpServer.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}`);                                                              
      console.log(`GraphQL: http://localhost:${PORT}${apollo.graphqlPath}`);                                        
    });
  };                                                                                                                
                                                                                                                  
  start(); 