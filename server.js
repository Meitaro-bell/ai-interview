const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const OpenAI = require("openai");

// ★注意: 後でエディタでここにAPIキーを入れてください
// 【修正前】 const apiKey = "sk-xxxxxxxxxxxxxx";
// 【修正後】
const apiKey = process.env.OPENAI_API_KEY;

app.use(express.static('public'));

const SYSTEM_PROMPT = "あなたは面接官です。";
let chatHistory = [{ role: "system", content: SYSTEM_PROMPT }];

io.on('connection', (socket) => {
    console.log('ユーザーが接続しました');
    socket.on('chat message', async (msg) => {
        chatHistory.push({ role: "user", content: msg });
        try {
            const completion = await openai.chat.completions.create({
                messages: chatHistory,
                model: "gpt-4o-mini",
            });
            const aiResponse = completion.choices[0].message.content;
            chatHistory.push({ role: "assistant", content: aiResponse });
            io.emit('chat message', "面接官: " + aiResponse);
        } catch (error) {
            console.error("Error:", error);
            io.emit('chat message', "システム: APIキーが設定されていないか、エラーが発生しました。");
        }
    });
});

server.listen(8080, () => {
    console.log('listening on *:8080');
});
