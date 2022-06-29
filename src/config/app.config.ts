export default () => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  cors: {
    origin: (process.env.CORS_ORIGIN ?? '').split(','),
  },
  neo4j: {
    scheme: process.env.NEO4J_SCHEME,
    host: process.env.NEO4J_HOST,
    port: parseInt(process.env.NEO4J_PORT, 10) || 7687,
    username: process.env.NEO4J_USERNAME,
    password: process.env.NEO4J_PASSWORD,
    database: process.env.NEO4J_DATABASE,
  },
});
