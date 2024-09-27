require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');

const app = express();

const server = http.createServer(app);

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'templates'));

app.get('/', (req, res) => {
    res.render('useless');
});

const port = process.env.PORT || 10000;

server.listen(port, () => {
    console.log(`Monitor server started at ${port}`);
});

const brain = require('brain.js');
const fs = require('fs');

let under_training = false;

const net = new brain.recurrent.LSTM({
    hiddenLayers: [30],
    iterations: 200,
    leaningRate: 0.001,
    activation: 'sigmoid'
});

let trainingData = [];

const trainOptions = {
    iterations: 50,
    log: true,
    logPeriod: 1,
    learningRate: 0.05
  };

const saveTrainingData = () => {
    fs.writeFileSync('training-data.json', JSON.stringify(trainingData, null, 2));
}

const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.GuildMember
    ]
});

client.once('ready', () => {
    client.user.setActivity({
        type: ActivityType.Custom,
        name: "Use 'a!info' to learn more about me",
    });
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const channel = message.channel.id;

    if (channel !== "1289136657022586942") {
        return;
    }else {
        if (content == "a!info") {
            message.reply('I am an AI model made with Brain.js! Contact Developer (discord username): ru.dro');
            return;
        }else if (content == "a!train") {
            if (under_training) {
                message.channel.send("Already under training!");
            }else {
                message.channel.send("Started training.....");
                under_training = true;
                net.train(trainingData, trainOptions);
                message.channel.send(`Completed training! .... <data size = ${trainingData.length} >`);
                under_training = false;
                return;
            }
        }else {
            if (under_training) {
                message.reply("AI is under training! Check logs for info.");
            }else {
                const response = net.run(content);
                if (response) {
                    message.reply(response);
                    trainingData.push({ input: content, output: response });
                }else {
                    const fallBack = "I don't understand!";
                    message.reply(fallBack);
                }
            }
        }
    
        saveTrainingData();
    }
});

const bot_token = process.env.BOT_TOKEN;
client.login(bot_token);

if (fs.existsSync('training-data.json')) {
    trainingData = JSON.parse(fs.readFileSync('training-data.json', 'utf-8'));
    console.log('started initial training ....');
    under_training = true;
    net.train(trainingData, trainOptions);
    under_training = false;
    console.log('initial training completed');
}
