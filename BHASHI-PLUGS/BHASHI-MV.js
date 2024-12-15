const { cmd } = require('../commands');
const axios = require('axios');
const cheerio = require('cheerio');
const footer = '> ```ɪⴕ "ᴢ ʙʜᴀꜱʜɪ ᴄᴏᴅᴇʀꜱ >_```'
const slogan = ``


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
      return text?.replace(/\s*\|\s*සිංහල උපසිරැසි සමඟ$/, '').trim() || '';
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


cmd({
  pattern: "sinhalasub",
  alias: ["s2", "ss", "mv"],
  desc: "Search and download movies from SinhalaSubLK with direct scraping support",
  react: "🎬",
  category: "search",
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    
    // Parse query and target JID if provided (format: query | jid)
    const fullInput = args.join(' ') || "######";
    const [query, targetJid] = fullInput.split('|').map(str => str.trim());
    const destinationJid = targetJid || from;

    // Validate JID if provided
    if (targetJid && !targetJid.includes('@')) {
      return reply("*Invalid JID format. Use: query | JID (e.g., Salaar | 123456789@g.us)*");
    }

    // Search progress reaction
    await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

    // Perform direct search using scraper
    const searchResults = await sscrapeSearchResults(query);

    if (searchResults.status === 'error' || !searchResults.data || searchResults.data.length === 0) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("*No movies found for the query. ( Please Enter Movie Name )*");
    }



  
    

 
        
        

  



    // Format search results with more details
    let resultMessage = `*Query :* ${query}
*Target Jid :* ${targetJid || 'Direct Jid'}
*Base Site :* https://sinhalasub.lk/
*Get Movie :* /mv { Movie Name }
*Send Movie :* /mv { Movie Name } | { Jid Address }


*Reply The Movie  Download Opction.*\n\n`;

    
      searchResults.data.forEach((movie, index) => {
      resultMessage += `*${index + 1}*`;


        
      if (movie.year)  resultMessage += ` ${movie.title}\n\n`;
    });

    resultMessage += ``;
    resultMessage += ``;
    resultMessage += ``;
    if (targetJid) {
      resultMessage += ``;
    }
    resultMessage += ``;

    const thumbnailUrl = searchResults.data[0]?.thumbnail || 
      'https://i.ibb.co/2jNJs5q/94d829c1-de36-4b7f-9d4d-f0566c361b61-1.jpg';

    const sentMessage = await conn.sendMessage(from, {


    text: resultMessage,
    contextInfo: {

    forwardingScore: 999,
    isForwarded: false,
    forwardedNewsletterMessageInfo: {
    newsletterName: '',
    newsletterJid: "@newsletter",
    },
    externalAdReply: {
        title: `Bhashi Movie Downloader Version 1.0.0`,
        body: `Presented By Bhashi Coders. Powerd By Dark Cyber Metrix Team. Enjoi Now Bhashi Project.`,
        thumbnailUrl: `https://scontent.fcmb4-2.fna.fbcdn.net/v/t39.30808-6/470174487_1113441743736717_6168312558499694390_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=g7KMNI49O7EQ7kNvgELntbR&_nc_zt=23&_nc_ht=scontent.fcmb4-2.fna&_nc_gid=Arun8-zdaIwQ4rnCTTD21rg&oh=00_AYC8YCl_4wpTqIuDxIDsj5oq3Fp20WtrHsJRBhI-Ry2Z4w&oe=676379DF`,
        sourceUrl: ``,
        mediaType: 1,
        renderLargerThumbnail: true
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
            return reply(`*Error fetching movie details: ${movieDetails.message}*`);
          }

          const details = movieDetails.data;

          // Create detailed movie information messages
          let detailsMessage = `*${details.title}*\n\n`;

          // Add metadata section 
        detailsMessage += `*Release Date:* ${details.metadata.releaseDate || 'N/A'}\n`;
        detailsMessage += `*Country:* ${details.metadata.country || 'N/A'}\n`;
        detailsMessage += `*Runtime:* ${details.metadata.runtime || 'N/A'}\n`;
        detailsMessage += `*Genres:* ${details.metadata.genres.join(', ') || 'N/A'}\n`;
        if (details.metadata.tagline) {
          detailsMessage += `*Rating:* ${details.rating.value} (${details.rating.count})\n\n`;
        }
        detailsMessage += `\n*Reply The Movie Download Opction.*\n`;

        detailsMessage += `\n*1.1* Get infotmations. `;
        detailsMessage += `\n*1.2* Get Images.\n `;
        detailsMessage += `\n`;
        details.downloadLinks.forEach((link, index) => {
          detailsMessage += `*0${index + 1}* ${link.option} - ${link.quality} | ${link.size}\n`;
        });

          detailsMessage += ``;
          detailsMessage += ``;
          if (targetJid) {
            detailsMessage += ``;
          }

          let fullDetails = `*${details.title}*\n\n`;

          // Add metadata section for full details
          fullDetails += `*Release Date:* ${details.metadata.releaseDate || 'N/A'}\n`;
          fullDetails += `*Country:* ${details.metadata.country || 'N/A'}\n`;
          fullDetails += `*Runtime:* ${details.metadata.runtime || 'N/A'}\n`;
          fullDetails += `*Genres:* ${details.metadata.genres.join(', ') || 'N/A'}\n`;
          if (details.metadata.tagline) {
            fullDetails += `*Rating:* ${details.rating.value} (${details.rating.count})`;
          }
          




          const detailsMessageSent = await conn.sendMessage(from, {
            image: { url: details.gallery?.images[0]?.thumbnail },
            caption: detailsMessage,
            contextInfo: {
              externalAdReply: {
                title: `Bhashi Movie Downloader Version 1.0.0` ,
                body: `Presented By Bhashi Coders. Powerd By Dark Cyber Metrix Team. Enjoi Now Bhashi Project.`,
                thumbnailUrl: 'https://i.ibb.co/k1VrG2C/IMG-20241122-WA0046.jpg',
                sourceUrl: ``,
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
                      title: `Bhashi Movie Downloader Version 1.0.0` ,
                      body: `Presented By Bhashi Coders. Powerd By Dark Cyber Metrix Team. Enjoi Now Bhashi Project.`,
                      thumbnailUrl: 'https://i.ibb.co/k1VrG2C/IMG-20241122-WA0046.jpg',
                      sourceUrl: ``,
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
                      caption: ``,
                      contextInfo: {
                        externalAdReply: {
                          title: `Bhashi Movie Downloader Version 1.0.0` ,
                          body: `Presented By Bhashi Coders. Powerd By Dark Cyber Metrix Team. Enjoi Now Bhashi Project.`,
                          thumbnailUrl: 'https://i.ibb.co/k1VrG2C/IMG-20241122-WA0046.jpg',
                          sourceUrl: ``,
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
                  await reply(`*📥 *Downloading* ${selectedQuality.quality}...*\n💾 *Size:* ${selectedQuality.size}`);
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
                  await reply("*✅ Download completed and sent!*");
                  if (destinationJid !== from) {
                    await conn.sendMessage(from, {
                      text: `*✅ Download completed and sent to ${destinationJid}!*`
                    });
                  }
                } catch (error) {
                  console.error(`Error downloading/sending file:`, error);
                  reply(`*Error downloading/sending file: ${error.message}*`);
                }

                conn.ev.off("messages.upsert", handleQualitySelection);
              } else {
                reply(`*Invalid quality number. Please choose between 1 and ${details.downloadLinks.length}.*`);
              }
            }
          };

          conn.ev.on("messages.upsert", handleQualitySelection);
        } else {
          reply(`*Invalid movie number. Please choose between 1 and ${searchResults.data.length}.*`);
        }
      }
    };

    conn.ev.on("messages.upsert", handleUserReply);

  } catch (error) {
    console.error(error);
    reply(`*An error occurred while searching SinhalaSubLK: ${error.message}*`);
  }
});
