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
// RENDER ENVIRONMENT VARIABLES (TOKEN 1 - 4)
// ==========================================
const accounts = [
    {
        name: "Hesap 1 (Yayınlı + Kulaklık Kapalı)",
        token: process.env.TOKEN_1,
        joinVoice: true,
        doStream: true,  // Yayın AÇIK (Kırmızı Rozet)
        selfDeaf: true,  // Kulaklık KAPALI
        selfMute: false, // Ses açık
        guildId: "1528838571975250091", 
        channelId: "1084181407330471986"
    },
    {
        name: "Hesap 2",
        token: process.env.TOKEN_2,
        joinVoice: true,
        doStream: false,
        selfDeaf: true,
        selfMute: false,
        guildId: "1528838571975250091", 
        channelId: "899711321543692348"
    },
    {
        name: "Hesap 3",
        token: process.env.TOKEN_3,
        joinVoice: true,
        doStream: false,
        selfDeaf: false,
        selfMute: false,
        guildId: "1528838571975250091", 
        channelId: "899711321543692348" 
    },
    {
        name: "Hesap 4",
        token: process.env.TOKEN_4,
        joinVoice: true,
        doStream: false,
        selfDeaf: true,
        selfMute: false,
        guildId: "1528838571975250091", 
        channelId: "995746188034842674" 
    }
];

accounts.forEach((acc) => {
    if (!acc.token) {
        console.log(`⚠️ [${acc.name}] Token bulunamadı! Render Environment değişkenlerini kontrol et.`);
        return;
    }

    const client = new Client({ checkUpdate: false });
    const streamer = new Streamer(client);

    client.on('ready', async () => {
        console.log(`✅ [${acc.name}] Aktif! Giriş yapılan: ${client.user.username}`);

        const connectToVoice = async () => {
            try {
                await streamer.joinVoice(acc.guildId, acc.channelId, {
                    self_mute: acc.selfMute,
                    self_deaf: acc.selfDeaf,
                    self_video: false
                });

                if (acc.doStream) {
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
            } catch (err) {
                setTimeout(connectToVoice, 10000);
            }
        };

        if (acc.joinVoice) {
            connectToVoice();

            // ÖLÜMSÜZLÜK MODU (Sesten atılırlarsa geri dönerler)
            client.on('voiceStateUpdate', (oldState, newState) => {
                if (oldState.member?.user.id === client.user.id) {
                    if (!newState.channelId || newState.channelId !== acc.channelId) {
                        setTimeout(connectToVoice, 5000); 
                    }
                }
            });
        }

        // Garanti Çalışan Profil Aktivitesi (Oynuyor Yazısı)
        const updatePresence = () => {
            try {
                client.user.setActivity('best script /luashub', { type: 'PLAYING' });
            } catch (e) {}
        };

        updatePresence();
        setInterval(updatePresence, 30000); 
        console.log(`🎮 [${acc.name}] Profil aktivitesi sabitlendi!`);
    });

    client.login(acc.token).catch(err => console.log(`⚠️ [${acc.name}] Token hatası:`, err.message));
});