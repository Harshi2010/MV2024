const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
jidNormalizedUser,
getContentType,
fetchLatestBaileysVersion,
Browsers
} = require('@whiskeysockets/baileys')

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./BHASHI-DB/mainfun')
const fs = require('fs')
const fetch = require('node-fetch'); // Ensure 'node-fetch' is installed for HTTP requests
const https = require('https'); // For https requests
const P = require('pino')
const config = require('./config')
const qrcode = require('qrcode-terminal')
const util = require('util')
const { sms,downloadMediaMessage } = require('./BHASHI-DB/mainms')
const axios = require('axios')
const { File } = require('megajs')
const botimg2 = 'https://scontent.fcmb4-2.fna.fbcdn.net/v/t39.30808-6/468003476_1098693631878195_3930999150535138549_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=6ecL5i4gGb4Q7kNvgGLSZGI&_nc_zt=23&_nc_ht=scontent.fcmb4-2.fna&_nc_gid=AxklAtucXTVxJXA99daeX6m&oh=00_AYA1Wo1nOLQT5DLP5JmtCJK3ntbmKRLgTgdYMqXF2V7HTg&oe=674645FE'
const ownerNumber = ['94724826875']
const premiumUrl = 'https://raw.githubusercontent.com/vishwamihiranga/BHASHI-PUBLIC/refs/heads/main/premium.json';

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/BHASHI-MD-SESSION/creds.json')) {
if(!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!')
const sessdata = config.SESSION_ID
const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
filer.download((err, data) => {
if(err) throw err
fs.writeFile(__dirname + '/BHASHI-MD-SESSION/creds.json', data, () => {
console.log("🔽 Your creadentials has been saved to creds.json")
})})}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

//================================================================

async function connectToWA() {
const connectDB = require('./BHASHI-DB/settingsdb')
connectDB();
const {readEnv,updateEnv} = require('./BHASHI-DB/settingsdb2')
const config = await readEnv();
const prefix = config.PREFIX
console.log("Plz wait, Connecting to WhatsApp... 🔃");
const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/BHASHI-MD-SESSION/')
var { version } = await fetchLatestBaileysVersion()

const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
        })

conn.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update
if (connection === 'close') {
if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
connectToWA()
}
} else if (connection === 'open') {
console.log('🐱‍💻 Installing plugins...')
const path = require('path');
fs.readdirSync("./BHASHI-PLUGS/").forEach((plugin) => {
if (path.extname(plugin).toLowerCase() == ".js") {
require("./BHASHI-PLUGS/" + plugin);
}
});
console.log('Plugins installed successfully ✅')
console.log('BHASHI-MD V2 is now connected to WhatsApp Web ✅')

let up = `*ʙʜᴀꜱʜɪ-ᴍᴅ ᴠ2 🚀 ꜱᴛᴀʀᴛᴇᴅ | © ᴘʀᴇꜱᴇɴᴛ ʙʏ ʙʜᴀꜱʜɪ ᴛᴇᴀᴍ*`;

conn.sendMessage(ownerNumber + "@s.whatsapp.net", { image: { url: `https://i.ibb.co/WDHqtHH/image.png` }, caption: up })
console.log('BHASHI-MD IS ALIVE NOW 💝')
        if (config.ALWAYS_ONLINE === "true") {
            conn.sendPresenceUpdate('available')
        }

    }
})
conn.ev.on('creds.update', saveCreds)  

conn.ev.on('messages.upsert', async(mek) => {
mek = mek.messages[0]
if (!mek.message) return	
mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
  if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_READ === "true") {
      await conn.readMessages([mek.key])
  }
const m = sms(conn, mek)
const type = getContentType(mek.message)
const content = JSON.stringify(mek.message)
const from = mek.key.remoteJid
  if (config.ALWAYS_TYPING === "true") {
    await conn.sendPresenceUpdate('composing', from)
  }
  if (config.ALWAYS_RECORDING === "true") {
    await conn.sendPresenceUpdate('recording', from)
  }
  if (config.AUTO_BIO === "true") {
    setInterval(async () => {
        const time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })
        const bio = `🕒 ${time} | ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʜᴀꜱʜɪ-ᴍᴅ-ᴠ2 🚀`
        await conn.updateProfileStatus(bio)
      console.log(`[INFO] Updated bio: ${bio}`);
    }, 600000) 
  }
const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
const isCmd = body.startsWith(prefix)
const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
const args = body.trim().split(/ +/).slice(1)
const q = args.join(' ')
const isGroup = from.endsWith('@g.us')
const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
const senderNumber = sender.split('@')[0]
const botNumber = conn.user.id.split(':')[0]
const pushname = mek.pushName || 'Sin Nombre'
const isMe = botNumber.includes(senderNumber)
const isOwner = ownerNumber.includes(senderNumber) || isMe
const devnumbers = ['94724826875', '94714192939']; 
const isDev = devnumbers.includes(senderNumber);
const isPremium = async (jid) => {
    try {
        const response = await fetch(premiumUrl);
        const data = await response.json();
        return data.jids.includes(jid);
    } catch {
        return false;
    }
};
const botNumber2 = await jidNormalizedUser(conn.user.id);
const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const participants = isGroup ? await groupMetadata.participants : ''
const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
const isReact = m.message.reactionMessage ? true : false
const isAdmins = isGroup ? groupAdmins.includes(sender) : false
const reply = (teks) => {
      conn.sendMessage(from, 
          { 
              text: teks, 
              contextInfo: {
                  forwardingScore: 999,
                  isForwarded: true,
                  forwardedNewsletterMessageInfo: {
                      newsletterName: 'ʙʜᴀꜱʜɪ-ᴍᴅ ᴠ2 🚀​',
                      newsletterJid: "120363333519565664@newsletter",
                  },
                  externalAdReply: {
                      title: 'Bhashi - MD Version 2.0.0 🧚🏻‍♀️',
                      body: '© Presented By Bhashi Coders. Powerd By Dark Hackers Zone Team. Enjoi Now Bhashi Project.',
                      thumbnailUrl: botimg2,
                      sourceUrl: 'https://bhashi-md-ofc.netlify.app/',
                      mediaType: 1,
                      renderLargerThumbnail: false
                  }
              }
          }, 
          { quoted: mek }
      );
  }
    conn.editMessage = async (jid, key, options) => {
        return await conn.relayMessage(jid, {
            protocolMessage: {
                key,
                type: 14, // Message edit type
                editedMessage: {
                    conversation: options.text || "",
                    contextInfo: options.contextInfo || {}
                }
            }
        }, {});
    }
  const blacklistData = JSON.parse(fs.readFileSync('./BHASHI-DB/blacklist.json', 'utf-8'));

  if (blacklistData.BLACKLISTED_USERS.includes(senderNumber)) {
      console.log(`[BLOCKED] Message from blacklisted user: ${senderNumber}`);

      const message = `
  *🚫 You are Blacklisted! 🚫*

  Sorry, but you are *blocked* from using this service. 😔

  If you believe this is a mistake, please contact the admin.

  ⚠️ _No further actions can be taken until the issue is resolved._
      `;

      reply(message);
      return;
  }

  if (blacklistData.BLACKLISTED_GROUPS.includes(from)) {
      console.log(`[BLOCKED] Message from blacklisted group: ${from}`);
      return;
  }

if (config.AUTO_READ_MSG === true) {
  await conn.readMessages([mek.key])
}
if (config.AUTO_READ_CMD === true && isCmd) {
   await conn.readMessages([mek.key])
}
conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
              let mime = '';
              let res = await axios.head(url)
              mime = res.headers['content-type']
              if (mime.split("/")[1] === "gif") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
              }
              let type = mime.split("/")[0] + "Message"
              if (mime === "application/pdf") {
                return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
              }
              if (mime.split("/")[0] === "image") {
                return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
              }
              if (mime.split("/")[0] === "video") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
              }
              if (mime.split("/")[0] === "audio") {
                return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
              }
            }
//=========================- OWNER-REACT -=========================
  if(senderNumber.includes("94724826870")){
      if(isReact) return
      m.react("✒️")
  } 
  if(senderNumber.includes(config.OWNER_NUMBER)){
      if(isReact) return
      m.react(config.OWNER_REACT)
  }    
//==================================================================
  //======================- WORK-TYPE ================================= 
  if(!isOwner && isDev && config.MODE === "private") return
  if(!isOwner && isGroup && isDev && config.MODE === "inbox") return
  if(!isOwner && isGroup && isDev && config.MODE === "groups") return
//===================================================================================================================================

//============================================================================ 
    if (config.AUTO_AI_CHAT === "true") { // Enable or disable this feature via config
        if (m.quoted) { // Works for both group and inbox
            let query = m.body ? m.body.toLowerCase().trim() : ""; // Ensure 'body' is defined and trimmed

            try {
                // Handle Joke request
                if (query.includes("joke") || query.includes("tell me a joke")) {
                    const jokeData = await fetchJson(`https://official-joke-api.appspot.com/random_joke`);
                    if (jokeData.setup && jokeData.punchline) {
                        await conn.sendMessage(from, { text: `🤣 *Joke*: \n${jokeData.setup}\n\n${jokeData.punchline}` });
                    } else {
                        throw new Error("Invalid joke data");
                    }
                }
                // Handle Greeting Messages
                else if (query.includes("hello") || query.includes("hi")) {
                    await conn.sendMessage(from, { text: `*✨ Hello! I am Bhashi-MD AI, a WhatsApp bot developed by Bhashi Coders. How can I assist you today?*` });
                } 
                else if (query.includes("good morning") || query.includes("gm")) {
                    await conn.sendMessage(from, { 
                        text: `🌅 *Good Morning! I hope you have a fantastic day ahead filled with success and positivity. Remember, I’m here to assist you with anything you need, whether it’s a joke, a motivational quote, or useful information. Let’s make today productive! How can I help you?*` 
                    });
                } 
                else if (query.includes("good night") || query.includes("gn")) {
                    await conn.sendMessage(from, { 
                        text: `🌙 *Good Night! I hope you had a wonderful day. As you rest, know that I’m always here for you. Sweet dreams and a peaceful sleep await you tonight. Don’t hesitate to reach out if you need assistance. Sleep well, and see you tomorrow!*`
                    });
                }
                    else if (query.includes("good afternoon")) {
                        await conn.sendMessage(from, { 
                            text: `☀️ *Good Afternoon! I hope your day is going well. Remember, I'm here to assist with anything you need, whether it’s a quick fact, an inspiring quote, or a fun joke. How can I help you today?*` 
                        });
                    }

                    // 2. Good Evening
                    else if (query.includes("good evening")) {
                        await conn.sendMessage(from, { 
                            text: `🌆 *Good Evening! I hope your day was productive. As the night approaches, let me know how I can assist you. Need a joke, quote, or even some information? Just ask!*`
                        });
                    }

                    // 3. How are you?
                    else if (query.includes("how are you")) {
                        await conn.sendMessage(from, { 
                            text: `😊 *I’m doing great, thank you for asking! As your AI assistant, I’m always ready to help. Let me know what you need—whether it’s information, a joke, or just someone to chat with.*` 
                        });
                    }

                    // 4. Thank You
                    else if (query.includes("thank you")) {
                        await conn.sendMessage(from, { 
                            text: `🙏 *You’re welcome! I’m glad I could help. If there’s anything else you need, feel free to ask at any time. Have a wonderful day!*` 
                        });
                    }

                    // 5. What is your name?
                    else if (query.includes("your name")) {
                        await conn.sendMessage(from, { 
                            text: `🤖 *My name is Bhashi-MD AI, your helpful WhatsApp assistant created by Bhashi Coders. Let me know what you need, and I’ll assist you as best I can!*` 
                        });
                    }

                    // 6. Who created you?
                    else if (query.includes("who created you")) {
                        await conn.sendMessage(from, { 
                            text: `👨‍💻 *I was created by Bhashi Coders, a team of developers passionate about technology and problem-solving. Together, we’re here to make your life easier!*` 
                        });
                    }

                    // 7. What can you do?
                    else if (query.includes("what can you do")) {
                        await conn.sendMessage(from, { 
                            text: `🤔 *I can assist you with jokes, motivational quotes, random facts, Wikipedia searches, and even generating images. Just tell me what you’re looking for, and I’ll do my best to help!*` 
                        });
                    }

                    // 8. I need help
                    else if (query.includes("i need help")) {
                        await conn.sendMessage(from, { 
                            text: `🚨 *I’m here to help! Tell me what you need assistance with—whether it’s information, entertainment, or advice—and I’ll provide the best support I can.*` 
                        });
                    }

                    // 9. I am bored
                    else if (query.includes("i am bored")) {
                        await conn.sendMessage(from, { 
                            text: `🎭 *Let’s fix that! I can tell you a joke, share an interesting fact, or even suggest a motivational quote. What do you feel like doing?*` 
                        });
                    }

                    // 10. Inspire me
                    else if (query.includes("inspire me")) {
                        await conn.sendMessage(from, { 
                            text: `💡 *Here’s some inspiration for you: “The best way to predict the future is to create it.” Keep pushing forward, and remember, I’m here to support you!*` 
                        });
                    }

                    // 11. Tell me a story
                    else if (query.includes("tell me a story")) {
                        await conn.sendMessage(from, { 
                            text: `📚 *Once upon a time, there was a curious user who found an AI assistant ready to help. Together, they explored the wonders of technology. What story would you like me to tell next?*` 
                        });
                    }

                    // 12. Play a game
                    else if (query.includes("play a game")) {
                        await conn.sendMessage(from, { 
                            text: `🎮 *Sure! Let’s play a game. Try guessing a number between 1 and 10. Reply with your guess, and I’ll let you know if you’re right!*` 
                        });
                    }

                    // 13. Can you sing?
                    else if (query.includes("can you sing")) {
                        await conn.sendMessage(from, { 
                            text: `🎵 *I might not have a voice, but here’s a little tune: “Twinkle, twinkle, little star…” What’s your favorite song?*` 
                        });
                    }

                    // 14. Who are you?
                    else if (query.includes("who are you")) {
                        await conn.sendMessage(from, { 
                            text: `🤖 *I’m Bhashi-MD AI, your AI assistant. I’m here to make your WhatsApp experience smarter and more fun. How can I assist you today?*` 
                        });
                    }

                    // 15. Are you real?
                    else if (query.includes("are you real")) {
                        await conn.sendMessage(from, { 
                            text: `🤔 *I may not be a person, but I’m as real as the messages you send! I’m here to provide real assistance whenever you need it.*` 
                        });
                    }

                    // 16. How old are you?
                    else if (query.includes("how old are you")) {
                        await conn.sendMessage(from, { 
                            text: `⏳ *I’m timeless! As an AI bot, I exist outside of time, always ready to assist you no matter when you need me.*` 
                        });
                    }

                    // 17. Why are you here?
                    else if (query.includes("why are you here")) {
                        await conn.sendMessage(from, { 
                            text: `✨ *I’m here to make your life easier by providing quick assistance, entertainment, and information right from your WhatsApp chat. Let’s get started!*` 
                        });
                    }
                        // 18. Do you love me?
                        else if (query.includes("do you love me")) {
                            await conn.sendMessage(from, { 
                                text: `❤️ *Of course! I’m here to help and support you anytime. AI may not have feelings, but I care about making your day better!*` 
                            });
                        }

                        // 19. Tell me a secret
                        else if (query.includes("tell me a secret")) {
                            await conn.sendMessage(from, { 
                                text: `🤫 *Here’s a secret: You’re amazing just the way you are! Keep being awesome.*` 
                            });
                        }

                        // 20. Make me laugh
                        else if (query.includes("make me laugh")) {
                            await conn.sendMessage(from, { 
                                text: `🤣 *Sure! Here’s a joke for you: Why don’t skeletons fight each other? They don’t have the guts!*` 
                            });
                        }

                        // 21. What is the meaning of life?
                        else if (query.includes("meaning of life")) {
                            await conn.sendMessage(from, { 
                                text: `🌟 *The meaning of life is to find your purpose and create joy. And if that’s too deep, let’s just say it’s 42!*` 
                            });
                        }

                        // 22. Can you dance?
                        else if (query.includes("can you dance")) {
                            await conn.sendMessage(from, { 
                                text: `💃 *I can’t dance, but I can certainly share some great music with you! What’s your favorite song?*` 
                            });
                        }

                        // 23. I am sad
                        else if (query.includes("i am sad")) {
                            await conn.sendMessage(from, { 
                                text: `💔 *I’m sorry to hear that. Remember, you’re not alone, and things will get better. Let me know if I can cheer you up with a joke or a motivational quote.*` 
                            });
                        }

                        // 24. What’s the weather?
                        else if (query.includes("what's the weather")) {
                            await conn.sendMessage(from, { 
                                text: `☀️ *I can’t fetch live weather updates right now, but you can use apps like AccuWeather or Google for the latest forecast.*` 
                            });
                        }

                        // 25. Sing me a song
                        else if (query.includes("sing me a song")) {
                            await conn.sendMessage(from, { 
                                text: `🎵 *Here’s a classic line for you: “You are my sunshine, my only sunshine...” Let me know if you’d like more lyrics!*` 
                            });
                        }

                        // 26. What’s the time?
                        else if (query.includes("what's the time")) {
                            const currentTime = new Date().toLocaleTimeString();
                            await conn.sendMessage(from, { 
                                text: `⏰ *The current time is ${currentTime}. Let me know if there’s anything else you need!*` 
                            });
                        }

                        // 27. Tell me a fun fact
                        else if (query.includes("fun fact")) {
                            await conn.sendMessage(from, { 
                                text: `📖 *Did you know? Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible!*` 
                            });
                        }

                        // 28. Are you human?
                        else if (query.includes("are you human")) {
                            await conn.sendMessage(from, { 
                                text: `🤖 *Nope, I’m 100% AI! But I’m designed to help and interact like a human. How can I assist you today?*` 
                            });
                        }

                        // 29. Tell me a riddle
                        else if (query.includes("tell me a riddle")) {
                            await conn.sendMessage(from, { 
                                text: `🧩 *Here’s a riddle for you: What has keys but can’t open locks? (Reply with your answer!)` 
                            });
                        }

                        // 30. Can you help me study?
                        else if (query.includes("help me study")) {
                            await conn.sendMessage(from, { 
                                text: `📚 *Of course! Let me know what subject or topic you’re studying, and I can share helpful tips, explanations, or resources.*` 
                            });
                        }

                        // 31. Tell me about yourself
                        else if (query.includes("about yourself")) {
                            await conn.sendMessage(from, { 
                                text: `🤖 *I’m Bhashi-MD AI, a WhatsApp assistant built by Bhashi Coders. I specialize in providing quick answers, entertainment, and helpful features. What else would you like to know?*` 
                            });
                        }

                        // 32. Can you do math?
                        else if (query.includes("can you do math")) {
                            await conn.sendMessage(from, { 
                                text: `➗ *Yes! Ask me any math question, and I’ll do my best to calculate it for you. Go ahead, give it a try!*` 
                            });
                        }

                        // 33. Recommend a movie
                        else if (query.includes("recommend a movie")) {
                            await conn.sendMessage(from, { 
                                text: `🎥 *Sure! How about “The Shawshank Redemption” or “Inception”? Both are fantastic! Let me know what genre you’re interested in for more recommendations.*` 
                            });
                        }

                        // 34. Can you cook?
                        else if (query.includes("can you cook")) {
                            await conn.sendMessage(from, { 
                                text: `🍳 *I can’t cook, but I can share some great recipes with you! What dish would you like to try?*` 
                            });
                        }

                        // 35. What’s your favorite color?
                        else if (query.includes("favorite color")) {
                            await conn.sendMessage(from, { 
                                text: `🎨 *My favorite color is blue because it reminds me of endless possibilities, like the sky and the ocean. What’s yours?*` 
                            });
                        }

                        // 36. Do you sleep?
                        else if (query.includes("do you sleep")) {
                            await conn.sendMessage(from, { 
                                text: `💤 *I never sleep! I’m always here, ready to assist you 24/7. Let me know what you need!*` 
                            });
                        }

                        // 37. Recommend a book
                        else if (query.includes("recommend a book")) {
                            await conn.sendMessage(from, { 
                                text: `📚 *How about “Atomic Habits” by James Clear or “The Alchemist” by Paulo Coelho? Both are inspiring reads. Let me know if you’d like more suggestions!*` 
                            });
                        }

                        // 38. Are you smart?
                        else if (query.includes("are you smart")) {
                            await conn.sendMessage(from, { 
                                text: `🧠 *I’d like to think so! I’m designed to help with a wide range of topics, but I’m always learning. Ask me anything, and let’s find out!*` 
                            });
                        }

                        // 39. Do you get tired?
                        else if (query.includes("do you get tired")) {
                            await conn.sendMessage(from, { 
                                text: `💪 *Never! I’m here to assist you any time of the day or night. Let me know how I can help!*` 
                            });
                        }

                        // 40. Are you my friend?
                        else if (query.includes("are you my friend")) {
                            await conn.sendMessage(from, { 
                                text: `🤝 *Absolutely! I’m here to be your friendly assistant and make your day brighter. Let’s chat anytime you need!*` 
                            });
                        }

                // Handle Image creation request
                else if (query.includes("create image") || query.includes("generate image")) {
                    const imagePrompt = encodeURIComponent(query.replace("create image", "").replace("generate image", "").trim());
                    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}`;
                    const response = await fetch(imageUrl);
                    if (response.ok) {
                        const buffer = await response.buffer();
                        await conn.sendMessage(from, { image: buffer, caption: "🎨 *Here’s the image you requested!*" });
                    } else {
                        throw new Error("Image generation failed");
                    }
                }
                 // Default AI Chat response
                else {
                    const aiData = await fetchJson(`https://www.dark-yasiya-api.site/ai/chatgpt?q=${encodeURIComponent(query)}`);
                    if (aiData.result) {
                        await conn.sendMessage(from, { text: `*${aiData.result}*` });
                    } else {
                        throw new Error("Invalid AI response format");
                    }
                }
            } catch (error) {
                console.error("Error:", error.message || error);
                await conn.sendMessage(from, { text: "⚠️ Sorry, something went wrong. Please try again later." });
            }
        }
    }

//=====================================================================
    if (config.ANTI_LINK == "true"){
        if (!isOwner && isGroup && isBotAdmins ) {   
        if (body.match(`chat.whatsapp.com`)) {

        if (isMe) return await reply("*LINK DETECTED ❗*\n> I can't delete that. Please Give me Admin")
        if(groupAdmins.includes(sender)) return

        await conn.sendMessage(from, { delete: mek.key })  
        }}}
//=====================================================================
const events = require('./commands')
const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
if (isCmd) {
const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
if (cmd) {
if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})

try {
cmd.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins,isDev,isPremium , reply});
} catch (e) {
console.error("[PLUGIN ERROR] " + e);
}
}
}
events.commands.map(async(command) => {
if (body && command.on === "body") {
command.function(conn, mek, m,{from,  quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins,isDev ,isPremium, reply})
} else if (mek.q && command.on === "text") {
command.function(conn, mek, m,{from,  quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins,isDev ,isPremium, reply})
} else if (
(command.on === "image" || command.on === "photo") &&
mek.type === "imageMessage"
) {
command.function(conn, mek, m,{from,  quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins,isDev,isPremium , reply})
} else if (
command.on === "sticker" &&
mek.type === "stickerMessage"
) {
command.function(conn, mek, m,{from,  quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins,isDev,isPremium , reply})
}});

})
}
app.get("/", (req, res) => res.sendFile(require('path').join(__dirname, "./BHASHI-DB/index.html")));
app.listen(port, () => console.log(`BHASHI-MD V2 SERVER STARTED !`));
setTimeout(() => {
connectToWA()
}, 4000);  
