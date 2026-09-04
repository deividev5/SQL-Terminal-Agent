import {z} from 'zod';

// Esquema de validação para consultas SQL do tipo SELECT
export const consultaSchema = z.object({
    sql: z.string().trim().min(1, 'A consulta SQL não pode estar vazia')
}).superRefine((consulta, contexto) => {
    
    // Obtém a consulta SQL a partir do objeto de validação
    const sql = consulta.sql

    // Verifica se a consulta começa com SELECT
    if (!/^SELECT\b/i.test(sql)) {
        contexto.addIssue({
            code: "custom",
            message: "A consulta SQL deve ser do tipo SELECT"
        })
    }

    // Verifica se a consulta contém múltiplas instruções separadas por ponto e vírgula
    if (sql.includes(';')){
        contexto.addIssue({
            code: "custom",
            message: "Multiplas consultas não são permitidas"
        })
    }

    // Verifica se a consulta contém comentários
    if (/--|\/\*/.test(sql)) {
        contexto.addIssue({
            code: "custom",
            message: "Comentários não são permitidos"
        })
    }

    // Verifica se a consulta contém comandos de escrita ou alteração de esquema
    if(/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|PRAGMA)\b/i
      .test(sql)) {
        contexto.addIssue({
            code: "custom",
            message: "Somente consultas de leitura são permitidas"
        })
      }
})

// Função para gerar consultas SQL a partir de perguntas do usuário usando a IA
export async function gerarConsulta({ generateText, model, schema, historico, pergunta }) {
    const resultado = await generateText({
        model: model,
        system: `
         Você transforma perguntas em consultas SQLite.

         Retorne somente um JSON válido neste formato:
         {"sql":"SELECT ..."}

         Regras:
         - Gere apenas uma consulta SELECT.
         - Nunca use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE,
           REPLACE, ATTACH, DETACH ou PRAGMA.
         - Não use ponto e vírgula.
         - Não use comentários SQL.
         - Use apenas tabelas e colunas existentes no schema.
         - Não use markdown.
         - Se não puder responder, retorne:
           {"sql":""}

         Schema do banco:
         ${schema}
        `,
    //Guarda o histórico de mensagens anteriores
    messages: [
        ...historico,
        {role: 'user',
         content: pergunta
        }
    ]
    });

    let respostaDaIa;

    // Tenta analisar a resposta da IA como JSON
    try {
        respostaDaIa = JSON.parse(resultado.text);
    }catch {
        throw new Error("Resposta da IA não é um JSON válido");
    }

    // Valida a consulta gerada pela IA usando o schema definido
    const validacao = consultaSchema.safeParse(respostaDaIa);

    // Se a validação falhar, lança um erro com os detalhes dos problemas encontrados
    if(!validacao.success){
        const erros = validacao.error.issues
        .map(erro => erro.message)
        .join(', ');


        throw new Error(`Consulta inválida: ${erros}`);
    }

    // Retorna a consulta SQL validada
    return validacao.data.sql;
}

// Função para responder perguntas do usuário com base nos dados do banco de dados
export async function responderPergunta({ generateText, model, pergunta, dados }){
    const resultado = await generateText({
        model: model,

        system: `
          Você responde perguntas sobre um banco de dados.
          Responda em português do Brasil.
          Seja claro e objetivo.
          Use somente os dados fornecidos.
          Não invente informações.
          Não mostre o SQL para o usuário.
        `,

        // Prompt que será enviado à IA contendo a pergunta do usuário e os dados disponíveis
        prompt: `
          Pergunta do usuário: 
          ${pergunta}

          Resultado encontrado no banco:
          ${JSON.stringify(dados, null, 2)}
          
        `   
    });

    // Retorna a resposta da IA para a pergunta do usuário
  return resultado.text;
}