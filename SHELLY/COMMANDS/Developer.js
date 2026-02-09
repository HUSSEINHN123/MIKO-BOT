module.exports = {
  config: {
    name: "developer",
    Auth: 0,
    Multi: ["dev", "developer"],
    Owner: "Hamoudi San",
    Info: "Display bot developer information",
    Class: "Information",
    How: "developer",
    Time: 0
  },

  onPick: async function({ api, sh, event }) {
    try {
      // Developer information
      const devInfo = {
        name: "Hamoudi San",
        age: "16",
        country: "🇸🇩",
        phone: "999",
        message: "I love you 🫦",
        // Multiple images - one selected randomly
        images: [
          "https://i.postimg.cc/2ymCpCZ0/1763208639608.jpg",
          "https://i.postimg.cc/mrzLCXRW/1763208658902.jpg"
        ]
      };
      
      // Select random image
      const randomImage = devInfo.images[Math.floor(Math.random() * devInfo.images.length)];

      // Styled message
      const styledMessage = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│                          │
│    ✨ DEVELOPER INFO ✨    │
│                          │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

  👤 Name: ${devInfo.name}
  🎂 Age: ${devInfo.age}
  ${devInfo.country} Country: Sudan
  📞 Phone: ${devInfo.phone}
  💌 ${devInfo.message}

╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│                          │
│  The one whose work      │
│  amazed those with mind  │
│                          │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ⚡ Developer: Hamoudi ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();

      // Send message with random image
      try {
        const axios = require('axios');
        const fs = require('fs-extra');
        const path = require('path');
        
        // Download random image
        const imageResponse = await axios.get(randomImage, { 
          responseType: 'stream' 
        });
        
        const imagePath = path.join(__dirname, 'cache', `developer_${Date.now()}.jpg`);
        
        // Ensure cache folder exists
        await fs.ensureDir(path.join(__dirname, 'cache'));
        
        const writer = fs.createWriteStream(imagePath);
        imageResponse.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        // Send with image
        return api.sendMessage({
          body: styledMessage,
          attachment: fs.createReadStream(imagePath)
        }, event.threadID, () => {
          // Delete image after sending
          fs.unlinkSync(imagePath);
        });
        
      } catch (imgError) {
        console.error("Error loading image:", imgError);
        // If image loading fails, send text only
        return sh.reply(styledMessage);
      }

    } catch (err) {
      console.error("Developer info error:", err);
      return sh.reply("❌ An error occurred displaying developer information");
    }
  }
};