import {DatabaseSync} from 'node:sqlite'

//criando o banco de dados SQLite
export const database = new DatabaseSync('database.db');

//Criando a tabela access_logs no banco de dados SQLite
database.exec(`CREATE TABLE IF NOT EXISTS access_logs (
  ip TEXT NOT NULL,
  username TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  job_area TEXT NOT NULL,
  company TEXT NOT NULL,
  job_title TEXT NOT NULL,
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);


console.log('Banco de dados e tabela access_logs criados com sucesso!');








