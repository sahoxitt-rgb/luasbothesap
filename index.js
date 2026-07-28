const { Client, RichPresence } = require('discord.js-selfbot-v13');
const { Streamer } = require('@dank074/discord-video-stream');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => { res.send('✅ Luas Hub Gelişmiş Zaman Makineli Analiz Aktif!'); });
app.listen(PORT, () => { console.log(`🌐 Web sunucusu ${PORT} portunda ayakta!`); });

const accounts = [
    {
        name: "Hesap 1 (Yayınlı + Zaman Makineli Analiz)",
        token: process.env.TOKEN_1,
        joinVoice: true, doStream: true, selfDeaf: true, selfMute: false, 
        guildId: "1528838571975250091", channelId: "1531000417469599774",
        owoFarm: true, farmChannelId: "1531000417469599774"
    }
];

accounts.forEach((acc) => {
    if (!acc.token) return;

    const client = new Client({ checkUpdate: false });
    const streamer = new Streamer(client);

    client.on('ready', async () => {
        console.log(`✅ [${acc.name}] Aktif! Giriş yapılan: ${client.user.username}`);

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
        // ZAMAN MAKİNELİ KÜRESEL ANALİZ MOTORU
        // ==========================================
        if (acc.owoFarm && acc.farmChannelId) {
            const farmChannel = client.channels.cache.get(acc.farmChannelId);
            
            if (farmChannel) {
                let playerStats = {}; 
                let isPaused = true; 
                let isWaitingResult = false; 
                let isVerifying = false; 
                let autoBotStreak = 0; 

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
                    if (autoBotStreak >= 2) humanTypeAndSend("wcf all");
                    else humanTypeAndSend("wcf 1");
                };

                setInterval(() => { if (!isVerifying && !isPaused) humanTypeAndSend("owo pray"); }, 5 * 60 * 1000);

                // Ortak Veri İşleme Fonksiyonu (Hem geçmişi hem canlıyı okur)
                const processOwOMessage = (msg, isHistory = false) => {
                    if (isVerifying && !isHistory) return; 
                    const content = msg.content.toLowerCase();
                    const rawContent = msg.content; 

                    if (!isHistory && (content.includes('verify') || content.includes('captcha') || content.includes('real human'))) {
                        isVerifying = true; 
                        isPaused = true;
                        return;
                    }

                    if (content.includes('coin spins') || content.includes('___slots___')) {
                        let player = null;
                        let isLoss = false;

                        // Coinflip İsim Çözücü
                        if (content.includes('coin spins')) {
                            const match = rawContent.match(/\*\*(.*?)\*\*/);
                            if (match) player = match[1].trim().toLowerCase();
                            isLoss = content.includes('lost it all');
                        } 
                        // Slot İsim Çözücü (Çok daha hassas)
                        else if (content.includes('___slots___')) {
                            const lines = rawContent.split('\n');
                            if (lines.length > 1) {
                                const betLine = lines[1];
                                const betIndex = betLine.toLowerCase().lastIndexOf(' bet ');
                                const pipeIndex = Math.max(betLine.lastIndexOf('|'), betLine.lastIndexOf(']'));
                                
                                if (betIndex !== -1 && pipeIndex !== -1 && betIndex > pipeIndex) {
                                    player = betLine.substring(pipeIndex + 1, betIndex).trim().toLowerCase();
                                }
                            }
                            isLoss = content.includes('won nothing') || content.includes('lost');
                        }

                        if (player) {
                            if (!playerStats[player]) {
                                playerStats[player] = { cfW: 0, cfL: 0, sW: 0, sL: 0, streak: 0, max: 0 };
                            }
                            const s = playerStats[player];

                            if (content.includes('coin spins')) {
                                isLoss ? s.cfL++ : s.cfW++;
                            } else {
                                isLoss ? s.sL++ : s.sW++;
                            }

                            if (isLoss) {
                                s.streak++;
                                if (s.streak > s.max) s.max = s.streak;
                            } else {
                                s.streak = 0;
                            }
                        }

                        // Canlı oyundaysa kendi hamlesini tetikle
                        if (!isHistory && isWaitingResult && !isPaused) {
                            isWaitingResult = false;
                            isLoss ? autoBotStreak++ : (autoBotStreak = 0);
                            setTimeout(() => { makeNextBet(); }, 16000); 
                        }
                    }
                };

                // ⏳ BOTA ZAMAN MAKİNESİ (GEÇMİŞİ OKUMA) EKLENDİ ⏳
                const fetchHistory = async () => {
                    try {
                        const messages = await farmChannel.messages.fetch({ limit: 50 });
                        messages.reverse().forEach(m => {
                            if (m.author.bot) processOwOMessage(m, true);
                        });
                        console.log(`📜 [ANALYTICS] Geçmiş 50 kumar mesajı okundu, hafıza oluşturuldu!`);
                    } catch (e) { console.log("Geçmiş okunamadı:", e); }
                };
                fetchHistory(); // Bot başlar başlamaz geçmişi çeker

                client.on('messageCreate', async (msg) => {
                    if (msg.author.id === client.user.id) {
                        const cmd = msg.content.toLowerCase().trim();

                        if (cmd.startsWith('owo analiz')) {
                            let target = client.user.username.toLowerCase(); 
                            if (client.user.globalName) target = client.user.globalName.toLowerCase();

                            const args = cmd.split(' ');
                            if (msg.mentions.users.size > 0) {
                                let u = msg.mentions.users.first();
                                target = u.globalName ? u.globalName.toLowerCase() : u.username.toLowerCase();
                            } else if (args.length > 2) {
                                target = args.slice(2).join(' ').toLowerCase();
                            }

                            let foundKey = Object.keys(playerStats).find(k => k.includes(target) || target.includes(k));
                            if (foundKey) target = foundKey;

                            let s = playerStats[target] || { cfW: 0, cfL: 0, sW: 0, sL: 0, streak: 0, max: 0 };
                            let cfT = s.cfW + s.cfL; let cfR = cfT > 0 ? ((s.cfW / cfT) * 100).toFixed(1) : 0;
                            let sT = s.sW + s.sL; let sR = sT > 0 ? ((s.sW / sT) * 100).toFixed(1) : 0;

                            const report = `📊 **ŞANS & RİSK RAPORU** | 👤 **${target.toUpperCase()}**\n` +
                                           `🪙 **Coinflip (CF):** ${s.cfW} Kazanma / ${s.cfL} Kaybetme (%${cfR})\n` +
                                           `🎰 **Slot (WS):** ${s.sW} Kazanma / ${s.sL} Kaybetme (%${sR})\n` +
                                           `🔥 **Anlık Kayıp Serisi:** ${s.streak} | 💀 **Max Seri:** ${s.max}`;
                            
                            msg.edit(report).catch(() => {});
                        }
                        else if (cmd === 'owo dur') { 
                            isPaused = true; 
                            msg.edit("🛑 **ACİL FREN:** Oynamayı tamamen durdurdum.").catch(() => {}); 
                        }
                        else if (cmd === 'owo devam') {
                            isPaused = false; isVerifying = false; isWaitingResult = false;
                            msg.edit("✅ **SİSTEM AKTİF:** Otomatik WCF motoru ateşlendi! (16sn Korumalı)").catch(() => {});
                            makeNextBet(); 
                        }
                    }

                    if (msg.channel.id === acc.farmChannelId && msg.author.bot) processOwOMessage(msg, false);
                });

                client.on('messageUpdate', async (oldMsg, newMsg) => {
                    if (newMsg.channel?.id === acc.farmChannelId && newMsg.author?.bot) processOwOMessage(newMsg, false);
                });
            }
        }
    });

    client.login(acc.token).catch(err => console.log(`⚠️ Token hatası!`));
});