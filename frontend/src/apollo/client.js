import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// In production the frontend is served from the backend (same origin), so a
// relative /graphql path works. Set VITE_API_URL to point at a separately
// hosted API. In local dev, Vite proxies /graphql to the backend.
const API_URL = import.meta.env.VITE_API_URL || '';
const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export default new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
