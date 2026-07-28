const { Client, RichPresence } = require('discord.js-selfbot-v13');
const { Streamer } = require('@dank074/discord-video-stream');
const express = require('express');

// Render kapanmasın diye mini web sunucusu
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('✅ Luas Hub 16sn WH & Çoklu Hesap Sistemi Aktif!');
});

app.listen(PORT, () => {
    console.log(`🌐 Web sunucusu ${PORT} portunda ayakta!`);
});

// 👇 PATRONun (SENİN) DİSCORD HESAP ID'Sİ 👇
const SENIN_ASIL_HESAP_ID = "345821033414262794"; 

// ==========================================
// HESAP ÖZEL AYARLARI (4 HESAP TAM KADRO)
// ==========================================
const accounts = [
    {
        name: "Hesap 1 (Yayınlı + 16sn WH Döngüsü)",
        token: process.env.TOKEN_1,
        joinVoice: true,
        doStream: true,  // Yayın AÇIK (Kırmızı Rozet)
        selfDeaf: true,  // Sadece kulaklık KAPALI
        selfMute: false, // Ses açık
        guildId: "1528838571975250091", 
        channelId: "1531000417469599774",
        whFarm: true,
        farmChannelId: "1531000417469599774"
    },
    {
        name: "Hesap 2 (Sadece Profil)",
        token: process.env.TOKEN_2,
        joinVoice: false,
        doStream: false
    },
    {
        name: "Hesap 3 (Ses ve Kulaklık AÇIK - Yayın YOK)",
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
        // HESAP 1 İÇİN 16 SANİYEDE BİR WH DÖNGÜSÜ & CAPTCHA KORUMASI
        // ==========================================
        if (acc.whFarm && acc.farmChannelId) {
            const farmChannel = client.channels.cache.get(acc.farmChannelId);
            
            if (farmChannel) {
                let isVerifying = false;

                const sendWh = () => {
                    if (isVerifying) return;
                    farmChannel.sendTyping().catch(() => {});
                    setTimeout(() => {
                        if (!isVerifying) {
                            farmChannel.send("wh").catch(() => {});
                            console.log(`📤 [WH] "wh" komutu gönderildi.`);
                        }
                    }, 500);
                };

                // Tam 16 saniyede bir wh atma döngüsü
                const whInterval = setInterval(() => {
                    if (!isVerifying) {
                        sendWh();
                    }
                }, 16000);

                // Captcha / Doğrulama Yakalayıcı
                const checkCaptcha = (content) => {
                    if (content.includes('verify') || content.includes('captcha') || content.includes('beep boop') || content.includes('real human')) {
                        isVerifying = true;
                        clearInterval(whInterval); // Döngüyü tamamen durdur
                        console.log(`\n🚨🚨🚨 CAPTCHA GELDİ! 16SN WH DÖNGÜSÜ DURDURULDU! 🚨🚨🚨\n`);
                        
                        client.users.fetch(SENIN_ASIL_HESAP_ID).then(owner => {
                            owner.send(`🚨 **PATRON ACİL UYAN!** Hesap Captcha attı. 16sn WH döngüsünü durdurdum!`).catch(() => {});
                        }).catch(() => {});
                    }
                };

                client.on('messageCreate', (msg) => {
                    if (msg.channel.id === acc.farmChannelId || !msg.guild) {
                        checkCaptcha(msg.content.toLowerCase());
                    }
                });

                client.on('messageUpdate', (oldMsg, newMsg) => {
                    if (newMsg.channel?.id === acc.farmChannelId) {
                        checkCaptcha(newMsg.content.toLowerCase());
                    }
                });

                // İlk başlatma
                setTimeout(() => {
                    sendWh();
                }, 2000);
            }
        }
    });

    client.login(acc.token).catch(err => console.log(`⚠️ [${acc.name}] Token hatalı!`, err));
});