require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { getUserFromToken } = require('./middleware/auth');
const initSocket = require('./socket');

const start = async () => {
  await connectDB();

  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());

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

  // Serve the built frontend (copied into ./public by `npm run build`).
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
