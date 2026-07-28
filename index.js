const { Client, RichPresence } = require('discord.js-selfbot-v13');
const { Streamer } = require('@dank074/discord-video-stream');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => { res.send('✅ Luas Hub Kusursuz Slot & CF Analiz Aktif!'); });
app.listen(PORT, () => { console.log(`🌐 Web sunucusu ${PORT} portunda ayakta!`); });

const accounts = [
    {
        name: "Hesap 1 (Yayınlı + VIP Tasarım Analiz)",
        token: process.env.TOKEN_1,
        joinVoice: true, doStream: true, selfDeaf: true, selfMute: false, 
        // 👇 İŞTE BÜTÜN SORUN BURADAYDI, SENİN GERÇEK KANAL ID'LERİNİ GERİ KOYDUM 👇
        guildId: "1347302840682549299", 
        channelId: "1437706891290611782",
        owoFarm: true, farmChannelId: "1437706891290611782"
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
        // KUSURSUZ İSİM AYIKLAYICI VE ANALİZ MOTORU
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

                const extractName = (text, type) => {
                    let splitWord = type === 'cf' ? ' spent ' : ' bet ';
                    let idx = text.toLowerCase().lastIndexOf(splitWord);
                    if (idx === -1 && type === 'cf') {
                        splitWord = ' bet ';
                        idx = text.toLowerCase().lastIndexOf(splitWord);
                    }
                    if (idx === -1) return null;
                    
                    let namePart = text.substring(0, idx).replace(/\*/g, '').trim();
                    namePart = namePart.replace(/^(?:<a?:\w+:\d+>|[\u2700-\u27BF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|[\u200B-\u200D\uFEFF]|\||\[|\]|\s)+/, '').trim();
                    return namePart.toLowerCase();
                };

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

                        if (content.includes('coin spins')) {
                            player = extractName(rawContent, 'cf');
                            isLoss = content.includes('lost it all') || content.includes('lost');
                        } 
                        else if (content.includes('___slots___')) {
                            const lines = rawContent.split('\n');
                            if (lines.length > 1) {
                                player = extractName(lines[1], 'slot');
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

                        if (!isHistory && isWaitingResult && !isPaused) {
                            isWaitingResult = false;
                            isLoss ? autoBotStreak++ : (autoBotStreak = 0);
                            setTimeout(() => { makeNextBet(); }, 16000); 
                        }
                    }
                };

                // ZAMAN MAKİNESİ
                const fetchHistory = async () => {
                    try {
                        const messages = await farmChannel.messages.fetch({ limit: 50 });
                        messages.reverse().forEach(m => {
                            if (m.author.bot) processOwOMessage(m, true);
                        });
                        console.log(`📜 [ANALYTICS] Geçmiş kumar mesajları okundu, hafıza oluşturuldu!`);
                    } catch (e) { console.log("Geçmiş okunamadı:", e); }
                };
                fetchHistory();

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

                            // AKILLI İSİM EŞLEŞTİRİCİ (Artık nonxtr = LUAS | NONX sorunsuz eşleşecek!)
                            const targetWords = target.split(/[\s|]+/).filter(w => w.length > 2);
                            let foundKey = Object.keys(playerStats).find(k => {
                                if (k === target || k.includes(target) || target.includes(k)) return true;
                                return targetWords.some(w => k.includes(w) || w.includes(k));
                            });
                            
                            if (foundKey) target = foundKey;

                            let s = playerStats[target] || { cfW: 0, cfL: 0, sW: 0, sL: 0, streak: 0, max: 0 };
                            let cfT = s.cfW + s.cfL; let cfR = cfT > 0 ? ((s.cfW / cfT) * 100).toFixed(1) : 0;
                            let sT = s.sW + s.sL; let sR = sT > 0 ? ((s.sW / sT) * 100).toFixed(1) : 0;

                            const report = `> 📊 **ŞANS & RİSK RAPORU**\n` +
                                           `> 👤 **Oyuncu:** \`${target.toUpperCase()}\`\n> \n` +
                                           `> 🪙 **Coinflip (CF):** \`${s.cfW} Kazanma\` / \`${s.cfL} Kaybetme\` **(%${cfR})**\n` +
                                           `> 🎰 **Slot (WS):** \`${s.sW} Kazanma\` / \`${s.sL} Kaybetme\` **(%${sR})**\n> \n` +
                                           `> 🔥 **Anlık Kayıp Serisi:** \`${s.streak}\` | 💀 **Max Seri:** \`${s.max}\``;
                            
                            msg.edit(report).catch(() => {});
                        }
                        else if (cmd === 'owo dur') { 
                            isPaused = true; 
                            msg.edit("> 🛑 **ACİL FREN:** Oynamayı tamamen durdurdum.").catch(() => {}); 
                        }
                        else if (cmd === 'owo devam') {
                            isPaused = false; isVerifying = false; isWaitingResult = false;
                            msg.edit("> ✅ **SİSTEM AKTİF:** Otomatik WCF motoru ateşlendi! (16sn Korumalı)").catch(() => {});
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