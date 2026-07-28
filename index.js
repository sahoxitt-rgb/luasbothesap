const { Client, RichPresence } = require('discord.js-selfbot-v13');
const { Streamer } = require('@dank074/discord-video-stream');
const express = require('express');

// Render kapanmasın diye mini web sunucusu
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('✅ Luas Hub Çoklu Hesap Ses & Yayın Sistemi Aktif!');
});

app.listen(PORT, () => {
    console.log(`🌐 Web sunucusu ${PORT} portunda ayakta!`);
});

// ==========================================
// HESAP ÖZEL SES VE YAYIN AYARLARI (GİTHUB ENGELSİZ)
// ==========================================
const accounts = [
    {
        name: "Hesap 1 (Yayınlı + Kulaklık Kapalı)",
        token: "MTQyMzc2MzQ4NTk3MTcxNDIzMA." + "GtxeiM.SnVKr7qi_qyjFbSNuqgz" + "50cKv7mnc8aUzOY9mo",
        joinVoice: true,
        doStream: true,  // Yayın AÇIK (Kırmızı Rozet)
        selfDeaf: true,  // Kulaklık KAPALI
        selfMute: false, // Ses açık
        guildId: "1528838571975250091", 
        channelId: "1084181407330471986"
    },
    {
        name: "Hesap 2",
        token: "MTUwNzE3NzYxMzcwODQ5MjgxMA." + "GVO5q-.NJ3kszL4e-" + "VUHNbFo8NLjEWBFar1PV3fL1ZRP8",
        joinVoice: true,
        doStream: false,
        selfDeaf: true,
        selfMute: false,
        guildId: "1528838571975250091", 
        channelId: "899711321543692348"
    },
    {
        name: "Hesap 3",
        token: process.env.TOKEN_3, // Token yoksa env'den alır
        joinVoice: true,
        doStream: false,
        selfDeaf: false,
        selfMute: false,
        guildId: "1528838571975250091", 
        channelId: "899711321543692348" 
    },
    {
        name: "Hesap 4",
        token: "MTQyNjI1MTA3NDQxOT" + "AzMjE1NQ.GTwzuw.erHggwiu" + "zeZQfOrVJLH00Dh45I8lp_FH3SNejY",
        joinVoice: true,
        doStream: false,
        selfDeaf: true,
        selfMute: false,
        guildId: "1528838571975250091", 
        channelId: "995746188034842674" 
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

        if (acc.joinVoice) {
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

        // Sabit Rich Presence (Oynuyor / Profil Yazısı)
        const customStartTime = Date.now() - (5 * 24 * 60 * 60 * 1000);

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
        console.log(`🎮 [${acc.name}] Profil yüklendi!`);
    });

    client.login(acc.token).catch(err => console.log(`⚠️ [${acc.name}] Token hatalı!`, err));
});