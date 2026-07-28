const { Client, RichPresence } = require('discord.js-selfbot-v13');
const { Streamer } = require('@dank074/discord-video-stream');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => { res.send('✅ Luas Hub OwO Analiz Sistemi Aktif!'); });
app.listen(PORT, () => { console.log(`🌐 Web sunucusu ${PORT} portunda ayakta!`); });

const SENIN_ASIL_HESAP_ID = "345821033414262794"; 

const accounts = [
    {
        name: "Hesap 1 (Yayınlı + OwO Analiz & All-In)",
        token: process.env.TOKEN_1,
        joinVoice: true, doStream: true, selfDeaf: true, selfMute: false, 
        guildId: "1528838571975250091", channelId: "1531000417469599774",
        owoFarm: true, farmChannelId: "1531000417469599774"
    },
    { name: "Hesap 2", token: process.env.TOKEN_2, joinVoice: false, doStream: false },
    {
        name: "Hesap 3", token: process.env.TOKEN_3, 
        joinVoice: true, doStream: false, selfDeaf: false, selfMute: false, 
        guildId: "851097447568637985", channelId: "899711321543692348" 
    },
    {
        name: "Hesap 4", token: process.env.TOKEN_4, 
        joinVoice: true, doStream: false, selfDeaf: true, selfMute: false, 
        guildId: "851097447568637985", channelId: "995746188034842674" 
    }
];

accounts.forEach((acc) => {
    if (!acc.token) return;

    const client = new Client({ checkUpdate: false });
    const streamer = new Streamer(client);

    client.on('ready', async () => {
        console.log(`✅ [${acc.name}] Aktif!`);

        const connectToVoice = async () => {
            try {
                await streamer.joinVoice(acc.guildId, acc.channelId, { self_mute: acc.selfMute, self_deaf: acc.selfDeaf, self_video: false });
                if (acc.doStream) await streamer.createStream(); 
                
                const guild = client.guilds.cache.get(acc.guildId);
                if (guild) guild.shard.send({ op: 4, d: { guild_id: acc.guildId, channel_id: acc.channelId, self_mute: acc.selfMute, self_deaf: acc.selfDeaf, self_video: false, self_stream: acc.doStream } });
            } catch (err) { setTimeout(connectToVoice, 10000); }
        };

        if (acc.joinVoice && acc.guildId && acc.channelId) {
            connectToVoice();
            client.on('voiceStateUpdate', (oldState, newState) => {
                if (oldState.member?.user.id === client.user.id && (!newState.channelId || newState.channelId !== acc.channelId)) {
                    setTimeout(connectToVoice, 5000); 
                }
            });
        }

        const customStartTime = Date.now() - (5 * 24 * 60 * 60 * 1000);
        const updatePresence = () => {
            try {
                const status = new RichPresence(client)
                    .setApplicationId('1531119938851569774') 
                    .setType('PLAYING') 
                    .setName('best script /luashub') 
                    .setDetails('noxy x luashub') 
                    .setState('discord.gg/luashub') 
                    .setStartTimestamp(customStartTime) 
                    .addButton('Discord Sunucusu', 'https://discord.gg/luashub') 
                    .addButton('By LuasHub', 'https://discord.gg/luashub'); 
                client.user.setActivity(status);
            } catch (e) {}
        };
        updatePresence(); setInterval(updatePresence, 30000); 

        // ==========================================
        // ŞANS ANALİZİ MOTORU
        // ==========================================
        if (acc.owoFarm && acc.farmChannelId) {
            const farmChannel = client.channels.cache.get(acc.farmChannelId);
            
            if (farmChannel) {
                let gameHistory = []; 
                let currentLossStreak = 0; let maxLossStreak = 0; let totalWins = 0; let totalLosses = 0;
                let isWaitingResult = false; let isVerifying = false; let isPaused = false; 

                const humanTypeAndSend = async (text) => {
                    if (isVerifying || isPaused) return; 
                    farmChannel.sendTyping().catch(() => {});
                    setTimeout(() => { 
                        if (!isVerifying && !isPaused) farmChannel.send(text).catch(() => {});
                    }, 500);
                };

                const makeNextBet = () => {
                    if (isVerifying || isPaused || isWaitingResult) return;
                    isWaitingResult = true; 

                    if (currentLossStreak >= 2) {
                        humanTypeAndSend("wcf all");
                    } else {
                        humanTypeAndSend("wcf 1");
                    }
                    setTimeout(() => { isWaitingResult = false; }, 16000);
                };

                setInterval(() => { if (!isVerifying && !isPaused) humanTypeAndSend("owo pray"); }, 5 * 60 * 1000);

                const checkOwOMessage = (content) => {
                    if (isVerifying || isPaused) return; 

                    if (content.includes('verify') || content.includes('captcha') || content.includes('real human')) {
                        isVerifying = true; 
                        client.users.fetch(SENIN_ASIL_HESAP_ID).then(owner => {
                            owner.send(`🚨 **ACİL UYAN!** Hesap Captcha attı!`).catch(() => {});
                        }).catch(() => {});
                        return;
                    }

                    if (content.includes('coin spins')) {
                        isWaitingResult = false; 
                        if (content.includes('lost it all')) {
                            totalLosses++; currentLossStreak++;
                            if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
                        } else {
                            totalWins++; currentLossStreak = 0; 
                        }
                        setTimeout(() => { makeNextBet(); }, 1500);
                    }
                };

                client.on('messageCreate', async (msg) => {
                    // SENİN YAZDIĞIN KOMUTLARI GARANTİ YAKALAYACAK KISIM
                    if (msg.author.id === client.user.id) {
                        const content = msg.content.toLowerCase();

                        if (content.includes('owo analiz')) {
                            console.log(`📊 [KOMUT YAKALANDI] owo analiz raporu gönderiliyor!`);
                            const total = totalWins + totalLosses;
                            const rate = total > 0 ? ((totalWins / total) * 100).toFixed(1) : 0;
                            const report = `📊 **OwO Analizi**\n- **El:** ${total}\n- **K/K:** ${totalWins}/${totalLosses} (%${rate})\n- **Anlık Kayıp Serisi:** ${currentLossStreak}\n- **Max Kayıp Serisi:** ${maxLossStreak}`;
                            farmChannel.send(report).catch(() => {});
                        }
                        else if (content.includes('owo para')) farmChannel.send("owo cash").catch(() => {});
                        else if (content.includes('owo dur')) { isPaused = true; msg.reply("🛑 Sistem durduruldu!").catch(() => {}); }
                        else if (content.includes('owo devam')) {
                            isPaused = false; isVerifying = false; isWaitingResult = false;
                            msg.reply("✅ Sistem devam ediyor!").catch(() => {});
                            setTimeout(() => { makeNextBet(); }, 1000); 
                        }
                        else if (content.includes('owo sıfır') || content.includes('owo sifir')) {
                            currentLossStreak = 0; totalWins = 0; totalLosses = 0; maxLossStreak = 0;
                            msg.reply("🔄 Analiz hafızası silindi!").catch(() => {});
                        }
                    }

                    if (msg.channel.id === acc.farmChannelId) checkOwOMessage(msg.content.toLowerCase());
                });

                client.on('messageUpdate', async (oldMsg, newMsg) => {
                    if (newMsg.channel?.id === acc.farmChannelId) checkOwOMessage(newMsg.content.toLowerCase());
                });

                setTimeout(() => { humanTypeAndSend("owo pray"); setTimeout(() => { makeNextBet(); }, 3000); }, 2000);
            }
        }
    });

    client.login(acc.token).catch(err => console.log(`⚠️ Token hatası!`));
});