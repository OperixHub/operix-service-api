import dotenv from 'dotenv';
import { Pool } from 'pg';
import { env } from '../config/env.js';

dotenv.config();

const connection = new Pool({
  connectionString: env.databaseUrl,
});

export default connection;
