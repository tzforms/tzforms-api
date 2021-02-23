import cors from 'cors';
import Express, {
    json,
    text
} from 'express';
import router from './router';

const server = Express();
server.use(cors({
    origin: '*'
}));
server.use(json());

server.use(router);

server.listen(8081, () => console.log(`Listening on port 8081`));