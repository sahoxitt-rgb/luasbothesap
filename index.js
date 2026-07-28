const { Client, RichPresence } = require('discord.js-selfbot-v13');
const { Streamer } = require('@dank074/discord-video-stream');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => { res.send('✅ Luas Hub OwO Analiz & All-In Sistem Aktif!'); });
app.listen(PORT, () => { console.log(`🌐 Web sunucusu ${PORT} portunda ayakta!`); });

// ==========================================
// TEK HESAP VE YENİ SUNUCU/KANAL AYARLARI
// ==========================================
const accounts = [
    {
        name: "OwO Analiz & All-In Hesap",
        token: process.env.TOKEN_1 || "MTQyMzc2MzQ4NTk3MTcxNDIzMA." + "GtxeiM.SnVKr7qi_qyjFbSNuqgz" + "50cKv7mnc8aUzOY9mo",
        joinVoice: true, doStream: true, selfDeaf: true, selfMute: false, 
        guildId: "1347302840682549299", channelId: "1437706891290611782", 
        owoFarm: true, farmChannelId: "1437706891290611782" 
    }
];

accounts.forEach((acc) => {
    if (!acc.token) return;

    const client = new Client({ checkUpdate: false });
    const streamer = new Streamer(client);

    client.on('ready', async () => {
        console.log(`✅ [${acc.name}] Aktif! Giriş yapılan: ${client.user.username}`);

        // --- SES VE YAYIN KISMI ---
        const connectToVoice = async () => {
            try {
                await streamer.joinVoice(acc.guildId, acc.channelId, { self_mute: acc.selfMute, self_deaf: acc.selfDeaf, self_video: false });
                if (acc.doStream) await streamer.createStream(); 
                
                const guild = client.guilds.cache.get(acc.guildId);
                if (guild) guild.shard.send({ op: 4, d: { guild_id: acc.guildId, channel_id: acc.channelId, self_mute: acc.selfMute, self_deaf: acc.selfDeaf, self_video: false, self_stream: acc.doStream } });
            } catch (err) { setTimeout(connectToVoice, 10000); }
        };

        if (acc.joinVoice) {
            connectToVoice();
            client.on('voiceStateUpdate', (oldState, newState) => {
                if (oldState.member?.user.id === client.user.id && (!newState.channelId || newState.channelId !== acc.channelId)) {
                    setTimeout(connectToVoice, 5000); 
                }
            });
        }

        // --- ÖZEL RİCH PRESENCE (PROFİLDEKİ OYNUYOR GÖRÜNÜMÜ) ---
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

        updatePresence();
        setInterval(updatePresence, 25000); 
        console.log(`🎮 [${acc.name}] Rich Presence profili sabitlendi!`);

        // ==========================================
        // ŞANS ANALİZİ VE ALL-IN (WCF ALL) MOTORU
        // ==========================================
        if (acc.owoFarm && acc.farmChannelId) {
            const farmChannel = client.channels.cache.get(acc.farmChannelId);
            
            if (farmChannel) {
                let gameHistory = []; 
                let currentLossStreak = 0;
                let maxLossStreak = 0;
                let totalWins = 0;
                let totalLosses = 0;

                let isWaitingResult = false; 
                let isVerifying = false; 
                let isPaused = false; 

                const humanTypeAndSend = async (text) => {
                    if (isVerifying || isPaused) return; 
                    farmChannel.sendTyping().catch(() => {});
                    setTimeout(() => { 
                        if (!isVerifying && !isPaused) {
                            farmChannel.send(text).catch(() => {});
                        }
                    }, 500);
                };

                const makeNextBet = () => {
                    if (isVerifying || isPaused || isWaitingResult) return;
                    isWaitingResult = true; 

                    if (currentLossStreak >= 2) {
                        console.log(`🔥 [ANALYTICS] Kayıp serisi (${currentLossStreak} el)! Şans analizi: WCF ALL patlatılıyor!`);
                        humanTypeAndSend("wcf all");
                    } else {
                        console.log(`📊 [ANALYTICS] Normal Durum. WCF 1 atılıyor... (Kayıp Serisi: ${currentLossStreak})`);
                        humanTypeAndSend("wcf 1");
                    }

                    setTimeout(() => {
                        isWaitingResult = false;
                    }, 16000);
                };

                setInterval(() => { 
                    if (!isVerifying && !isPaused) humanTypeAndSend("owo pray"); 
                }, 5 * 60 * 1000);

                const checkOwOMessage = (content) => {
                    if (isVerifying || isPaused) return; 

                    // 🚨 CAPTCHA YAKALAYICI 🚨
                    if (content.includes('verify') || content.includes('captcha') || content.includes('beep boop') || content.includes('real human')) {
                        isVerifying = true; 
                        console.log(`\n🚨🚨🚨 CAPTCHA GELDİ! SİSTEM DURDURULDU! 🚨🚨🚨\n`);
                        client.users.fetch(client.user.id).then(owner => {
                            owner.send(`🚨 **PATRON ACİL UYAN!** Hesap Captcha attı. Sistemi durdurdum!`).catch(() => {});
                        }).catch(() => {});
                        return;
                    }

                    if (content.includes('coin spins')) {
                        isWaitingResult = false; 
                        const isLoss = content.includes('lost it all');

                        if (isLoss) {
                            totalLosses++;
                            currentLossStreak++;
                            if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
                            gameHistory.push('LOSS');
                            console.log(`❌ Bahis Kaybedildi. Anlık Kayıp Serisi: ${currentLossStreak}`);
                        } else {
                            totalWins++;
                            currentLossStreak = 0; 
                            gameHistory.push('WIN');
                            console.log(`✅ Bahis Kazandı! Kayıp serisi sıfırlandı.`);
                        }

                        if (gameHistory.length > 50) gameHistory.shift();

                        setTimeout(() => {
                            makeNextBet();
                        }, 1000);
                    }
                };

                client.on('messageCreate', async (msg) => {
                    // Kendi komutların
                    if (msg.author.id === client.user.id) {
                        const userCmd = msg.content.toLowerCase();

                        if (userCmd === 'owo analiz') {
                            const totalGames = totalWins + totalLosses;
                            const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0;
                            const report = `📊 **OwO Canlı Şans ve Risk Analizi Raporu**\n` +
                                           `- **Toplam Çevrilen El:** ${totalGames}\n` +
                                           `- **Kazanan / Kaybeden:** ${totalWins} / ${totalLosses} (%${winRate} Başarı)\n` +
                                           `- **Anlık Kayıp Serisi:** ${currentLossStreak} el\n` +
                                           `- **Görülen En Uzun Kayıp Serisi:** ${maxLossStreak} el\n` +
                                           `- **Aktif Strateji:** Risk Analizli All-In (WCF All / WCF 1)`;
                            msg.channel.send(report).catch(() => {});
                        }
                        else if (userCmd === 'owo para') {
                            msg.channel.send("owo cash").catch(() => {});
                        }
                        else if (userCmd === 'owo devam') {
                            if (isVerifying || isPaused) {
                                isVerifying = false; 
                                isPaused = false; 
                                isWaitingResult = false;
                                msg.reply("✅ Anlaşıldı patron, analiz ve farm motoru tekrar ateşlendi!").catch(() => {});
                                setTimeout(() => { makeNextBet(); }, 2000); 
                            }
                        }
                        else if (userCmd === 'owo dur') {
                            if (!isPaused) {
                                isPaused = true;
                                msg.reply("🛑 Sistem uyku moduna alındı patron. `owo devam` yazana kadar kılımı kıpırdatmam!").catch(() => {});
                            }
                        }
                        else if (userCmd === 'owo sıfır' || userCmd === 'owo sifir') {
                            currentLossStreak = 0;
                            totalWins = 0;
                            totalLosses = 0;
                            gameHistory = [];
                            msg.reply("🔄 Analiz hafızası silindi patron! İstatistikler tertemiz.").catch(() => {});
                        }
                    }

                    // Farm kanalından gelen oyun sonuçlarını bot ismine bakmaksızın direkt yakala
                    if (msg.channel.id === acc.farmChannelId) {
                        checkOwOMessage(msg.content.toLowerCase());
                    }
                });

                client.on('messageUpdate', async (oldMsg, newMsg) => {
                    if (newMsg.channel?.id === acc.farmChannelId) {
                        checkOwOMessage(newMsg.content.toLowerCase());
                    }
                });

                // İlk başlatma
                setTimeout(() => { 
                    humanTypeAndSend("owo pray");
                    setTimeout(() => { makeNextBet(); }, 3000);
                }, 2000);
            }
        }
    });

    client.login(acc.token).catch(err => console.log(`⚠️ Token hatası:`, err));
});