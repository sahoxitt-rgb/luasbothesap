const { Client, RichPresence } = require('discord.js-selfbot-v13');
const { Streamer } = require('@dank074/discord-video-stream');
const express = require('express');

// Render kapanmasın diye mini web sunucusu
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('✅ Luas Hub Çoklu Hesap & OwO Analiz Sistemi Aktif!');
});

app.listen(PORT, () => {
    console.log(`🌐 Web sunucusu ${PORT} portunda ayakta!`);
});

// 👇 PATRONUN (SENİN) DİSCORD HESAP ID'Sİ 👇
const SENIN_ASIL_HESAP_ID = "345821033414262794"; 

// ==========================================
// HESAP ÖZEL AYARLARI (4 HESAP TAM KADRO)
// ==========================================
const accounts = [
    {
        name: "Hesap 1 (Yayınlı + OwO Analiz & All-In)",
        token: process.env.TOKEN_1,
        joinVoice: true,
        doStream: true,  // Yayın AÇIK (Kırmızı Rozet)
        selfDeaf: true,  // Sadece kulaklık KAPALI
        selfMute: false, // Ses açık
        guildId: "1347302840682549299", 
        channelId: "1437706891290611782",
        owoFarm: true,
        farmChannelId: "1437706891290611782"
    },
    {
        name: "Hesap 2 (Sadece Profil)",
        token: process.env.TOKEN_2,
        joinVoice: false,
        doStream: false
    },
    {
        name: "Hesap 3 (Ses dan Kulaklık AÇIK - Yayın YOK)",
        token: process.env.TOKEN_3, 
        joinVoice: true,
        doStream: false, // Yayın KAPALI
        selfDeaf: false, // Kulaklık AÇIK
        selfMute: false, // Ses AÇIK
        guildId: "851097447568637985", 
        channelId: "899711321543692348" 
    },
    {
        name: "Hesap 4 (Kulaklık Kapalı + Ses Açık)",
        token: process.env.TOKEN_4, 
        joinVoice: true,
        doStream: false, // Yayın KAPALI
        selfDeaf: true,  // Kulaklık KAPALI
        selfMute: false, // Ses AÇIK
        guildId: "851097447568637985", 
        channelId: "995746188034842674" 
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
                console.log(`🔊 [${acc.name}] Sese giriliyor...`);
                
                await streamer.joinVoice(acc.guildId, acc.channelId, {
                    self_mute: acc.selfMute,
                    self_deaf: acc.selfDeaf,
                    self_video: false
                });

                if (acc.doStream) {
                    console.log(`🔴 [${acc.name}] Gerçek WebRTC Yayın köprüsü kuruluyor...`);
                    await streamer.createStream(); 
                }
                
                const guild = client.guilds.cache.get(acc.guildId);
                if (guild) {
                    guild.shard.send({
                        op: 4,
                        d: {
                            guild_id: acc.guildId,
                            channel_id: acc.channelId,
                            self_mute: acc.selfMute, 
                            self_deaf: acc.selfDeaf, 
                            self_video: false, 
                            self_stream: acc.doStream 
                        }
                    });
                }
                
                console.log(`🎤 [${acc.name}] Sese çivilendi!`);
                
            } catch (err) {
                console.log(`⚠️ [${acc.name}] Bağlanırken hata, 10 saniye sonra tekrar deneniyor.`);
                setTimeout(connectToVoice, 10000);
            }
        };

        if (acc.joinVoice && acc.guildId && acc.channelId) {
            connectToVoice();

            // ÖLÜMSÜZLÜK MODU (Sesten atılırlarsa 5 saniye içinde geri dönerler)
            client.on('voiceStateUpdate', (oldState, newState) => {
                if (oldState.member?.user.id === client.user.id) {
                    if (!newState.channelId || newState.channelId !== acc.channelId) {
                        console.log(`⚠️ [${acc.name}] Sesten atıldı veya koptu! 5 saniye içinde geri sızılıyor...`);
                        setTimeout(connectToVoice, 5000); 
                    }
                }
            });
        }

        // --- RİCH PRESENCE (ÇALIŞAN OYNUYOR GÖRÜNÜMÜ) ---
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
        setInterval(updatePresence, 30000); 
        console.log(`🎮 [${acc.name}] Profil yüklendi ve sabitlendi!`);

        // ==========================================
        // HESAP 1 İÇİN OWOMATİK ŞANS ANALİZİ VE ALL-IN MOTORU
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

                // Pray döngüsü
                setInterval(() => { 
                    if (!isVerifying && !isPaused) humanTypeAndSend("owo pray"); 
                }, 5 * 60 * 1000);

                const checkOwOMessage = (content) => {
                    if (isVerifying || isPaused) return; 

                    // 🚨 CAPTCHA YAKALAYICI 🚨
                    if (content.includes('verify') || content.includes('captcha') || content.includes('beep boop') || content.includes('real human')) {
                        isVerifying = true; 
                        console.log(`\n🚨🚨🚨 CAPTCHA GELDİ! SİSTEM DURDURULDU! 🚨🚨🚨\n`);
                        client.users.fetch(SENIN_ASIL_HESAP_ID).then(owner => {
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
                    if (msg.author.id === client.user.id) {
                        const userCmd = msg.content.toLowerCase().trim();

                        if (userCmd.includes('owo analiz')) {
                            console.log(`📊 [KOMUT] owo analiz komutu tetiklendi!`);
                            const totalGames = totalWins + totalLosses;
                            const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0;
                            const report = `📊 **OwO Canlı Şans ve Risk Analizi Raporu**\n` +
                                           `- **Toplam Çevrilen El:** ${totalGames}\n` +
                                           `- **Kazanan / Kaybeden:** ${totalWins} / ${totalLosses} (%${winRate} Başarı)\n` +
                                           `- **Anlık Kayıp Serisi:** ${currentLossStreak} el\n` +
                                           `- **Görülen En Uzun Kayıp Serisi:** ${maxLossStreak} el\n` +
                                           `- **Aktif Strateji:** Risk Analizli All-In (WCF All / WCF 1)`;
                            farmChannel.send(report).catch(err => console.log("Analiz gönderme hatası:", err));
                        }
                        else if (userCmd.includes('owo para')) {
                            farmChannel.send("owo cash").catch(() => {});
                        }
                        else if (userCmd.includes('owo devam')) {
                            if (isVerifying || isPaused) {
                                isVerifying = false; 
                                isPaused = false; 
                                isWaitingResult = false;
                                msg.reply("✅ Anlaşıldı patron, analiz ve farm motoru tekrar ateşlendi!").catch(() => {});
                                setTimeout(() => { makeNextBet(); }, 2000); 
                            }
                        }
                        else if (userCmd.includes('owo dur')) {
                            if (!isPaused) {
                                isPaused = true;
                                msg.reply("🛑 Sistem uyku moduna alındı patron. `owo devam` yazana kadar kılımı kıpırdatmam!").catch(() => {});
                            }
                        }
                        else if (userCmd.includes('owo sıfır') || userCmd.includes('owo sifir')) {
                            currentLossStreak = 0;
                            totalWins = 0;
                            totalLosses = 0;
                            gameHistory = [];
                            msg.reply("🔄 Analiz hafızası silindi patron! İstatistikler tertemiz.").catch(() => {});
                        }
                    }

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

    client.login(acc.token).catch(err => console.log(`⚠️ [${acc.name}] Token hatalı!`, err));
});