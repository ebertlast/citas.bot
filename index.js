const restify = require('restify');
const builder = require('botbuilder');

// Levantar restify
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s escuchando en %s', server.name, server.url);
});

const connector = new builder.ChatConnector({
    appId: '',
    appPassword: ''
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, `¿Cómo te llamas?`);
    },
    function (session, results) {
        session.dialogData.nombre = results.response.replace(/\b\w/g, l => l.toUpperCase());
        builder.Prompts.number(session, `Hola ${session.dialogData.nombre}, ¿Cuál es tu edad?`);
    },
    function (session, results) {
        session.dialogData.edad = results.response;
        builder.Prompts.time(session, `¿Qué hora es?`);
    },
    function (session, results) {
        session.dialogData.hora = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.choice(session, '¿Cuál prefieres?', 'Mar|Montaña', { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        session.dialogData.preferencia = results.response.entity;
        builder.Prompts.confirm(session, '¿Deseas visualizar el resumen?', { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        if (results.response) {
            session.endDialog(`Me contaste que tu nombre es **${session.dialogData.nombre}**, tienes **${session.dialogData.edad}** años, son las **${session.dialogData.hora}** y prefieres **${session.dialogData.preferencia}**...`);
        } else {
            session.endDialog('Adios');
        }
    }
])
.cancelAction('cancelarDialogAction', 'Cancelado', { matches: /^cancelar$/i })
.beginDialogAction('interrumpirDialogAction', '/Interrumpir', { matches: /^interrumpir$/i })
;

// Este diálogo se dispara cuando el usuario dice "interrumpir" en el alcance del diálogo raíz
// Se puede evitar la continuación llamando a la bandera "promptAfterAction"
bot.dialog('/Interrumpir', [
    function (session) {
        builder.Prompts.confirm(session, '¿Te gusta que te interrumpan?');
    },
    function (session, results) {
        if (results.response) {
            session.endDialog('A mí también');
        }
        else {
            session.endDialog('A mí tampoco');
        }
    }
]);