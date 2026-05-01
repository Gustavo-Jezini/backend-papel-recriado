import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';


const app = express();
 
app.use(morgan('tiny'));
 
app.use(cors());
 
app.use(helmet());
 
app.use(express.json());
 
app.get('/', (req, res) => {
    res.send('Hello World!');
});
 
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send(error.message);
})
 
export default app;