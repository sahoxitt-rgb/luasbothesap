const { Client, RichPresence } = require('discord.js-selfbot-v13');
const { Streamer } = require('@dank074/discord-video-stream');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => { res.send('✅ Luas Hub AFK, Silici & Gölge İspiyoncu Aktif!'); });
app.listen(PORT, () => { console.log(`🌐 Web sunucusu ${PORT} portunda ayakta!`); });

const accounts = [
    {
        name: "Hesap 1 (Ana Hesap)",
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

    // HAFIZA DEĞİŞKENLERİ
    let isAfk = false;
    let afkReason = "";
    let smActive = false; // Gölge İspiyoncu (Sniper) Kapalı Başlar

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
                    .setDetails('noxy <3') 
                    .setState('discord.gg/luashub') 
                    .setStartTimestamp(customStartTime) 
                    .addButton('Discord Sunucusu', 'https://discord.gg/luashub') 
                    .addButton('By LuasHub', 'https://discord.gg/luashub'); 
                client.user.setActivity(status);
            } catch (e) {}
        };
        updatePresence(); setInterval(updatePresence, 30000); 

        // ==========================================
        // ZAMAN MAKİNELİ OWO MOTORU
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
                    setTimeout(() => { if (!isVerifying && !isPaused) farmChannel.send(text).catch(() => {}); }, 500);
                };

                const makeNextBet = () => {
                    if (isVerifying || isPaused || isWaitingResult) return;
                    isWaitingResult = true; 
                    if (autoBotStreak >= 2) humanTypeAndSend("wcf all");
                    else humanTypeAndSend("wcf 1");
                };

                setInterval(() => { if (!isVerifying && !isPaused) humanTypeAndSend("owo pray"); }, 5 * 60 * 1000);

                const processOwOMessage = (msg, isHistory = false) => {
                    if (isVerifying && !isHistory) return; 
                    const content = msg.content.toLowerCase();
                    const rawContent = msg.content; 

                    if (!isHistory && (content.includes('verify') || content.includes('captcha') || content.includes('real human'))) {
                        isVerifying = true; isPaused = true; return;
                    }

                    if (content.includes('coin spins') || content.includes('___slots___')) {
                        let player = null; let isLoss = false;

                        if (content.includes('coin spins')) {
                            const match = rawContent.match(/\*\*(.*?)\*\*/);
                            if (match) player = match[1].trim().toLowerCase();
                            isLoss = content.includes('lost it all');
                        } 
                        else if (content.includes('___slots___')) {
                            const lines = rawContent.split('\n');
                            if (lines.length > 1) {
                                const betLine = lines[1];
                                const betIndex = betLine.toLowerCase().lastIndexOf(' bet ');
                                if (betIndex !== -1) {
                                    let leftPart = betLine.substring(0, betIndex).trim();
                                    player = leftPart.replace(/^[^\s]+\s+/, '').trim().toLowerCase(); 
                                }
                            }
                            isLoss = content.includes('won nothing') || content.includes('lost');
                        }

                        if (player) {
                            if (!playerStats[player]) playerStats[player] = { cfW: 0, cfL: 0, sW: 0, sL: 0, streak: 0, max: 0 };
                            const s = playerStats[player];

                            if (content.includes('coin spins')) isLoss ? s.cfL++ : s.cfW++;
                            else isLoss ? s.sL++ : s.sW++;

                            if (isLoss) { s.streak++; if (s.streak > s.max) s.max = s.streak; } 
                            else { s.streak = 0; }
                        }

                        if (!isHistory && isWaitingResult && !isPaused) {
                            isWaitingResult = false;
                            isLoss ? autoBotStreak++ : (autoBotStreak = 0);
                            setTimeout(() => { makeNextBet(); }, 16000); 
                        }
                    }
                };

                const fetchHistory = async () => {
                    try {
                        const messages = await farmChannel.messages.fetch({ limit: 50 });
                        messages.reverse().forEach(m => { if (m.author.bot) processOwOMessage(m, true); });
                    } catch (e) { }
                };
                fetchHistory();

                client.on('messageUpdate', async (oldMsg, newMsg) => {
                    if (newMsg.channel?.id === acc.farmChannelId && newMsg.author?.bot) processOwOMessage(newMsg, false);
                });

                client.on('messageCreate', async (msg) => {
                    if (msg.channel.id === acc.farmChannelId && msg.author.bot) processOwOMessage(msg, false);
                });
            }
        }
    });

    // ==========================================
    // 🕵️‍♂️ SİLİNEN MESAJLARI YAKALAMA MOTORU (SNİPER)
    // ==========================================
    client.on('messageDelete', async (delMsg) => {
        // SM Aktif değilse, mesaj kendine aitse veya içeriği okunamıyorsa boşver
        if (!smActive || delMsg.author?.id === client.user.id || !delMsg.content) return;

        try {
            const log = `> 🗑️ **[SİLİNEN MESAJ YAKALANDI]**\n> 👤 **Kişi:** \`${delMsg.author.username}\`\n> 📍 **Kanal:** <#${delMsg.channel.id}>\n> 📝 **Mesaj:** ${delMsg.content}`;
            
            // Kendi DM kutuna (Notlar kısmına) mesajı gönderir
            await client.user.send(log).catch(()=>{});
        } catch(e) { }
    });

    // ==========================================
    // MESAJ & KOMUT MOTORU
    // ==========================================
    client.on('messageCreate', async (msg) => {

        if (msg.author.id !== client.user.id && isAfk) {
            if (msg.mentions.has(client.user.id)) {
                msg.reply(`> 💤 **Şu an AFK'yım:** \`${afkReason}\``).catch(() => {});
            }
        }

        if (msg.author.id === client.user.id) {
            
            if (isAfk && !msg.content.toLowerCase().startsWith('.afk')) {
                isAfk = false;
                msg.reply("> 🟢 **AFK Modu Kapatıldı:** Tekrar hoş geldin!").catch(() => {});
            }

            const cmd = msg.content.toLowerCase().trim();
            const args = msg.content.split(' ');

            // 💤 .afk [sebep]
            if (cmd.startsWith('.afk')) {
                let reason = msg.content.substring(4).trim() || "Bilgisayar başında değilim.";
                isAfk = true; afkReason = reason;
                msg.edit(`> 💤 **AFK Modu Aktif Edildi**\n> 📝 **Sebep:** \`${reason}\`\n> 🔔 Biri beni etiketlediğinde otomatik cevap verilecek.`).catch(()=>{});
            }

            // 🖼️ .avatar
            else if (cmd.startsWith('.avatar')) {
                let target = msg.mentions.users.first() || client.user;
                if (!msg.mentions.users.first() && args[1]) {
                    try { target = await client.users.fetch(args[1]); } catch(e) {}
                }
                let url = target.displayAvatarURL({ dynamic: true, size: 4096 });
                msg.edit(`> 🖼️ **${target.username}** adlı kişinin avatarı:\n> ${url}`).catch(()=>{});
            }

            // 🕵️‍♂️ .sm aktif / .sm kapalı (Gölge İspiyoncu)
            else if (cmd.startsWith('.sm')) {
                let state = args[1] ? args[1].toLowerCase() : '';
                
                if (state === 'aktif') {
                    smActive = true;
                    msg.edit(`> 🕵️‍♂️ **Gölge İspiyoncu (SM) Aktif:** Biri mesajını sildiği an kendi özel mesaj (DM) kutuna kanıtıyla düşecek!`).catch(()=>{});
                } else if (state === 'kapalı') {
                    smActive = false;
                    msg.edit(`> 🛑 **Gölge İspiyoncu (SM) Kapatıldı.** Artık silinen mesajlar izlenmiyor.`).catch(()=>{});
                } else {
                    msg.edit(`> ⚠️ **Hatalı Kullanım:** Lütfen \`.sm aktif\` veya \`.sm kapalı\` yaz.`).catch(()=>{});
                }
            }
            
            // 🧹 .sil [sayı] (Kendi attığın mesajları süpürür)
            else if (cmd.startsWith('.sil')) {
                let amount = parseInt(args[1]) || 5; 
                msg.edit(`> 🧹 Son ${amount} mesajım siliniyor...`).catch(()=>{});
                
                try {
                    const msgs = await msg.channel.messages.fetch({ limit: 100 });
                    const myMsgs = msgs.filter(m => m.author.id === client.user.id);
                    
                    let deletedCount = 0;
                    myMsgs.forEach(m => {
                        if (deletedCount <= amount) {
                            m.delete().catch(()=>{});
                            deletedCount++;
                        }
                    });
                } catch(e) { }
            }
        }
    });

    client.login(acc.token).catch(err => console.log(`⚠️ Token hatası!`));
});