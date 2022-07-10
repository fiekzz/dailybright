import { config } from 'dotenv';
import fs from 'fs';
import { parse } from 'node-html-parser';
import axios from "axios";
import TelegramBot from 'node-telegram-bot-api';
import he from 'he';

config()

const TelegramToken = process.env.TELEGRAM_API_KEY

const Bot = new TelegramBot(TelegramToken, { polling: true });

const Commands = ['/start','/help','/hello','/search_encyclopedia','/random_encyclopedia']

const URL = 'https://www.encyclopedia.com/science-and-technology/technology/technology-terms-and-concepts/';

const rawdata = fs.readFileSync('dict-st.json');

const student = JSON.parse(rawdata);

const Parser = (res) => {
    try {
        const root = parse(res.data)

        const getContent = root.querySelector('.doccontentwrapper')

        const string = getContent.toString().replace(/(<([^>]+)>)/gi, "")

        return string
        
    } catch (error) {
        return -1
    }

}
const MAX_CHAR = 4096

Bot.on('message', (msg) => {

    const chatID = msg.chat.id;

    switch(msg.text) {
        case Commands[0]:
            Bot.sendChatAction(chatID, 'typing');
            Bot.sendMessage(chatID, 'Hello, I am the encyclopedia bot. I can search for articles in the encyclopedia.\n\n/help - show this message\n/hello - say hello\n/search_encyclopedia - search for an article\n/random_encyclopedia - search for a random article');
            break;
        case Commands[1]:
            Bot.sendChatAction(chatID, 'typing');
            Bot.sendMessage(chatID, 'Hello, I am the encyclopedia bot. I can search for articles in the encyclopedia.\n\n/help - show this message\n/hello - say hello\n/search_encyclopedia - search for an article\n/random_encyclopedia - search for a random article');
            break;
        case Commands[2]:
            Bot.sendChatAction(chatID, 'typing');
            Bot.sendMessage(chatID, 'Hello there, let\'s talk about science and technology!');
            break;
        case Commands[3]:
            Bot.sendChatAction(chatID, 'typing');
            Bot.sendMessage(chatID, 'Enter the name of the article you want to search for:', {
                reply_markup: {
                    force_reply: true,
                    selective: true
                }
            }).then((sentMessage) => {
                Bot.onReplyToMessage(sentMessage.chat.id, sentMessage.message_id, (reply) => {

                    Bot.sendChatAction(chatID, 'typing');
                    Bot.sendMessage(chatID, 'Searching for ' + reply.text + '...');

                    axios.get(`${URL}${reply.text}`)
                        .then((res) => {
                            const result = Parser(res)

                            if(result !== -1)
                            {
                                const string = `${reply.text}\n\n${result}`
                                Printmessage(chatID,string)
                            }
                        }
                        ).catch((err) => {
                            Bot.sendChatAction(chatID, 'typing');
                            Bot.sendMessage(chatID, 'Article not found');
                        }
                    )
                })
            })
            break;
        case Commands[4]:
            Bot.sendChatAction(chatID, 'typing');
            Bot.sendMessage(chatID, 'Searching for a random article...');

            const randomNum = Math.floor(Math.random() * student.length)
            
            axios.get(`${URL}${student[randomNum].title}`)
            .then((res) => {
                const result = Parser(res)

                const string = `${student[randomNum].title}\n\n${result}`

                Printmessage(chatID,string)

            })
        break;
    }
})

const stringDecoder = (string) => {
    return he.decode(string)
}

const Printmessage = (chatID, string) => {

    const stringarray = string.split('')

    Bot.sendChatAction(chatID, 'typing');

    if(stringarray.length > MAX_CHAR)
    {
        var i = 0;
        const go = () => {
            const toSend = stringDecoder(stringarray.slice(i, i + MAX_CHAR).join(''))
            Bot.sendMessage(chatID, toSend)
            i += MAX_CHAR
            if(i < stringarray.length)
            {
                setTimeout(go, 2000)
            }
        }
        go()

    } else {
        Bot.sendMessage(chatID, stringDecoder(string));
    }
}