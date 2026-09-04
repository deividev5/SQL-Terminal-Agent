import {fakerPT_BR} from '@faker-js/faker';
import {createWriteStream} from 'node:fs';

//Criando um arquivo de log com 1000 registros falsos
const file = createWriteStream('access.log');
const totalLogs = 100;
let index = 0;

//função para escrever os Logs no arquivo access.log
function writeLogs() {
    while (index < totalLogs) {
    const log = {
    ip: fakerPT_BR.internet.ip(),
    username: fakerPT_BR.internet.username(),
    first_name: fakerPT_BR.person.firstName(),
    last_name: fakerPT_BR.person.lastName(),
    email: fakerPT_BR.internet.email(),
    location: fakerPT_BR.location.city(),
    job_area: fakerPT_BR.person.jobArea(),
    company: fakerPT_BR.company.name(),
    job_title: fakerPT_BR.person.jobTitle(),
    id: fakerPT_BR.string.uuid(),
    timestamp: new Date().toISOString()   
    };

    index++;

    //Escrevendo os logs no arquivo access.log
    if (!file.write(JSON.stringify(log) + '\n')) {
        file.once('drain', writeLogs);
        return;
    }
}
    //Fechando o arquivo de log
    file.end(() => {
        console.log(`${totalLogs} logs gerados e salvos em access.log `);
    })
}

//Tratando erros de escrita no arquivo
file.on(`error`, console.error);

//Chamando a função para escrever os logs no arquivo access.log
writeLogs();




    