import 'dotenv/config';
import express from 'express';
import {
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { Client, GatewayIntentBits } from 'discord.js'; // Importar discord.js
import { getRandomEmoji } from './utils.js';

// Crear cliente de Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Respuestas predefinidas
const respuestas = {
  "¿qué son las nif?": "Las NIF son un conjunto de normas y conceptos que regulan la elaboración y presentación de la información contenida en los estados financieros en México.",
  "¿quién emite las nif en méxico?": "Las NIF son emitidas por el Consejo Mexicano de Normas de Información Financiera (CINIF).",
  "¿cuál es el objetivo principal de las nif?": "Su objetivo es establecer las bases para presentar información financiera útil para la toma de decisiones económicas.",
  "¿qué empresas deben aplicar las nif?": "Todas las entidades económicas que preparen estados financieros en México, independientemente de su tamaño o giro.",
  "¿cuántas series de nif existen?": "Existen cinco series principales: Serie A (Marco Conceptual), B (Normas aplicables a los estados financieros), C (Normas sobre conceptos específicos), D (Normas sobre problemas de determinación de resultados) y E (Normas para industrias especializadas).",
  "¿qué contiene la serie a de las nif?": "Contiene el marco conceptual, incluyendo postulados básicos, características cualitativas de los estados financieros y los objetivos de la información financiera.",
  "¿qué estados financieros deben elaborarse según las nif?": "Estado de situación financiera, estado de resultados, estado de variaciones en el capital contable, estado de flujos de efectivo y notas a los estados financieros.",
  "¿qué es un postulado básico según las nif?": "Son fundamentos que deben regir la elaboración de la información financiera, como la entidad económica, el negocio en marcha o la devengación contable.",
  "¿qué es la “entidad económica” en las nif?": "Es el ente identificado que realiza actividades económicas, independiente de sus propietarios o socios.",
  "¿cuál es la diferencia entre nif y ifrs?": "Las NIF son normas mexicanas, mientras que las IFRS (Normas Internacionales de Información Financiera) son normas globales emitidas por el IASB. Sin embargo, ambas buscan mejorar la calidad y comparabilidad de la información financiera.",
};

// Escuchar eventos de mensajes
client.on('messageCreate', (message) => {
  if (message.author.bot) return; // Ignorar mensajes de otros bots

  const pregunta = message.content.toLowerCase();
  if (respuestas[pregunta]) {
    message.reply(respuestas[pregunta]); // Responder con la respuesta correspondiente
  }
});

// Iniciar sesión en Discord
client.login(process.env.DISCORD_TOKEN);

// Código existente para manejar comandos slash
const app = express();
const PORT = process.env.PORT || 3000;

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { type, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `hello world ${getRandomEmoji()}`,
        },
      });
    }

    if (name === 'pregunta') {
      const pregunta = data.options[0].value;
      const respuesta = respuestas[pregunta.toLowerCase()] || `No tengo una respuesta para: "${pregunta}".`;
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: respuesta,
        },
      });
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
