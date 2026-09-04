import {createReadStream} from 'node:fs';
import readline from 'node:readline';
import {database} from '../src/banco.js';

//Função para ler e verificar se cada linha do arquivo é um JSON válido
async function lerEVeriicarJSON(caminhoArquivo) {

    // Preparando a instrução SQL para inserção no banco de dados
    const insert = database.prepare(`INSERT INTO access_logs (ip, username, first_name, last_name, email, location, job_area, company, job_title, id, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    //Criando um stream de leitura do arquivo
    const stream = createReadStream(caminhoArquivo, {encoding: 'utf8'});

    //Criando uma interface de leitura de linhas do arquivo
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
    })

    let numeroLinha = 0;

    //Iterando sobre cada linha do arquivo
    for await (const linha of rl) {
        numeroLinha++;

        if(!linha.trim()) continue; // Ignora linhas em branco

        try {
            //Tentando fazer o parse da linha como JSON e inserindo no banco de dados
            const objeto = JSON.parse(linha);
            insert.run(objeto.ip, objeto.username, objeto.first_name, objeto.last_name, objeto.email, objeto.location, objeto.job_area, objeto.company, objeto.job_title, objeto.id, objeto.timestamp);
            console.log(`Linha ${numeroLinha}: JSON válido e inserido no banco de dados`, objeto);
        }catch (err) {
            console.error(`Linha ${numeroLinha}: JSON inválido`, linha);
            console.error(`Erro: ${err.message}`);
        }
    }
}

console.log('Inserido os dados no banco de dados...');
await lerEVeriicarJSON('access.log');
console.log('Finalizado a inserção dos dados no banco de dados.');



