import { StatusController } from './controllers/status.controller.js';
import { UserController } from './controllers/user.controller.js';
import { db } from './database/index.js';
import { createServer, defineRoutes } from './server.js';

const server = createServer();

defineRoutes(server, db, [UserController, StatusController]);

server.listen({ host: '0.0.0.0', port: 3333 })
  .then(() => console.log(':> server is running at http://localhost:3333/'))
  .catch(reason => console.error('error :>', reason));
