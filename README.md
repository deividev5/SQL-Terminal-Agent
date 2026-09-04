# SQL Terminal Agent

Agente de terminal que converte perguntas em linguagem natural em consultas SQL (SQLite) usando IA (Google Gemini), executa a consulta com confirmação do usuário e responde com base nos dados retornados.

## Funcionalidades

- Chat interativo via terminal.
- Geração de consultas `SELECT` a partir de perguntas em português, usando o schema do banco como contexto.
- Validação de segurança da consulta gerada (bloqueia múltiplas instruções, comentários e comandos de escrita/alteração de esquema como `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `PRAGMA`, etc.).
- Confirmação manual antes de executar qualquer consulta no banco.
- Histórico de conversa mantido durante a sessão para dar contexto à IA.
- Scripts utilitários para gerar logs falsos e popular o banco de dados de teste.

## Estrutura do projeto

```
src/
  main.js       # Loop principal do chat (readline, IA, execução SQL)
  consulta.js   # Geração/validação da consulta SQL e resposta da IA
  banco.js      # Criação do banco de dados SQLite e tabela access_logs
scripts/
  logs_faker.js # Gera registros falsos (faker) em access.log
  read_logs.js  # Lê access.log e insere os registros no banco de dados
tests/
  consulta.test.js
```

## Pré-requisitos

- Node.js (com suporte a `node:sqlite`, `node --test` e `--env-file`).
- Chave de API do Google (Gemini) configurada em um arquivo `.env` na raiz do projeto (usada via `@ai-sdk/google`).

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto com a chave necessária para o provedor de IA, por exemplo:

```
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui
```

## Preparando o banco de dados

1. Criar o banco e a tabela `access_logs`:
   ```bash
   node src/banco.js
   ```
2. Gerar logs falsos de acesso:
   ```bash
   npm run faker
   ```
3. Importar os logs gerados (`access.log`) para o banco de dados:
   ```bash
   npm run read-logs
   ```

## Uso

Inicie o chat no terminal:

```bash
npm start
```

- Digite sua pergunta sobre os dados (ex.: "quantos usuários existem por cidade?").
- A IA irá propor uma consulta SQL; confirme com `s` para executar ou qualquer outra tecla para cancelar.
- Digite `sair` ou use `Ctrl+C` para encerrar o chat.

## Testes

```bash
npm test
```

## Segurança

O módulo [src/consulta.js](src/consulta.js) valida toda consulta gerada pela IA antes da execução: apenas comandos `SELECT`, sem `;`, sem comentários SQL e sem comandos de escrita/DDL são permitidos. Além disso, o banco é aberto em modo somente leitura (`readonly: true`) em [src/main.js](src/main.js) durante o chat.
