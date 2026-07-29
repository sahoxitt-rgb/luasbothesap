const { Client, RichPresence } = require('discord.js-selfbot-v13');
const { Streamer } = require('@dank074/discord-video-stream');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => { res.send('✅ Luas Hub Mesaj Temizleyici & Yayın Sistemi Aktif!'); });
app.listen(PORT, () => { console.log(`🌐 Web sunucusu ${PORT} portunda ayakta!`); });

// ==========================================
// HESAP AYARLARI
// ==========================================
const accounts = [
    {
        name: "Hesap 1 (Yayınlı + Temizleyici)",
        token: process.env.TOKEN_1,
        joinVoice: true, doStream: true, selfDeaf: true, selfMute: false, 
        guildId: "1347302840682549299", 
        channelId: "1437706891290611782"
    },
    {
        name: "Hesap 2 (Sadece Profil)",
        token: process.env.TOKEN_2,
        joinVoice: false, doStream: false
    },
    {
        name: "Hesap 3 (Ses Açık)",
        token: process.env.TOKEN_3,
        joinVoice: true, doStream: false, selfDeaf: false, selfMute: false,
        guildId: "851097447568637985", channelId: "899711321543692348"
    },
    {
        name: "Hesap 4 (Kulaklık Kapalı)",
        token: process.env.TOKEN_4,
        joinVoice: true, doStream: false, selfDeaf: true, selfMute: false,
        guildId: "851097447568637985", channelId: "995746188034842674"
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

        if (acc.joinVoice && acc.guildId && acc.channelId) {
            connectToVoice();
            client.on('voiceStateUpdate', (oldState, newState) => {
                if (oldState.member?.user.id === client.user.id && (!newState.channelId || newState.channelId !== acc.channelId)) {
                    setTimeout(connectToVoice, 5000); 
                }
            });
        }

        // --- PROFİL GÖRÜNÜMÜ (RICH PRESENCE) ---
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
        // ÖZEL MESAJ SİLME MOTORU (.sil)
        // ==========================================
        client.on('messageCreate', async (msg) => {
            // Sadece botun kendi yazdığı mesajları algılar
            if (msg.author.id === client.user.id) {
                const args = msg.content.trim().split(/ +/);
                const cmd = args[0].toLowerCase();

                if (cmd === '.sil') {
                    const amount = parseInt(args[1]);

                    // Sayı girilmemişse veya geçersizse uyar ve geç
                    if (isNaN(amount) || amount <= 0) {
                        return msg.edit("⚠️ Lütfen silinecek miktarı gir! Örnek: `.sil 3`")
                                  .then(m => setTimeout(() => m.delete().catch(()=>{}), 3000))
                                  .catch(()=>{});
                    }

                    // Komut mesajını bilgi mesajına çevir
                    await msg.edit(`🗑️ Son **${amount}** mesajın tespit ediliyor ve siliniyor...`).catch(()=>{});

                    try {
                        // Kanaldaki son 100 mesajı çek
                        const fetched = await msg.channel.messages.fetch({ limit: 100 });
                        
                        // Sadece sana ait olanları ayıkla (ve bu .sil komutunun kendi mesajını hariç tut)
                        const myMessages = fetched.filter(m => m.author.id === client.user.id && m.id !== msg.id).first(amount);

                        // Mesajları sırayla ve güvenli bir gecikmeyle sil (Spam/Ban koruması)
                        for (const m of myMessages) {
                            await m.delete().catch(() => {});
                            await new Promise(r => setTimeout(r, 700)); // Discord'dan ban yememek için her silmede 700ms bekler
                        }

                        // İşlem bitince en baştaki `.sil` komut mesajını da yokederek iz kaybettir
                        await msg.delete().catch(() => {});
                        
                    } catch (err) {
                        console.log("Silme işlemi sırasında hata oluştu.");
                    }
                }
            }
        });
    });

    client.login(acc.token).catch(err => console.log(`⚠️ Token hatası!`));
});