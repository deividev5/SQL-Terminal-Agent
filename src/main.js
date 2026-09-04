import readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
import { generateText } from 'ai';
import { gerarConsulta, responderPergunta } from './consulta.js';
import { DatabaseSync } from 'node:sqlite';
import {google} from '@ai-sdk/google';

// Inicializando o modelo de IA do Google Gemini 3 Flash Preview
const model = google('gemini-3-flash-preview');

// Constantes para cores de saída no terminal
const cores = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  azul: '\x1b[34m',
  amarelo: '\x1b[33m',
  vermelho: '\x1b[31m',
  ciano: '\x1b[36m',
  cinza: '\x1b[90m'
};

//Criando a interface de leitura e resposta
const rl = readline.createInterface({input, output});

// Conexão com o banco de dados SQLite em modo somente leitura
const database = new DatabaseSync('database.db', {
    readonly: true
});

// Tratamento do sinal SIGINT (Ctrl+C) para encerrar o chat de forma adequada
process.on('SIGINT', () => {
    console.log(`${cores.ciano}\nChat encerrado pelo usuário.${cores.reset}`);
    database.close();
    rl.close();
    process.exit(0);
});

// Obtendo o esquema do banco de dados SQLite
const schema = database.prepare(`
    SELECT name, sql
    FROM sqlite_master
    WHERE type='table'
      AND name NOT LIKE 'sqlite_%';
    `)
    .all()
    .map(tabela => tabela.sql)
    .join('\n');

    
//Constante para armazenar o histórico de mensagens do chat
const historico = [];

// Início do chat
console.log(`${cores.ciano}Chat iniciado. Digite "sair" para encerrar.${cores.reset}`);


while(true) {

    let pergunta;

    // Pergunta do usuário no terminal
    try{
        pergunta = await rl.question(`${cores.azul}Você: ${cores.reset}`);
    } catch (erro) {
        if (erro.name === 'AbortError') {
            break;
        }
        throw erro;
    }
    
    

    //Se o usuário quiser sair do chat
    if (pergunta.trim().toLowerCase() === 'sair') {
        break;
    }

    // Se a pergunta estiver vazia, continua para a próxima iteração do loop
    if (!pergunta.trim()){
        continue;
    }

    try{
        // Gera a consulta SQL com base na pergunta do usuário
        const sql = await gerarConsulta({generateText, model, schema, historico, pergunta});

        // Mostra a consulta SQL que a IA deseja executar
        console.log(`${cores.amarelo}\nA IA quer executar esta consulta:\n${sql}${cores.reset}`)

        // Pergunta ao usuário se deseja executar a consulta SQL
        const confirmacao = await rl.question(
          `${cores.amarelo}\nDeseja executar? (s/n): ${cores.reset}`  
        );

        // Se o usuário não confirmar, cancela a execução da consulta SQL
        if (confirmacao.trim().toLowerCase() !== 's') {
            console.log(`${cores.vermelho}Consulta cancelada. \n${cores.reset}`)
            continue;
        }

        // Executa a consulta SQL no banco de dados e obtém os dados resultantes
        const dados = database
        .prepare(sql)
        .all();

        // Chama a função que responde à pergunta do usuário com base nos dados obtidos
        const resposta = await responderPergunta({generateText, model, pergunta, dados});


        // Mostra a resposta da IA para o usuário
        console.log(`${cores.verde}IA: ${resposta}\n${cores.reset}`);

        // Atualiza o histórico com a pergunta do usuário e a resposta da IA
        historico.push(
            {role: 'user', content: pergunta},
            {role: 'assistant', content: resposta}

        );
    } catch (erro){
        console.error(`${cores.vermelho}Erro ao chamar a IA: ${erro.message}${cores.reset}`);
    }

}
// Fecha a conexão com o banco de dados e a interface de leitura, encerrando o chat
database.close();
rl.close();
console.log(`${cores.ciano}Chat encerrado.${cores.reset}`);