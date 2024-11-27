const { cmd } = require('../commands');
const axios = require('axios');
const cheerio = require('cheerio');
const footer = `🎬 𝗕𝗛𝗔𝗦𝗛𝗜 𝗖𝗜𝗡𝗘𝗠𝗔 𝗩𝟭 🎬`
const slogan = `ᴘᴏᴡᴇʀᴅ ʙʏ ᴠɪꜱʜᴡᴀ & ʙʜᴀꜱʜɪᴛʜᴀ`




cmd({
  pattern: "ginisisila",
  alias: ["gini", "cartoon"],
  desc: "Search and download Sinhala cartoons from Ginisisila. Format: .gini query | jid",
  react: "🎭",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    // Parse query and target JID if provided (format: query | jid)
    const fullInput = args.join(' ') || "keko";
    const [query, targetJid] = fullInput.split('|').map(str => str.trim());
    const destinationJid = targetJid || from;

    // Validate JID if provided
    if (targetJid && !targetJid.includes('@')) {
      return reply("❌ Invalid JID format. Use: query | JID (e.g., keko | 123456789@g.us)");
    }

    // Search progress reaction
    await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

    // Perform search using the API
    const searchResponse = await axios.get(`https://dark-yasiya-api.site/search/ginisisila?text=${encodeURIComponent(query)}&page=1`);

    if (!searchResponse.data.status || !searchResponse.data.result.data || searchResponse.data.result.data.length === 0) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("❌ No cartoons found for the query.");
    }

    // Format search results
    let resultMessage = `*[ 🎭 GINISISILA CARTOON SEARCH: '${query}' ]*\n\n`;
    searchResponse.data.result.data.forEach((cartoon, index) => {
      resultMessage += `${index + 1}. *${cartoon.title}*\n`;
      resultMessage += `📅 ${cartoon.posted_date}\n\n`;
    });

    resultMessage += `\n📌 *Instructions:*\n`;
    resultMessage += `> Reply with number (1-${searchResponse.data.result.data.length}) to download\n`;
    resultMessage += `> Type 'cancel' to cancel\n`;
    if (targetJid) {
      resultMessage += `> Download will be sent to: ${targetJid}\n`;
    }
    resultMessage += `\n> ${footer}`;

    // Send results with thumbnail
    const sentMessage = await conn.sendMessage(from, {
      image: { url: searchResponse.data.result.data[0].image },
      caption: resultMessage,
      contextInfo: {
        externalAdReply: {
          title: footer,
          body: `Found ${searchResponse.data.result.data.length} cartoons`,
          thumbnailUrl: 'https://i.ibb.co/F3VtTx6/Whats-App-Image-2024-10-29-at-1-29-11-AM.jpg',
          sourceUrl: 'https://ginisisilacartoon.net/',
          mediaType: 1
        }
      }
    }, { quoted: mek });

    // Handle user selection
    const handleUserReply = async (messageUpsert) => {
      const msg = messageUpsert.messages[0];
      if (!msg.message || !msg.message.extendedTextMessage) return;

      const userReply = msg.message.extendedTextMessage.text.trim().toLowerCase();
      const messageContext = msg.message.extendedTextMessage.contextInfo;

      if (messageContext && messageContext.stanzaId === sentMessage.key.id) {
        if (userReply === 'cancel') {
          conn.ev.off("messages.upsert", handleUserReply);
          await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });
          return reply("Search cancelled.");
        }

        const cartoonIndex = parseInt(userReply) - 1;

        if (cartoonIndex >= 0 && cartoonIndex < searchResponse.data.result.data.length) {
          // Download progress reaction
          await conn.sendMessage(from, { react: { text: "📥", key: msg.key } });

          const selectedCartoon = searchResponse.data.result.data[cartoonIndex];

          try {
            // Get download link
            const downloadResponse = await axios.get(`https://dark-yasiya-api.site/download/ginisisila?url=${encodeURIComponent(selectedCartoon.url)}`);

            if (!downloadResponse.data.status || !downloadResponse.data.result.dl_link) {
              throw new Error("Failed to get download link");
            }

            // Send download status
            await reply(`📥 *Downloading:* ${selectedCartoon.title}`);

            // If sending to a different JID, send cartoon info there first
            if (destinationJid !== from) {
              await conn.sendMessage(destinationJid, {
                image: { url: selectedCartoon.image },
                caption: `🎭 *${selectedCartoon.title}*\n📅 ${selectedCartoon.posted_date}\n\n> ${footer}`,
                contextInfo: {
                  externalAdReply: {
                    title: footer,
                    body: slogan,
                    thumbnailUrl: 'https://i.ibb.co/F3VtTx6/Whats-App-Image-2024-10-29-at-1-29-11-AM.jpg',
                    sourceUrl: 'https://ginisisilacartoon.net/',
                    mediaType: 1
                  }
                }
              });
            }

            // Send the video file
            await conn.sendMessage(destinationJid, {
              document: { url: downloadResponse.data.result.dl_link },
              mimetype: 'video/mp4',
              fileName: `${selectedCartoon.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`,
              caption: `🎭 *${selectedCartoon.title}*\n📅 ${selectedCartoon.posted_date}\n\n> ${footer}`
            }, { quoted: msg });

            // Send completion messages
            await reply("✅ Download completed!");
            if (destinationJid !== from) {
              await conn.sendMessage(from, {
                text: `✅ Download completed and sent to ${destinationJid}!`
              });
            }

          } catch (error) {
            console.error(`Error downloading cartoon:`, error);
            reply(`❌ Error downloading cartoon: ${error.message}`);
          }
        } else {
          reply(`❌ Invalid number. Please choose between 1 and ${searchResponse.data.result.data.length}.`);
        }
      }
    };

    conn.ev.on("messages.upsert", handleUserReply);

  } catch (error) {
    console.error(error);
    reply(`🚨 An error occurred: ${error.message}`);
  }
});
cmd({
  pattern: "pirate",
  alias: ["p2", "pdl"],
  desc: "Search and download movies from Pirate.lk with direct download support",
  react: "🎬",
  category: "search",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    // Parse query and target JID if provided (format: query | jid)
    const fullInput = args.join(' ') || "Mission Impossible";
    const [query, targetJid] = fullInput.split('|').map(str => str.trim());
    const destinationJid = targetJid || from;

    // Validate JID if provided
    if (targetJid && !targetJid.includes('@')) {
      return reply("❌ Invalid JID format. Use: query | JID (e.g., Mission Impossible | 123456789@g.us)");
    }

    // Search progress reaction
    await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

    // Perform search using the API
    const searchResponse = await fetch(`https://asitha-moviedl.vercel.app/api/pirate/search?q=${encodeURIComponent(query)}&apikey=asitha2005`);
    const searchResults = await searchResponse.json();

    if (!searchResults.data?.data?.data || searchResults.data.data.data.length === 0) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("❌ No movies found for the query.");
    }

    // Format search results
    let resultMessage = `*[ 🎊 PIRATE.LK SEARCH RESULT '${query}'🎉 ]*\n\n`;
    searchResults.data.data.data.forEach((movie, index) => {
      resultMessage += `🎬 *${index + 1}. ${movie.title}*\n`;
      if (movie.year) resultMessage += `📅 ${movie.year} | `;
      if (movie.rating) resultMessage += `⭐ ${movie.rating} | `;
      if (movie.type) resultMessage += `📽️ ${movie.type}\n`;
      resultMessage += '\n';
    });

    resultMessage += `\n📌 *Instructions:*\n`;
    resultMessage += `> Reply with movie number (1-${searchResults.data.data.data.length}) for details\n`;
    resultMessage += `> Type 'done' to end search\n`;
    if (targetJid) {
      resultMessage += `> Download will be sent to: ${targetJid}\n`;
    }

    const thumbnailUrl = searchResults.data.data.data[0]?.imageSrc || 
      'https://pirate.lk/wp-content/uploads/2023/10/default-movie.jpg';

    const sentMessage = await conn.sendMessage(from, {
      text: resultMessage,
      contextInfo: {
        externalAdReply: {
          title: "Pirate.lk Movie Search",
          body: `Found ${searchResults.data.data.data.length} results`,
          thumbnail: { url: thumbnailUrl },
          mediaType: 2,
          mediaUrl: "https://pirate.lk/"
        }
      }
    }, { quoted: mek });

    const handleUserReply = async (messageUpsert) => {
      const msg = messageUpsert.messages[0];
      if (!msg.message || !msg.message.extendedTextMessage) return;

      const userReply = msg.message.extendedTextMessage.text.trim().toLowerCase();
      const messageContext = msg.message.extendedTextMessage.contextInfo;

      if (messageContext && messageContext.stanzaId === sentMessage.key.id) {
        await conn.sendMessage(from, { react: { text: "🔄", key: msg.key } });

        if (userReply === 'done') {
          conn.ev.off("messages.upsert", handleUserReply);
          await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });
          return reply("Thank you for using Pirate.lk search. Search ended.");
        }

        const movieIndex = parseInt(userReply) - 1;
        const movies = searchResults.data.data.data;

        if (movieIndex >= 0 && movieIndex < movies.length) {
          const selectedMovie = movies[movieIndex];

          // Fetch movie details
          const movieResponse = await fetch(`https://asitha-moviedl.vercel.app/api/pirate/movie?url=${encodeURIComponent(selectedMovie.link)}&apikey=asitha2005`);
          const movieDetails = await movieResponse.json();

          if (!movieDetails.data?.data) {
            return reply("❌ Error fetching movie details.");
          }

          const details = movieDetails.data.data;

          // Create detailed movie message
          let detailsMessage = `🌟 *${details.mainDetails.maintitle}*\n\n`;
          detailsMessage += `📅 Release Date: ${details.mainDetails.dateCreated}\n`;
          detailsMessage += `⭐ Rating: ${details.moviedata.imdbRating} (${details.moviedata.imdbvotesCount})\n`;
          detailsMessage += `⏱️ Runtime: ${details.mainDetails.runtime}\n`;
          detailsMessage += `🎭 Genres: ${details.mainDetails.genres.join(', ')}\n\n`;

          // Add download options
          detailsMessage += `📥 *Download Options:*\n`;
          details.dllinks.directDownloadLinks.forEach((link, index) => {
            detailsMessage += `${index + 1}. ${link.quality} (${link.size})\n`;
          });

          // Send movie details with thumbnail
          const detailsMsg = await conn.sendMessage(from, {
            image: { url: details.mainDetails.imageUrl },
            caption: detailsMessage,
            contextInfo: {
              externalAdReply: {
                title: details.mainDetails.maintitle,
                body: "Click to download",
                thumbnail: { url: details.mainDetails.imageUrl },
                mediaType: 1
              }
            }
          }, { quoted: msg });

          // Handle quality selection
          const handleQualitySelection = async (qualityMsgUpsert) => {
            const qualityMsg = qualityMsgUpsert.messages[0];
            if (!qualityMsg.message?.extendedTextMessage) return;

            const qualityReply = qualityMsg.message.extendedTextMessage.text.trim();
            const qualityContext = qualityMsg.message.extendedTextMessage.contextInfo;

            if (qualityContext && qualityContext.stanzaId === detailsMsg.key.id) {
              const qualityIndex = parseInt(qualityReply) - 1;
              const downloadLinks = details.dllinks.directDownloadLinks;

              if (qualityIndex >= 0 && qualityIndex < downloadLinks.length) {
                const selectedQuality = downloadLinks[qualityIndex];

                // Get final download link
                const downloadResponse = await fetch(`https://asitha-moviedl.vercel.app/api/pirate/download?url=${encodeURIComponent(selectedQuality.link)}&apikey=asitha2005`);
                const downloadInfo = await downloadResponse.json();

                if (!downloadInfo.data?.data?.link) {
                  return reply("❌ Error getting download link.");
                }

                const finalDownloadLink = downloadInfo.data.data.link;

                // Send download status
                await reply(`📥 Downloading ${selectedQuality.quality}...\n💾 Size: ${selectedQuality.size}`);

                try {
                  // Download and send the file
                  await conn.sendMessage(destinationJid, {
                    document: { url: finalDownloadLink },
                    mimetype: "video/mp4",
                    fileName: `${details.mainDetails.maintitle}_${selectedQuality.quality}.mp4`,
                    caption: `🎬 ${details.mainDetails.maintitle}\n📊 Quality: ${selectedQuality.quality}\n💾 Size: ${selectedQuality.size}`
                  }, { quoted: qualityMsg });

                  await reply("✅ Download completed and sent!");
                  if (destinationJid !== from) {
                    await conn.sendMessage(from, {
                      text: `✅ Download sent to ${destinationJid}!`
                    });
                  }
                } catch (error) {
                  console.error("Download error:", error);
                  reply(`❌ Error downloading: ${error.message}`);
                }

                conn.ev.off("messages.upsert", handleQualitySelection);
              } else {
                reply(`❌ Invalid quality number. Choose between 1 and ${downloadLinks.length}.`);
              }
            }
          };

          conn.ev.on("messages.upsert", handleQualitySelection);
        } else {
          reply(`❌ Invalid movie number. Choose between 1 and ${movies.length}.`);
        }
      }
    };

    conn.ev.on("messages.upsert", handleUserReply);

  } catch (error) {
    console.error("Error:", error);
    reply(`❌ An error occurred: ${error.message}`);
  }
});
cmd({
  pattern: "cinesubz",
  alias: ["cs2"],
  desc: "Search and download movies from CineSubz with direct scraping support",
  react: "🎬",
  category: "search",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    // Parse query and target JID if provided (format: query | jid)
    const fullInput = args.join(' ') || "mission impossible";
    const [query, targetJid] = fullInput.split('|').map(str => str.trim());
    const destinationJid = targetJid || from;

    // Validate JID if provided
    if (targetJid && !targetJid.includes('@')) {
      return reply("❌ Invalid JID format. Use: query | JID (e.g., avatar | 123456789@g.us)");
    }

    // Search progress reaction
    await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

    // Perform search using API
    const searchResponse = await fetch(`https://asitha-moviedl.vercel.app/api/cinesubz/search?q=${encodeURIComponent(query)}&apikey=asitha2005`);
    const searchResults = await searchResponse.json();

    if (!searchResults.data?.data?.data || searchResults.data.data.data.length === 0) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("❌ No movies found for the query.");
    }

    const movies = searchResults.data.data.data;

    // Format search results
    let resultMessage = `*[ 🎊 CINESUBZ SEARCH RESULTS FOR '${query}' 🎉 ]*\n\n`;
    movies.forEach((movie, index) => {
      resultMessage += `🎬 *${index + 1}. ${movie.title}*\n`;
      if (movie.year) resultMessage += `📅 ${movie.year} | `;
      if (movie.rating) resultMessage += `⭐ ${movie.rating} | `;
      if (movie.type) resultMessage += `📽️ ${movie.type}\n`;
      if (movie.description) resultMessage += `📝 ${movie.description}\n`;
      resultMessage += '\n';
    });

    resultMessage += `\n📌 *Instructions:*\n`;
    resultMessage += `> Reply with movie number (1-${movies.length}) for details\n`;
    resultMessage += `> Type 'done' to end search\n`;
    if (targetJid) {
      resultMessage += `> Download will be sent to: ${targetJid}\n`;
    }
    resultMessage += `\n> ${footer}`;

    const thumbnailUrl = movies[0]?.imageSrc || 'https://i.ibb.co/2jNJs5q/94d829c1-de36-4b7f-9d4d-f0566c361b61-1.jpg';

    const sentMessage = await conn.sendMessage(from, {
      image: { url: thumbnailUrl },
      caption: resultMessage,
      contextInfo: {
        externalAdReply: {
          title: footer,
          body: `Found ${movies.length} results`,
          thumbnailUrl: thumbnailUrl,
          sourceUrl: `https://cinesubz.co`,
          mediaType: 1
        }
      }
    }, { quoted: mek });

    const handleUserReply = async (messageUpsert) => {
      const msg = messageUpsert.messages[0];
      if (!msg.message || !msg.message.extendedTextMessage) return;

      const userReply = msg.message.extendedTextMessage.text.trim().toLowerCase();
      const messageContext = msg.message.extendedTextMessage.contextInfo;

      if (messageContext && messageContext.stanzaId === sentMessage.key.id) {
        await conn.sendMessage(from, { react: { text: "🔄", key: msg.key } });

        if (userReply === 'done') {
          conn.ev.off("messages.upsert", handleUserReply);
          await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });
          return reply("Thank you for using CineSubz search. Search ended.");
        }

        const movieIndex = parseInt(userReply) - 1;

        if (movieIndex >= 0 && movieIndex < movies.length) {
          const selectedMovie = movies[movieIndex];

          // Fetch movie details using API
          const movieInfoResponse = await fetch(`https://asitha-moviedl.vercel.app/api/cinesubz/movie?url=${encodeURIComponent(selectedMovie.link)}&apikey=asitha2005`);
          const movieInfo = await movieInfoResponse.json();

          if (!movieInfo.data?.data) {
            return reply("❌ Error fetching movie details.");
          }

          const details = movieInfo.data.data;

          // Create detailed movie information message
          let detailsMessage = `🌟 *${details.mainDetails.maintitle}*\n\n`;

          // Add metadata
          detailsMessage += `📅 *Release Date:* ${details.mainDetails.dateCreated || 'N/A'}\n`;
          detailsMessage += `🌍 *Country:* ${details.mainDetails.country || 'N/A'}\n`;
          detailsMessage += `⏱️ *Runtime:* ${details.mainDetails.runtime || 'N/A'}\n`;
          detailsMessage += `🎭 *Genres:* ${details.mainDetails.genres.join(', ') || 'N/A'}\n`;
          detailsMessage += `⭐ *Rating:* ${details.mainDetails.rating.value} (${details.mainDetails.rating.count} votes)\n\n`;

          detailsMessage += `\n🔽 *1.1 > Get Information*`;
          detailsMessage += `\n🔽 *1.2 > Get Images*\n`;
          detailsMessage += `🔽 *Download Options:*\n`;

          details.dllinks.directDownloadLinks.forEach((link, index) => {
            detailsMessage += `   ${index + 1}. ${link.quality} - ${link.size}\n`;
          });

          detailsMessage += `\n📌 *Instructions:*\n`;
          detailsMessage += `> Reply with quality number to download\n`;
          if (targetJid) {
            detailsMessage += `> Download will be sent to: ${targetJid}\n`;
          }

          // Prepare full details for 1.1 option
          let fullDetails = `🌟 *${details.mainDetails.maintitle}*\n\n`;
          fullDetails += `📅 *Release Date:* ${details.mainDetails.dateCreated || 'N/A'}\n`;
          fullDetails += `🌍 *Country:* ${details.mainDetails.country || 'N/A'}\n`;
          fullDetails += `⏱️ *Runtime:* ${details.mainDetails.runtime || 'N/A'}\n`;
          fullDetails += `🎭 *Genres:* ${details.mainDetails.genres.join(', ') || 'N/A'}\n`;
          fullDetails += `⭐ *Rating:* ${details.mainDetails.rating.value} (${details.mainDetails.rating.count} votes)\n\n`;

          if (details.moviedata.description) {
            fullDetails += `📝 *Description:*\n${details.moviedata.description}\n\n`;
          }

          if (details.moviedata.cast && details.moviedata.cast.length > 0) {
            fullDetails += `👥 *Cast:*\n`;
            details.moviedata.cast.forEach(actor => {
              fullDetails += `• ${actor.name} as ${actor.character}\n`;
            });
            fullDetails += '\n';
          }

          fullDetails += `🎬 *Director:* ${details.moviedata.director || 'N/A'}\n\n`;
          fullDetails += `> ${footer}`;

          const detailsMessageSent = await conn.sendMessage(from, {
            image: { url: details.mainDetails.imageUrl },
            caption: detailsMessage,
            contextInfo: {
              externalAdReply: {
                title: footer,
                body: slogan,
                thumbnailUrl: details.mainDetails.imageUrl,
                sourceUrl: selectedMovie.link,
                mediaType: 1
              }
            }
          }, { quoted: msg });

          const handleQualitySelection = async (qualityMsgUpsert) => {
            const qualityMsg = qualityMsgUpsert.messages[0];
            if (!qualityMsg.message || !qualityMsg.message.extendedTextMessage) return;

            const qualityReply = qualityMsg.message.extendedTextMessage.text.trim();
            const qualityContext = qualityMsg.message.extendedTextMessage.contextInfo;

            if (qualityContext && qualityContext.stanzaId === detailsMessageSent.key.id) {
              if (qualityReply === '1.1') {
                await conn.sendMessage(from, {
                  image: { url: details.mainDetails.imageUrl },
                  caption: fullDetails,
                  contextInfo: {
                    externalAdReply: {
                      title: footer,
                      body: slogan,
                      thumbnailUrl: details.mainDetails.imageUrl,
                      sourceUrl: selectedMovie.link,
                      mediaType: 1
                    }
                  }
                }, { quoted: qualityMsg });
                return;
              }

              if (qualityReply === '1.2') {
                if (details.moviedata.imageUrls && details.moviedata.imageUrls.length > 0) {
                  for (const imageUrl of details.moviedata.imageUrls) {
                    await conn.sendMessage(destinationJid, {
                      image: { url: imageUrl.trim() },
                      caption: `> ${footer}`,
                      contextInfo: {
                        externalAdReply: {
                          title: footer,
                          body: slogan,
                          thumbnailUrl: details.mainDetails.imageUrl,
                          sourceUrl: selectedMovie.link,
                          mediaType: 1
                        }
                      }
                    }, { quoted: qualityMsg });
                  }
                } else {
                  await reply("No additional images found for this movie.");
                }
                return;
              }

              const qualityIndex = parseInt(qualityReply) - 1;

              if (qualityIndex >= 0 && qualityIndex < details.dllinks.directDownloadLinks.length) {
                const selectedQuality = details.dllinks.directDownloadLinks[qualityIndex];

                try {
                  // Get final download link
                  const downloadResponse = await fetch(`https://asitha-moviedl.vercel.app/api/cinesubz/download?url=${encodeURIComponent(selectedQuality.link)}&apikey=asitha2005`);
                  const downloadInfo = await downloadResponse.json();

                  if (!downloadInfo.data?.data || downloadInfo.data.data.length === 0) {
                    throw new Error("Failed to get download link");
                  }

                  const downloadLink = downloadInfo.data.data[0].href;

                  // Send download status
                  await reply(`📥 *Downloading ${selectedQuality.quality}...*\n💾 *Size:* ${selectedQuality.size}`);
                  if (destinationJid !== from) {
                    await conn.sendMessage(destinationJid, {
                      image: { url: details.mainDetails.imageUrl },
                      caption: fullDetails,
                      contextInfo: {
                        externalAdReply: {
                          title: footer,
                          body: slogan,
                          thumbnailUrl: details.mainDetails.imageUrl,
                          sourceUrl: selectedMovie.link,
                          mediaType: 1
                        }
                      }
                    }, { quoted: msg });
                  }

                  // Send the file
                  await conn.sendMessage(destinationJid, {
                    document: { url: downloadLink },
                    mimetype: 'video/mp4',
                    fileName: `${details.mainDetails.maintitle.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedQuality.quality}.mp4`,
                    caption: `🎬 *${details.mainDetails.maintitle}*\n📊 *Quality:* ${selectedQuality.quality}\n💾 *Size:* ${selectedQuality.size}\n\n> ${footer}`
                  }, { quoted: qualityMsg });

                  // Send completion messages
                  await reply("✅ Download completed and sent!");
                  if (destinationJid !== from) {
                    await conn.sendMessage(from, {
                      text: `✅ Download completed and sent to ${destinationJid}!`
                    });
                  }
                } catch (error) {
                  console.error(`Error downloading/sending file:`, error);
                  reply(`❌ Error downloading/sending file: ${error.message}`);
                }

                conn.ev.off("messages.upsert", handleQualitySelection);
              } else {
                reply(`❌ Invalid quality number. Please choose between 1 and ${details.dllinks.directDownloadLinks.length}.`);
              }
            }
          };

          conn.ev.on("messages.upsert", handleQualitySelection);
        } else {
          reply(`❌ Invalid movie number. Please choose between 1 and ${movies.length}.`);
        }
      }
    };

    conn.ev.on("messages.upsert", handleUserReply);

  } catch (error) {
    console.error(error);
    reply(`🚨 An error occurred while searching CineSubz: ${error.message}`);
  }
});
//===============================================================
const scrapeBaiscopeSearchResults = async (searchTerm) => {
  try {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const url = `https://www.baiscope.lk/?s=${encodedSearchTerm}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    let results = [];

    $('.elementor-post__card').each((i, elem) => {
      const titleElement = $(elem).find('.elementor-post__title a');
      const title = titleElement.text().trim();
      const link = titleElement.attr('href');
      const thumbnailElement = $(elem).find('.elementor-post__thumbnail img');
      const thumbnail = thumbnailElement.attr('src');

      if (title && link) {
        results.push({ title, link, thumbnail });
      }
    });

    return {
      status: 'success',
      data: results,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Error occurred while scraping the site.',
    };
  }
};

/**
 * Scrapes movie information from a specific Baiscope movie page.
 * @param {string} url - The URL of the movie page.
 * @returns {Promise<Object>} - The movie information or an error message.
 */
// Import required libraries


/**
 * Scrapes movie information from a Baiscope URL
 * @param {string} url - The URL of the Baiscope movie page
 * @returns {Promise<Object>} - A promise that resolves to an object containing the scraped data or an error
 */
const scrapeBaiscopeMovieInfo = async (url) => {
  try {
    // Fetch the HTML content of the page
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract movie title
    const title = $('h1.cm-entry-title').text().trim() || $('h1.entry-title').text().trim();

    // Extract movie poster URL
    const poster = $('.wp-block-image img').attr('src') || $('img.wp-image-234873').attr('src');

    // Extract movie description
    const description = $('.cm-entry-summary p').first().text().trim() || 
                        $('.wp-block-group__inner-container p').first().text().trim();

    // Extract summary (paragraphs 2-5)
    const summaryParagraphs = [];
    $('.cm-entry-summary p').each((i, elem) => {
      if (i > 0 && i < 5) {
        summaryParagraphs.push($(elem).text().trim());
      }
    });
    const summary = summaryParagraphs.join('\n\n');

    // Extract download links
    const downloadLinks = [];
    $('a[href*="Downloads"]').each((i, elem) => {
      const linkText = $(elem).text().trim();
      const linkUrl = $(elem).attr('href');
      if (linkText && linkUrl) {
        downloadLinks.push({ text: linkText, url: linkUrl });
      }
    });

    // Extract IMDB rating
    const imdbRating = $('.imdbRatingPlugin').attr('data-title');

    // Extract categories
    const categories = [];
    $('.cm-post-categories a').each((i, elem) => {
      categories.push($(elem).text().trim());
    });

    // Return the scraped data
    return {
      status: 'success',
      data: {
        title,
        poster,
        description,
        summary,
        downloadLinks,
        pageUrl: url,
        imdbRating,
        categories,
      },
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      status: 'error',
      message: 'Error occurred while scraping the movie information.',
      error: error.message,
    };
  }
};
const fscrapeDownloadLink = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract the download link
    const downloadLink = $('#link').attr('href');

    return {
      status: 'success',
      author: 'Vishwa Mihiranga',
      data: {
        downloadLink,
        fullUrl: url,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      author: 'Vishwa Mihiranga',
      message: error.response?.data?.reason || error.message || 'Error occurred while scraping the download link.',
    };
  }
};
const fscrapeSearchResults = async (searchTerm) => {
  try {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const url = `https://firemovieshub.com/?s=${encodedSearchTerm}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    let results = [];

    // Check if there are no results
    if ($('.no-results').length) {
      return {
        status: 'error',
        author: 'AI Assistant',
        message: 'No results found for the specified search term.',
      };
    }

    // Extract movie information
    $('.result-item').each((i, elem) => {
      const title = $(elem).find('.title a').text().trim();
      const link = $(elem).find('.title a').attr('href');
      const thumbnailSrc = $(elem).find('.thumbnail img').attr('src');
      const type = $(elem).find('.movies').text().trim();
      const description = $(elem).find('.contenido p').text().trim();

      if (title && link) {
        results.push({
          title,
          link,
          thumbnail: thumbnailSrc,
          type,
          description,
        });
      }
    });

    return {
      status: 'success',
      author: 'Vishwa Mihiranga',
      data: results,
    };
  } catch (error) {
    return {
      status: 'error',
      author: 'Vishwa Mihiranga',
      message: error.response?.data?.reason || error.message || 'Error occurred while scraping the site.',
    };
  }
};
const fscrapeMovieInfo = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Helper functions
    const safeExtract = (selector, defaultValue = 'Not found') => {
      const element = $(selector);
      return element.length ? element.text().trim() : defaultValue;
    };

    const cleanText = (text) => {
      return text?.replace(/\s*\|\s*සිංහල උපසිරැසි සමඟ$/, '').trim() || '';
    };

    const cleanUrl = (url) => {
      if (!url) return '';
      return url.replace(/[\n\r\s]+/g, '').trim();
    };

    // Basic movie information
    const title = cleanText($('.sheader h1').text());
    const description = safeExtract('.wp-content p');
    const thumbnailSrc = cleanUrl($('.sheader .poster img').attr('src'));

    // Metadata
    const metadata = {
      tagline: safeExtract('.sheader .extra .tagline'),
      releaseDate: safeExtract('.sheader .extra .date'),
      runtime: safeExtract('.sheader .extra .runtime'),
      genres: $('.sgeneros a').map((_, el) => $(el).text().trim()).get(),
    };

    // Rating
    const rating = {
      value: safeExtract('.dt_rating_vgs'),
      count: safeExtract('.rating-count'),
    };

    // Download links
    const downloadLinks = [];
    $('.fix-table tbody tr').each((_, elem) => {
      const option = $(elem).find('td:first-child a');
      const quality = $(elem).find('td:nth-child(2) strong');
      const size = $(elem).find('td:last-child');

      if (option.length) {
        downloadLinks.push({
          option: option.text().trim(),
          quality: quality.text().trim(),
          size: size.text().trim(),
          link: cleanUrl(option.attr('href')),
        });
      }
    });

    // Construct successful response
    return {
      status: 'success',
      author: 'Vishwa Mihiranga',
      data: {
        title,
        description,
        thumbnail: thumbnailSrc,
        metadata,
        rating,
        downloadLinks,
        fullUrl: cleanUrl(url),
        scrapedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: 'error',
      author: 'Vishwa Mihiranga',
      message: error.response?.data?.reason || error.message || 'Error occurred while scraping the movie information.',
      url: cleanUrl(url),
      timestamp: new Date().toISOString(),
    };
  }
};
const sscrapeSearchResults = async (searchTerm) => {
  try {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const url = `https://sinhalasub.lk/?s=${encodedSearchTerm}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    let results = [];

    // Check if there are no results
    if ($('.no-results').length) {
      return {
        status: 'error',
        author: 'AI Assistant',
        message: 'No results found for the specified search term.',
      };
    }

    // Extract movie information
    $('.result-item').each((i, elem) => {
      const title = $(elem).find('.title a').text().trim();
      const link = $(elem).find('.title a').attr('href');
      const thumbnailSrc = $(elem).find('.thumbnail img').attr('src');
      const rating = $(elem).find('.rating').text().trim();
      const year = $(elem).find('.year').text().trim();
      const description = $(elem).find('.contenido p').text().trim();
      const type = $(elem).find('.movies').text().trim();

      if (title && link) {
        results.push({ 
          title, 
          link,
          thumbnail: thumbnailSrc,
          rating,
          year,
          description,
          type
        });
      }
    });

    return {
      status: 'success',
      author: 'Vishwa MIhiranga',
      data: results,
    };
  } catch (error) {
    return {
      status: 'error',
      author: 'Vishwa Mihiranga',
      message: error.response?.data?.reason || error.message || 'Error occurred while scraping the site.',
    };
  }
};

/**
 * Scrapes movie information from a specific sinhalasub.lk movie page.
 * @param {string} url - The URL of the movie page.
 * @returns {Promise<Object>} - The movie information or an error message.
 */
const sscrapeMovieInfo = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Helper functions
    const safeExtract = (selector, defaultValue = 'Not found') => {
      const element = $(selector);
      return element.length ? element.text().trim() : defaultValue;
    };

    const cleanText = (text) => {
      return text?.replace(/\s*\|\s*සිංහල උපසිරසි සමඟ$/, '').trim() || '';
    };

    const cleanUrl = (url) => {
      if (!url) return '';
      return url.replace(/[\n\r\s]+/g, '').trim();
    };

    // Basic movie information
    const title = cleanText(safeExtract('.sheader .data .head h1'));
    const description = safeExtract('.wp-content p');
    const thumbnailSrc = cleanUrl($('.sheader .poster img').attr('src'));

    // Metadata
    const metadata = {
      tagline: safeExtract('.sheader .data .extra .tagline'),
      releaseDate: safeExtract('.sheader .data .extra .date'),
      country: safeExtract('.sheader .data .extra .country'),
      runtime: safeExtract('.sheader .data .extra .runtime'),
      genres: $('.sheader .data .sgeneros a').map((_, el) => $(el).text().trim()).get(),
    };

    // Rating
    const rating = {
      value: safeExtract('.dt_rating_vgs'),
      count: safeExtract('.rating-count'),
    };

    // Download links
    const downloadLinks = [];
    $('#download .links_table tbody tr').each((_, elem) => {
      const option = $(elem).find('td:first-child a');
      const quality = $(elem).find('td:nth-child(2) strong');
      const size = $(elem).find('td:last-child');

      if (option.length) {
        downloadLinks.push({
          option: option.text().trim(),
          quality: quality.text().trim(),
          size: size.text().trim(),
          link: cleanUrl(option.attr('href'))
        });
      }
    });

    // Gallery images - Fixed version
    const gallery = {
      images: [],
      count: 0
    };

    const galleryItems = $('#dt_galery .g-item');
    if (galleryItems.length > 0) {
      galleryItems.each((_, elem) => {
        const link = $(elem).find('a').first();
        const img = $(elem).find('img').first();

        const fullSizeUrl = cleanUrl(link.attr('href'));
        const thumbnailUrl = cleanUrl(img.attr('src'));
        const title = cleanText(link.attr('title'));
        const alt = cleanText(img.attr('alt'));

        if (fullSizeUrl && thumbnailUrl) {
          gallery.images.push({
            fullSize: fullSizeUrl,
            thumbnail: thumbnailUrl,
            title,
            alt
          });
        }
      });

      gallery.count = gallery.images.length;
    }

    // Cast information
    const cast = [];
    $('.persons .person').each((_, elem) => {
      const name = $(elem).find('.name').text().trim();
      const role = $(elem).find('.data .caracter').text().trim();
      const image = cleanUrl($(elem).find('img').attr('src'));

      if (name) {
        cast.push({
          name,
          role,
          image
        });
      }
    });

    // Additional information
    const additionalInfo = {
      imdbRating: safeExtract('.extra .imdb span'),
      quality: safeExtract('.extra .quality span'),
      views: safeExtract('.extra .views span'),
      status: safeExtract('.extra .status span'),
    };

    // Debug log for gallery
    console.log('Gallery items found:', galleryItems.length);
    console.log('Processed gallery images:', gallery.images.length);

    // Construct successful response
    return {
      status: 'success',
      author: 'Vishwa Mihiranga',
      data: {
        title,
        description,
        thumbnail: thumbnailSrc,
        metadata,
        rating,
        downloadLinks,
        gallery,
        cast: cast.length > 0 ? cast : undefined,
        additionalInfo,
        fullUrl: cleanUrl(url),
        scrapedAt: new Date().toISOString()
      },
    };

  } catch (error) {
    console.error('Scraping error:', error);
    // Error response
    return {
      status: 'error',
      author: 'Vishwa Mihiranga',
      message: error.response?.data?.reason || error.message || 'Error occurred while scraping the movie information.',
      url: cleanUrl(url),
      timestamp: new Date().toISOString()
    };
  }
};

const scrapeDownloadLink = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract the download link
    const fullDownloadLink = $('#link').attr('href');

    // Extract the file ID from the full download link
    const fileId = fullDownloadLink.split('/').pop();

    // Construct the pixeldrain API URL
    const pixeldrainApiUrl = `https://pixeldrain.com/api/file/${fileId}`;

    return {
      status: 'success',
      author: 'Vishwa Mihiranga',
      data: {
        downloadLink: pixeldrainApiUrl,
        fullUrl: url,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      author: 'Vishwa Mihiranga',
      message: error.response?.data?.reason || error.message || 'Error occurred while scraping the download link.',
    };
  }
};
/*
//=================================================================
cmd({
  pattern: "subdl",
  alias: ["bs"],
  desc: "Search for Baiscope movies related to a query.",
  react: "🎬",
  category: "search",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
      const fullInput = args.join(' '); // Joining args to get full input
      const [searchQuery, targetJid] = fullInput.split('|').map(str => str.trim());
      const destinationJid = targetJid ? targetJid : from; // Use targetJid if provided, else default to from

      // Validate JID if provided
      if (targetJid && !targetJid.includes('@')) {
          return reply("❌ Invalid JID format. Use: query | JID (e.g., harry potter | 123456789@g.us)");
      }

      // Default query if none provided
      const query = searchQuery || "deadpool"; 

      // Scrape Baiscope search results
      const results = await scrapeBaiscopeSearchResults(query);
      if (results.status === 'error') {
          return reply(`❌ ${results.message}`);
      }

      const movieData = results.data;
      if (!movieData || movieData.length === 0) {
          return reply("❌ No movies found for the query.");
      }

      let resultMessage = `*[ BAISCOPE.LK SEARCH RESULT '${query}'🎉 ]*:\n\n`;
      movieData.forEach((movie, index) => {
          resultMessage += `🎬 *${index + 1}.* ${movie.title}\n\n`;
      });

      resultMessage += `\n> Reply with the number(s) of the movie(s) you want details for.\n`;
      resultMessage += `> Example: 1,3,5\n`;
      resultMessage += `> Type 'done' when you're finished.\n`;
      resultMessage += `> ʙʜᴀꜱʜɪ • ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ-ᴡᴀ-ʙᴏᴛ ㋛`;

      const sentMessage = await conn.sendMessage(from, {
          text: resultMessage,
          contextInfo: {
              externalAdReply: {
                  title: footer,
                  body: slogan,
                  sourceUrl: "https://www.baiscope.lk/"
              }
          }
      }, { quoted: mek });

      const handleUserReply = async (messageUpsert) => {
          const msg = messageUpsert.messages[0];
          if (!msg.message || !msg.message.extendedTextMessage) return;

          const userReply = msg.message.extendedTextMessage.text.trim().toLowerCase();
          const messageContext = msg.message.extendedTextMessage.contextInfo;

          if (messageContext && messageContext.stanzaId === sentMessage.key.id) {
              if (userReply === 'done') {
                  conn.ev.off("messages.upsert", handleUserReply);
                  return reply("Thank you for using Baiscope search. Search ended.");
              }

              const selectedIndices = userReply.split(',').map(num => parseInt(num.trim()) - 1);
              await conn.sendMessage(from, { react: { text: "🔢", key: msg.key } });

              for (const index of selectedIndices) {
                  if (index >= 0 && index < movieData.length) {
                      const movie = movieData[index];
                      const movieLink = movie.link.startsWith('http') ? movie.link : `https://www.baiscope.lk${movie.link}`;
                      const movieDetails = await scrapeBaiscopeMovieInfo(movieLink);

                      if (movieDetails.status === 'success') {
                          const details = movieDetails.data;
                          const movieInfoMessage = `🌟 *${details.title || 'N/A'}*\n\n` +
                              `📝 *Summary >* ${details.summary || 'N/A'}\n\n` +
                              `🔗 *Link >* ${details.pageUrl || 'N/A'}\n\n` +
                              `🏷️ *Categories >* ${details.categories ? details.categories.join(', ') : 'N/A'}\n`;

                          const sentMovieMessage = await conn.sendMessage(from, {
                              text: movieInfoMessage,
                              contextInfo: {
                                  externalAdReply: {
                                      title: footer,
                                      body: slogan,
                                      sourceUrl: details.pageUrl || 'https://www.baiscope.lk/'
                                  }
                              }
                          }, { quoted: msg });

                          if (details.downloadLinks && Array.isArray(details.downloadLinks) && details.downloadLinks.length > 0) {
                              for (const link of details.downloadLinks) {
                                  if (link && link.text && link.url) {
                                      await conn.sendMessage(from, { text: `🗒️ Downloading Subtitles - ${link.text}` }, { quoted: sentMovieMessage });

                                      const subtitleResponse = await axios.get(link.url);
                                      if (!subtitleResponse.data) {
                                          throw new Error(`❌ Failed to download/send subtitle.`);
                                      }

                                      const subtitleBuffer = subtitleResponse.data;
                                      const subtitleFileName = `subtitle_${Date.now()}.srt`;

                                      await conn.sendMessage(destinationJid, {
                                          document: {
                                              url: link.url
                                          },
                                          mimetype: 'text/plain',
                                          fileName: `ʙʜᴀꜱʜɪ ᴍᴅ 2024™️|${subtitleFileName}`,
                                        caption: footer
                                      }, { quoted: sentMovieMessage });
                                  }
                              }
                          }
                      } else {
                          reply(`❌ Invalid movie selection: ${index + 1}. ${movieDetails.message}`);
                      }
                  } else {
                      reply(`❌ Invalid movie number: ${index + 1}`);
                  }
              }
          }
      };

      conn.ev.on("messages.upsert", handleUserReply);

  } catch (e) {
      console.error('Error executing subdl command:', e);
      reply('An error occurred while processing your request.');
  }
});

cmd({
  pattern: "fmovie",
  alias: ["fm"],
  desc: "Search and download movies from FireMoviesHub with direct scraping support",
  react: "🎬",
  category: "search",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    // Parse query and target JID if provided (format: query | jid)
    const fullInput = args.join(' ') || "harry potter";
    const [query, targetJid] = fullInput.split('|').map(str => str.trim());
    const destinationJid = targetJid || from;

    // Validate JID if provided
    if (targetJid && !targetJid.includes('@')) {
      return reply("❌ Invalid JID format. Use: query | JID (e.g., harry potter | 123456789@g.us)");
    }

    // Search progress reaction
    await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

    // Perform direct search using scraper
    const searchResults = await fscrapeSearchResults(query);

    if (searchResults.status === 'error' || !searchResults.data || searchResults.data.length === 0) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("❌ No movies found for the query.");
    }

    // Format search results with more details
    let resultMessage = `*[ 🎊 FIREMOVIES.HUB SEARCH RESULT '${query}'🎉 ]*\n\n`;
    searchResults.data.forEach((movie, index) => {
      resultMessage += `🎬 *${index + 1}.* ${movie.title}\n`;
      if (movie.type) resultMessage += `📽️ Type: ${movie.type}\n`;
      if (movie.description) {
        const shortDesc = movie.description.length > 100 ? 
          movie.description.substring(0, 100) + '...' : 
          movie.description;
        resultMessage += `📝 Description: ${shortDesc}\n`;
      }
      resultMessage += '\n';
    });

    resultMessage += `\n📌 *Instructions:*\n`;
    resultMessage += `> Reply with movie number (1-${searchResults.data.length}) for details\n`;
    resultMessage += `> Type 'done' to end search\n`;
    if (targetJid) {
      resultMessage += `> Download will be sent to: ${targetJid}\n\n`;
    }
    resultMessage += `> ${footer}`;

    const thumbnailUrl = searchResults.data[0]?.thumbnail || 
      'https://i.ibb.co/2jNJs5q/94d829c1-de36-4b7f-9d4d-f0566c361b61-1.jpg';

    const sentMessage = await conn.sendMessage(from, {
      text: resultMessage,
      contextInfo: {
    externalAdReply: {
      title: footer ,
      body: slogan,
      thumbnailUrl: 'https://i.ibb.co/F3VtTx6/Whats-App-Image-2024-10-29-at-1-29-11-AM.jpg',
      sourceUrl: `https://bhashi-md-ofc.netlify.app`,
      mediaType: 1
    }
      }
    }, { quoted: mek });

    const handleUserReply = async (messageUpsert) => {
      const msg = messageUpsert.messages[0];
      if (!msg.message || !msg.message.extendedTextMessage) return;

      const userReply = msg.message.extendedTextMessage.text.trim().toLowerCase();
      const messageContext = msg.message.extendedTextMessage.contextInfo;

      if (messageContext && messageContext.stanzaId === sentMessage.key.id) {
        // React to user's reply
        await conn.sendMessage(from, { react: { text: "🔄", key: msg.key } });

        if (userReply === 'done') {
          conn.ev.off("messages.upsert", handleUserReply);
          await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });
          return reply("Thank you for using FireMoviesHub search. Search ended.");
        }

        const movieIndex = parseInt(userReply) - 1;

        if (movieIndex >= 0 && movieIndex < searchResults.data.length) {
          const selectedMovie = searchResults.data[movieIndex];

          // Fetch detailed movie information using scraper
          const movieDetails = await fscrapeMovieInfo(selectedMovie.link);

          if (movieDetails.status === 'error') {
            return reply(`❌ Error fetching movie details: ${movieDetails.message}`);
          }

          const details = movieDetails.data;

          // Create detailed movie information messages
          let detailsMessage = `🌟 *${details.title}*\n\n`;

          // Add metadata section
          detailsMessage += `📅 *Release Date:* ${details.metadata.releaseDate || 'N/A'}\n`;
          detailsMessage += `⏱️ *Runtime:* ${details.metadata.runtime || 'N/A'}\n`;
          detailsMessage += `🎭 *Genres:* ${details.metadata.genres.join(', ') || 'N/A'}\n`;
          if (details.metadata.tagline) {
            detailsMessage += `💭 *Tagline:* ${details.metadata.tagline}\n`;
          }
          detailsMessage += `⭐ *Rating:* ${details.rating.value} (${details.rating.count})\n\n`;

          // Add download options
          detailsMessage += `🔽 *Download Options:*\n`;
          details.downloadLinks.forEach((link, index) => {
            detailsMessage += `   ${index + 1}. ${link.option} - ${link.quality} (${link.size})\n`;
          });

          detailsMessage += `\n📌 *Instructions:*\n`;
          detailsMessage += `> Reply with quality number to download\n`;
          if (targetJid) {
            detailsMessage += `> Download will be sent to: ${targetJid}\n`;
          }

          let fullDetails = `🌟 *${details.title}*\n\n`;

          // Add metadata section for full details
          fullDetails += `📅 *Release Date:* ${details.metadata.releaseDate || 'N/A'}\n`;
          fullDetails += `⏱️ *Runtime:* ${details.metadata.runtime || 'N/A'}\n`;
          fullDetails += `🎭 *Genres:* ${details.metadata.genres.join(', ') || 'N/A'}\n`;
          if (details.metadata.tagline) {
            fullDetails += `💭 *Tagline:* ${details.metadata.tagline}\n`;
          }
          fullDetails += `⭐ *Rating:* ${details.rating.value} (${details.rating.count})\n\n`;

          // Add description if available
          if (details.description) {
            fullDetails += `📝 *Description:*\n${details.description}\n\n`;
          }
          fullDetails += `> ${footer}`;


          const detailsMessageSent = await conn.sendMessage(from, {
             image: { url: details.thumbnail},
            caption : detailsMessage,
            contextInfo: {
    externalAdReply: {
      title: footer ,
      body: slogan,
      thumbnailUrl: 'https://i.ibb.co/F3VtTx6/Whats-App-Image-2024-10-29-at-1-29-11-AM.jpg',
      sourceUrl: `https://bhashi-md-ofc.netlify.app`,
      mediaType: 1
    }
            }
          }, { quoted: msg });

          const handleQualitySelection = async (qualityMsgUpsert) => {
            const qualityMsg = qualityMsgUpsert.messages[0];
            if (!qualityMsg.message || !qualityMsg.message.extendedTextMessage) return;

            const qualityReply = qualityMsg.message.extendedTextMessage.text.trim();
            const qualityContext = qualityMsg.message.extendedTextMessage.contextInfo;

            if (qualityContext && qualityContext.stanzaId === detailsMessageSent.key.id) {
              const qualityIndex = parseInt(qualityReply) - 1;

              // React to quality selection
              await conn.sendMessage(from, { react: { text: "🔍", key: qualityMsg.key } });

              if (qualityIndex >= 0 && qualityIndex < details.downloadLinks.length) {
                const selectedQuality = details.downloadLinks[qualityIndex];

                try {
                  // Get final download link
                  const downloadInfo = await fscrapeDownloadLink(selectedQuality.link);

                  if (downloadInfo.status === 'error') {
                    throw new Error(downloadInfo.message);
                  }

                  const downloadLink = downloadInfo.data.downloadLink;

                  await reply(`📥 *Downloading ${selectedQuality.quality}...*\n💾 Size: ${selectedQuality.size}`);
                  if (destinationJid !== from) {
                    await conn.sendMessage(destinationJid, {
             image: { url: details.thumbnail},
            caption : fullDetails,
            contextInfo: {
    externalAdReply: {
      title: footer ,
      body: slogan,
      thumbnailUrl: 'https://i.ibb.co/F3VtTx6/Whats-App-Image-2024-10-29-at-1-29-11-AM.jpg',
      sourceUrl: `https://bhashi-md-ofc.netlify.app`,
      mediaType: 1
    }
            }
          }, { quoted: msg });
                    await conn.sendMessage(destinationJid, {
                      document: { url: downloadLink },
                      mimetype: 'video/mp4',
                      fileName: `ʙʜᴀꜱʜɪ ᴍᴅ 2024™️|${details.title.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedQuality.quality}.mp4`,
                      caption: `🎬 *${details.title}*\n_* 📦 ${selectedQuality.quality} | 📤 ${selectedQuality.size}*_\n\n> ${footer}\n`
                    }, { quoted: qualityMsg });
                  }

                  // Send completion messages
                  await reply("✅ Download completed and sent!");
                  if (destinationJid !== from) {
                    await conn.sendMessage(from, {
                      text: `✅ Download completed and sent to ${destinationJid}!`
                    });
                  }
                } catch (error) {
                  console.error(`Error downloading/sending file:`, error);
                  reply(`❌ Error downloading/sending file: ${error.message}`);
                }

                conn.ev.off("messages.upsert", handleQualitySelection);
              } else {
                reply(`❌ Invalid quality number. Please choose between 1 and ${details.downloadLinks.length}.`);
              }
            }
          };

          conn.ev.on("messages.upsert", handleQualitySelection);
        } else {
          reply(`❌ Invalid movie number. Please choose between 1 and ${searchResults.data.length}.`);
        }
      }
    };

    conn.ev.on("messages.upsert", handleUserReply);

  } catch (error) {
    console.error(error);
    reply(`🚨 An error occurred while searching FireMoviesHub: ${error.message}`);
  }
});
*/
cmd({
  pattern: "dl2",
  alias: ["dlf", "fastdl"],
  desc: "Download files from direct links. Can send to specific JID using |",
  category: "downloader",
  react: "📥",
  filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {

  // Split input to get URL and target JID
  const fullInput = args.join(" ");
  const [url, targetJid] = fullInput.split('|').map(str => str.trim());
  const destinationJid = targetJid || from;

  if (!url) {
      await m.react("❌");
      return reply("*Please provide a valid download link*\n\n*Usage:*\n*.dl2 [url]*\n*.dl2 [url] | [jid]*\n\n*Example:*\n*.dl2 https://example.com/file.pdf*\n*.dl2 https://example.com/file.pdf | 1234567890@g.us*");
  }

  // Validate JID if provided
  if (targetJid && !targetJid.includes('@')) {
      await m.react("❌");
      return reply("❌ Invalid JID format. Use: url | JID (e.g., https://example.com/file.pdf | 123456789@g.us)");
  }

  try {
      // Send initial processing message
      await m.react("⏳");
      await reply(`*⏳ Processing your download request...*${targetJid ? `\n*🎯 Sending to:* ${targetJid}` : ''}`);

      // Configure headers for the request
      const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
      };

      // First make a HEAD request to get content type and size
      const headResponse = await axios.head(url, { headers });
      const contentType = headResponse.headers['content-type'] || 'application/octet-stream';
      const contentDisposition = headResponse.headers['content-disposition'];

      // Extract filename from content-disposition, URL, or generate one
      let fileName = '';
      if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches && matches[1]) {
              fileName = matches[1].replace(/['"]/g, '');
          }
      }

      // If no filename from content-disposition, try to get from URL
      if (!fileName) {
          const urlParts = url.split('/');
          fileName = urlParts[urlParts.length - 1].split('?')[0]; // Remove query parameters
          fileName = decodeURIComponent(fileName); // Decode URL-encoded characters
          fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-'); // Remove invalid characters
      }

      // If still no filename, generate one
      if (!fileName || fileName === '') {
          fileName = 'downloaded_file';
      }

      // Add appropriate extension based on content type if filename doesn't have one
      if (!fileName.includes('.')) {
          const ext = getExtensionFromMimeType(contentType);
          fileName = `${fileName}.${ext}`;
      }

      // Download and send file
      await conn.sendMessage(destinationJid, {
          document: { url: url },
          fileName: fileName,
          mimetype: contentType,
          caption: `*📁 File:* ${fileName}${targetJid ? '\n*📤 Forwarded by:* ' + pushname : '\n*💫 Downloaded by:* ' + pushname}\n\n*> ${footer}`
      }, { quoted: m });

      // React to success
      await m.react("✅");

      // If sent to different JID, notify sender
      if (targetJid) {
          await reply(`*✅ File sent successfully to:* ${targetJid}`);
      }

  } catch (error) {
      console.error("Error in dl2 command:", error);
      await reply("❌ Failed to download file. Please make sure the link is valid and accessible.");
      await m.react("❌");
  }
});

// Helper function to get file extension from MIME type
function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/zip': 'zip',
      'application/x-rar-compressed': 'rar',
      'application/x-7z-compressed': '7z',
      'video/mp4': 'mp4',
      'video/x-matroska': 'mkv',
      'video/x-msvideo': 'avi',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'text/plain': 'txt',
      'text/csv': 'csv',
      'application/json': 'json',
      'application/vnd.android.package-archive': 'apk'
  };

  return mimeToExt[mimeType] || 'bin';
}
//================================================================
cmd({
  pattern: "dl",
  alias: ["direct", "file"],
  desc: "Send any type of file directly. Can send to specific JID using |",
  category: "downloader",
  react: "🎥",
  filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {

  // Split input to get URL and target JID
  const fullInput = args.join(" ");
  const [url, targetJid] = fullInput.split('|').map(str => str.trim());
  const destinationJid = targetJid || from;

  if (!url) {
      await m.react("❌");
      return reply("*Please provide a direct file URL*\n\n*Usage:*\n*.dl [url]*\n*.dl [url] | [jid]*\n\n*Example:*\n*.dl https://example.com/file.pdf*\n*.dl https://example.com/file.pdf | 1234567890@g.us*");
  }

  // Validate JID if provided
  if (targetJid && !targetJid.includes('@')) {
      await m.react("❌");
      return reply("❌ Invalid JID format. Use: url | JID (e.g., https://example.com/file.pdf | 123456789@g.us)");
  }

  try {
      // Send initial processing message
      await m.react("⏳");
      await reply(`*⏳ Processing your request...*${targetJid ? `\n*🎯 Sending to:* ${targetJid}` : ''}`);

      // Detect file type from URL
      const fileType = getFileTypeFromUrl(url);
      const fileName = getFileNameFromUrl(url);

      // Download and send file
      await conn.sendMessage(destinationJid, {
          document: { url: url },
          fileName: fileName,
          mimetype: fileType,
          caption: `*📁 File :* ${fileName}${targetJid ? '\n*📤 Forwarded by:* ' + pushname : ''}\n\n> ${footer}`
      }, { quoted: m });

      // React to success
      await m.react("✅");

      // If sent to different JID, notify sender
      if (targetJid) {
          await reply(`*✅ File sent successfully to:* ${targetJid}`);
      }

  } catch (error) {
      console.error("Error in dl command:", error);
      await reply("❌ Failed to process file. Please ensure the URL is valid and accessible.");
      await m.react("❌");
  }
});

// Helper function to get file type from URL
function getFileTypeFromUrl(url) {
  const extension = url.split('.').pop().toLowerCase();
  const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'mp4': 'video/mp4',
      'mkv': 'video/x-matroska',
      'avi': 'video/x-msvideo',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'apk': 'application/vnd.android.package-archive'
  };
  return mimeTypes[extension] || 'application/octet-stream';
}

// Helper function to get filename from URL
function getFileNameFromUrl(url) {
  try {
      const urlParts = url.split('/');
      let fileName = urlParts[urlParts.length - 1];
      // Remove query parameters if present
      fileName = fileName.split('?')[0];
      // Decode URL-encoded characters
      fileName = decodeURIComponent(fileName);
      // Replace invalid filename characters
      fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');
      return fileName || 'downloaded_file';
  } catch (error) {
      return 'downloaded_file';
  }
}

cmd({
  pattern: "sinhalasub",
  alias: ["s2", "ss"],
  desc: "Search and download movies from SinhalaSubLK with direct scraping support",
  react: "🎬",
  category: "search",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    // Parse query and target JID if provided (format: query | jid)
    const fullInput = args.join(' ') || "harry potter";
    const [query, targetJid] = fullInput.split('|').map(str => str.trim());
    const destinationJid = targetJid || from;

    // Validate JID if provided
    if (targetJid && !targetJid.includes('@')) {
      return reply("❌ Invalid JID format. Use: query | JID (e.g., harry potter | 123456789@g.us)");
    }

    // Search progress reaction
    await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

    // Perform direct search using scraper
    const searchResults = await sscrapeSearchResults(query);

    if (searchResults.status === 'error' || !searchResults.data || searchResults.data.length === 0) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("❌ No movies found for the query.");
    }

    // Format search results with more details
    let resultMessage = `*[ 🎊 SINHALASUB.LK SEARCH RESULT '${query}'🎉 ]*\n\n`;
    searchResults.data.forEach((movie, index) => {
      resultMessage += `🎬 *${index + 1}. ${movie.title}*\n`;
      if (movie.year) resultMessage += `📅 ${movie.year} | `;
      if (movie.rating) resultMessage += `⭐ ${movie.rating} | `;
      if (movie.type) resultMessage += `📽️ ${movie.type}\n`;
      resultMessage += '\n';
    });

    resultMessage += `\n📌 *Instructions:*\n`;
    resultMessage += `> Reply with movie number (1-${searchResults.data.length}) for details\n`;
    resultMessage += `> Type 'done' to end search\n`;
    if (targetJid) {
      resultMessage += `> Download will be sent to: ${targetJid}\n`;
    }
    resultMessage += `\n> ${footer}`;

    const thumbnailUrl = searchResults.data[0]?.thumbnail || 
      'https://i.ibb.co/2jNJs5q/94d829c1-de36-4b7f-9d4d-f0566c361b61-1.jpg';

    const sentMessage = await conn.sendMessage(from, {
      text: resultMessage,
      contextInfo: {
        externalAdReply: {
          title: footer,
          body: `Found ${searchResults.data.length} results` ,
          thumbnail: { url: thumbnailUrl },
          mediaType: 2,
          mediaUrl: "https://sinhalasub.lk/"
        }
      }
    }, { quoted: mek });

    const handleUserReply = async (messageUpsert) => {
      const msg = messageUpsert.messages[0];
      if (!msg.message || !msg.message.extendedTextMessage) return;

      const userReply = msg.message.extendedTextMessage.text.trim().toLowerCase();
      const messageContext = msg.message.extendedTextMessage.contextInfo;

      if (messageContext && messageContext.stanzaId === sentMessage.key.id) {
        // React to user's reply
        await conn.sendMessage(from, { react: { text: "🔄", key: msg.key } });

        if (userReply === 'done') {
          conn.ev.off("messages.upsert", handleUserReply);
          await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });
          return reply("Thank you for using SinhalaSubLK search. Search ended.");
        }

        const movieIndex = parseInt(userReply) - 1;

        if (movieIndex >= 0 && movieIndex < searchResults.data.length) {
          const selectedMovie = searchResults.data[movieIndex];

          // Fetch detailed movie information using scraper
          const movieDetails = await sscrapeMovieInfo(selectedMovie.link);

          if (movieDetails.status === 'error') {
            return reply(`❌ Error fetching movie details: ${movieDetails.message}`);
          }

          const details = movieDetails.data;

          // Create detailed movie information messages
          let detailsMessage = `🌟 *${details.title}*\n\n`;

          // Add metadata section
          detailsMessage += `📅 *Release Date:* ${details.metadata.releaseDate || 'N/A'}\n`;
          detailsMessage += `🌍 *Country:* ${details.metadata.country || 'N/A'}\n`;
          detailsMessage += `⏱️ *Runtime:* ${details.metadata.runtime || 'N/A'}\n`;
          detailsMessage += `🎭 *Genres:* ${details.metadata.genres.join(', ') || 'N/A'}\n`;
          if (details.metadata.tagline) {
            detailsMessage += `💭 *Tagline:* ${details.metadata.tagline}\n`;
          }
          detailsMessage += `⭐ *Rating:* ${details.rating.value} (${details.rating.count})\n\n`;

          detailsMessage += `\n 🔽 *1.1 > Get infotmations* `;
          detailsMessage += `\n 🔽 *1.2 > Get Images*\n `;
          detailsMessage += `🔽 *Download Options:*\n`;
          details.downloadLinks.forEach((link, index) => {
            detailsMessage += `   ${index + 1}. ${link.option} - ${link.quality} (${link.size})\n`;
          });

          detailsMessage += `\n📌 *Instructions:*\n`;
          detailsMessage += `> Reply with quality number to download\n`;
          if (targetJid) {
            detailsMessage += `> Download will be sent to: ${targetJid}\n`;
          }

          let fullDetails = `🌟 *${details.title}*\n\n`;

          // Add metadata section for full details
          fullDetails += `📅 *Release Date:* ${details.metadata.releaseDate || 'N/A'}\n`;
          fullDetails += `🌍 *Country:* ${details.metadata.country || 'N/A'}\n`;
          fullDetails += `⏱️ *Runtime:* ${details.metadata.runtime || 'N/A'}\n`;
          fullDetails += `🎭 *Genres:* ${details.metadata.genres.join(', ') || 'N/A'}\n`;
          if (details.metadata.tagline) {
            fullDetails += `💭 *Tagline:* ${details.metadata.tagline}\n`;
          }
          fullDetails += `⭐ *Rating:* ${details.rating.value} (${details.rating.count})\n\n`;

          // Add description if available and remove text after "ලිපිය උපුටා ගැනීම"
          if (details.description) {
            // Split the description at the specific phrase and take the first part
            const descriptionParts = details.description.split("ලිපිය උපුටා ගැනීම");
            const cleanDescription = descriptionParts[0].trim(); // Take the part before the phrase

            fullDetails += `📝 *Description:*\n${cleanDescription}\n\n`;
          }

          // Add footer
          fullDetails += `> ${footer}`;

          const detailsMessageSent = await conn.sendMessage(from, {
            image: { url: details.gallery?.images[0]?.thumbnail },
            caption: detailsMessage,
            contextInfo: {
              externalAdReply: {
      title: footer ,
      body: slogan,
      thumbnailUrl: 'https://i.ibb.co/F3VtTx6/Whats-App-Image-2024-10-29-at-1-29-11-AM.jpg',
      sourceUrl: `https://bhashi-md-ofc.netlify.app`,
      mediaType: 1
              }
            }
          }, { quoted: msg });

          const handleQualitySelection = async (qualityMsgUpsert) => {
            const qualityMsg = qualityMsgUpsert.messages[0];
            if (!qualityMsg.message || !qualityMsg.message.extendedTextMessage) return;

            const qualityReply = qualityMsg.message.extendedTextMessage.text.trim();
            const qualityContext = qualityMsg.message.extendedTextMessage.contextInfo;

            if (qualityContext && qualityContext.stanzaId === detailsMessageSent.key.id) {
              if (qualityReply === '1.1') {
                await conn.sendMessage(from, {
                  image: { url: details.gallery?.images[0]?.thumbnail },
                  caption: fullDetails,
                  contextInfo: {
                    externalAdReply: {
                      title: footer,
                      body: slogan,
                      thumbnailUrl: 'https://i.ibb.co/F3VtTx6/Whats-App-Image-2024-10-29-at-1-29-11-AM.jpg',
                      sourceUrl: `https://bhashi-md-ofc.netlify.app`,
                      mediaType: 1
                    }
                  }
                }, { quoted: qualityMsg });
                return;
              }
              if (qualityReply === '1.2') {
                // Check if there are images in the gallery
                if (details.gallery?.images && details.gallery.images.length > 0) {
                  // Loop through each image in the gallery
                  for (let i = 0; i < details.gallery.images.length; i++) {
                    const image = details.gallery.images[i];

                    // Send the image with the caption
                    await conn.sendMessage(destinationJid, {
                      image: { url: image.thumbnail },
                      caption: `> ${footer}`,
                      contextInfo: {
                        externalAdReply: {
                          title: footer,
                          body: slogan,
                          thumbnailUrl: 'https://i.ibb.co/F3VtTx6/Whats-App-Image-2024-10-29-at-1-29-11-AM.jpg',
                          sourceUrl: `https://bhashi-md-ofc.netlify.app`,
                          mediaType: 1
                        }
                      }
                    }, { quoted: qualityMsg });
                  }
                } else {
                  // Handle the case when there are no images
                  await conn.sendMessage(from, {
                    text: "No images found in the gallery."
                  }, { quoted: qualityMsg });
                }
                return;
              }
              const qualityIndex = parseInt(qualityReply) - 1;

              // React to quality selection
              await conn.sendMessage(from, { react: { text: "🔍", key: qualityMsg.key } });

              if (qualityIndex >= 0 && qualityIndex < details.downloadLinks.length) {
                const selectedQuality = details.downloadLinks[qualityIndex];

                try {
                  // Get final download link
                  const downloadInfo = await scrapeDownloadLink(selectedQuality.link);

                  if (downloadInfo.status === 'error') {
                    throw new Error(downloadInfo.message);
                  }

                  const downloadLink = downloadInfo.data.downloadLink;

                  // Send download status
                  await reply(`📥 *Downloading ${selectedQuality.quality}...*\n💾 *Size:* ${selectedQuality.size}`);
                  if (destinationJid !== from) {
                    await conn.sendMessage(destinationJid, {
  image: { url: details.gallery?.images[0]?.thumbnail },
  caption: fullDetails,
  contextInfo: {
    externalAdReply: {
      title: footer ,
      body: slogan,
      thumbnailUrl: 'https://i.ibb.co/F3VtTx6/Whats-App-Image-2024-10-29-at-1-29-11-AM.jpg',
      sourceUrl: `https://bhashi-md-ofc.netlify.app`,
      mediaType: 1
    }
  }
}, { quoted: msg });
                  }

                  // Send the file
                  await conn.sendMessage(destinationJid, {
                    document: { url: downloadLink },
                    mimetype: 'video/mp4',
                    fileName: `ʙʜᴀꜱʜɪ ᴍᴅ 2024|${details.title.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedQuality.quality}.mp4`,
                    caption: `🎬 *${details.title}*\n📊 *Quality:* ${selectedQuality.quality}\n💾 *Size:* ${selectedQuality.size}\n\n> ${footer}`
                  }, { quoted: qualityMsg });

                  // Send completion messages
                  await reply("✅ Download completed and sent!");
                  if (destinationJid !== from) {
                    await conn.sendMessage(from, {
                      text: `✅ Download completed and sent to ${destinationJid}!`
                    });
                  }
                } catch (error) {
                  console.error(`Error downloading/sending file:`, error);
                  reply(`❌ Error downloading/sending file: ${error.message}`);
                }

                conn.ev.off("messages.upsert", handleQualitySelection);
              } else {
                reply(`❌ Invalid quality number. Please choose between 1 and ${details.downloadLinks.length}.`);
              }
            }
          };

          conn.ev.on("messages.upsert", handleQualitySelection);
        } else {
          reply(`❌ Invalid movie number. Please choose between 1 and ${searchResults.data.length}.`);
        }
      }
    };

    conn.ev.on("messages.upsert", handleUserReply);

  } catch (error) {
    console.error(error);
    reply(`🚨 An error occurred while searching SinhalaSubLK: ${error.message}`);
  }
});
