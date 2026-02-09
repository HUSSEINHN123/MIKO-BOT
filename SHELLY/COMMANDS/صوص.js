const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "صوص",
    Auth: 0,
    Multi: ["sauce", "صلصة", "النمي", "انمي"],
    Owner: "Admin",
    Info: "تحديد اسم الأنمي من صورة مع البوستر والقصة",
    Class: "بحث",
    How: "صوص [رد على صورة]\nاضغط 👍 لمشاهدة المقطع",
    Time: 10
  },

  seasonTranslations: {
    "WINTER": "شتاء",
    "SPRING": "ربيع",
    "SUMMER": "صيف",
    "FALL": "خريف"
  },

  genreTranslations: {
    "Comedy": "كوميدي",
    "Romance": "رومانسي",
    "Action": "أكشن",
    "Adventure": "مغامرات",
    "Drama": "دراما",
    "Fantasy": "فانتازيا",
    "Sci-Fi": "خيال علمي",
    "Horror": "رعب",
    "Mystery": "غموض",
    "Slice of Life": "شريحة من الحياة",
    "Supernatural": "خارق للطبيعة",
    "Ecchi": "إيتشي",
    "Mecha": "ميكا",
    "Music": "موسيقى",
    "Psychological": "نفسي",
    "Sports": "رياضة",
    "Super Power": "قوى خارقة",
    "School": "مدرسي",
    "Magic": "سحر",
    "Historical": "تاريخي",
    "Martial Arts": "فنون قتالية",
    "Shounen": "شونين",
    "Shoujo": "شوجو",
    "Seinen": "سينين",
    "isekai": "عالم آخر"
  },

  statusTranslations: {
    "FINISHED": "مكتمل",
    "RELEASING": "قيد العرض",
    "NOT_YET_RELEASED": "لم يتم عرضه بعد",
    "CANCELLED": "ملغي",
    "HIATUS": "متوقف مؤقتاً"
  },

  pendingVerifications: new Map(),

  cleanDescription: function(description) {
    if (!description) return "غير متوفر";
    let cleaned = description.replace(/<[^>]*>/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 500) {
      cleaned = cleaned.substring(0, 500) + '...';
    }
    return cleaned || "غير متوفر";
  },

  async translateToArabic(text) {
    if (!text || text === "غير متوفر") return "غير متوفر";
    try {
      const response = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
        params: {
          client: 'gtx',
          sl: 'en',
          tl: 'ar',
          dt: 't',
          q: text
        },
        timeout: 10000
      });
      if (response.data?.[0]?.[0]?.[0]) {
        return response.data[0][0][0];
      }
      return text;
    } catch (error) {
      console.error('فشل في الترجمة:', error.message);
      return text;
    }
  },

  onPick: async function({ api, sh, event, args }) {
    try {
      sh.react("🔍");
      
      let imageUrl = null;
      
      // ══════════════════════════════════════════════════════
      // فحص الصورة
      // ══════════════════════════════════════════════════════
      if (event.type === "message_reply" && event.messageReply?.attachments?.[0]) {
        const att = event.messageReply.attachments[0];
        if (att.type === "photo" || att.type === "image") {
          imageUrl = att.url;
        }
      } else if (event.attachments?.[0]) {
        const att = event.attachments[0];
        if (att.type === "photo" || att.type === "image") {
          imageUrl = att.url;
        }
      } else if (args[0]) {
        imageUrl = args[0];
      }
      
      if (!imageUrl) {
        sh.react("❌");
        return sh.reply(
          '⚠️ لم أجد صورة!\n\n' +
          '📝 الطرق الصحيحة:\n' +
          '• رد على رسالة تحتوي على صورة\n' +
          '• أرسل صورة مع الأمر\n' +
          '• أرسل رابط صورة'
        );
      }
      
      sh.reply('🌐 جاري البحث عن الأنمي من الصورة...');
      
      // ══════════════════════════════════════════════════════
      // تحميل الصورة وإرسالها لـ trace.moe
      // ══════════════════════════════════════════════════════
      const imageRes = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 15000
      });
      
      const traceRes = await axios.post(
        "https://api.trace.moe/search?anilistInfo", 
        imageRes.data, 
        {
          headers: { "Content-Type": "image/jpeg" },
          params: { cutBorders: true },
          timeout: 30000
        }
      );
      
      const result = traceRes.data.result?.[0];
      
      if (!result) {
        sh.react("❌");
        return sh.reply('❌ لم يتم العثور على نتائج لهذه الصورة');
      }
      
      // ══════════════════════════════════════════════════════
      // جلب معلومات إضافية من AniList
      // ══════════════════════════════════════════════════════
      const anilistId = result.anilist?.id;
      let romaji = "غير معروف", english = "غير معروف", native = "غير معروف";
      let season = "غير معروف", year = "", genres = "غير معروف";
      let description = "غير متوفر", episodes = "غير معروف";
      let status = "غير معروف", score = "غير معروف", coverImageUrl = null;
      
      if (anilistId) {
        const query = `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              title { romaji english native }
              description
              season
              seasonYear
              genres
              episodes
              status
              averageScore
              coverImage { extraLarge }
            }
          }`;
        
        const aniRes = await axios.post(
          "https://graphql.anilist.co", 
          { query, variables: { id: anilistId } },
          { headers: { "Content-Type": "application/json" }, timeout: 15000 }
        );
        
        const anime = aniRes.data.data.Media;
        
        romaji = anime.title.romaji || romaji;
        english = anime.title.english || english;
        native = anime.title.native || native;
        
        const cleanedDesc = this.cleanDescription(anime.description);
        description = await this.translateToArabic(cleanedDesc);
        
        season = anime.season ? this.seasonTranslations[anime.season.toUpperCase()] || anime.season : season;
        year = anime.seasonYear ? anime.seasonYear.toString() : "";
        genres = anime.genres?.length > 0 
          ? anime.genres.map(g => this.genreTranslations[g] || g).join(" - ") 
          : genres;
        episodes = anime.episodes ? anime.episodes.toString() : "غير معروف";
        status = anime.status ? this.statusTranslations[anime.status] || anime.status : "غير معروف";
        score = anime.averageScore ? `${anime.averageScore}/100` : "غير معروف";
        coverImageUrl = anime.coverImage.extraLarge || null;
      }
      
      // ══════════════════════════════════════════════════════
      // معلومات من الصورة
      // ══════════════════════════════════════════════════════
      let episode = result.episode || "غير معروف";
      if (typeof episode === 'string' && episode.includes('|')) {
        episode = episode.split('|')[0];
      }
      
      const time = result.from 
        ? Math.floor(result.from / 60) + ":" + (Math.floor(result.from % 60)).toString().padStart(2, '0') 
        : "غير معروف";
      
      // ══════════════════════════════════════════════════════
      // بناء الرسالة
      // ══════════════════════════════════════════════════════
      const replyMessage =
        `🎬 الأنمي:\n` +
        `الاسم (Romaji): \n${romaji}\n` +
        `الاسم (EN): \n${english}\n` +
        `الاسم (الياباني): \n${native}\n\n` +
        `📝 القصة:\n${description}\n\n` +
        `📊 التفاصيل:\n` +
        `الموسم: ${season} ${year}\n` +
        `التصنيفات: ${genres}\n` +
        `عدد الحلقات: ${episodes}\n` +
        `الحالة: ${status}\n` +
        `التقييم: ${score}\n\n` +
        `🎯 من الصورة:\n` +
        `الحلقة: ${episode}\n` +
        `الدقيقة: ${time}\n\n` +
        `🎯 اضغط 👍 للتأكد من النتيجة ومشاهدة المقطع!`;
      
      // ══════════════════════════════════════════════════════
      // إرسال الرد مع البوستر
      // ══════════════════════════════════════════════════════
      let sentMsg;
      
      if (coverImageUrl) {
        try {
          const imgPath = path.join(__dirname, 'cache', `poster_${Date.now()}.jpg`);
          await fs.ensureDir(path.join(__dirname, 'cache'));
          
          const imgRes = await axios.get(coverImageUrl, { 
            responseType: "stream",
            timeout: 15000
          });
          
          const writer = fs.createWriteStream(imgPath);
          imgRes.data.pipe(writer);
          
          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });
          
          sentMsg = await api.sendMessage({
            body: replyMessage,
            attachment: fs.createReadStream(imgPath)
          }, event.threadID);
          
          setTimeout(() => fs.unlink(imgPath).catch(() => {}), 5000);
          
        } catch (imgError) {
          console.error('فشل تحميل البوستر:', imgError.message);
          sentMsg = await sh.reply(replyMessage);
        }
      } else {
        sentMsg = await sh.reply(replyMessage);
      }
      
      // ══════════════════════════════════════════════════════
      // حفظ بيانات التحقق
      // ══════════════════════════════════════════════════════
      if (result.video && sentMsg?.messageID) {
        this.pendingVerifications.set(sentMsg.messageID, {
          videoUrl: result.video,
          threadID: event.threadID,
          userID: event.senderID
        });
        
        // حذف تلقائي بعد 10 دقائق
        setTimeout(() => {
          this.pendingVerifications.delete(sentMsg.messageID);
        }, 600000);
      }
      
      sh.react("✅");
      
    } catch (error) {
      console.error('خطأ في صوص:', error);
      sh.react("❌");
      return sh.reply(`❌ حدث خطأ: ${error.message}`);
    }
  },

  // ══════════════════════════════════════════════════════
  // معالج التفاعلات
  // ══════════════════════════════════════════════════════
  onReaction: async function({ api, sh, event }) {
    try {
      const { messageID, userID, reaction } = event;
      
      // التحقق من التفاعل 👍
      const validReactions = ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿'];
      if (!validReactions.includes(reaction)) return;
      
      const verificationData = this.pendingVerifications.get(messageID);
      if (!verificationData) return;
      
      // التحقق من المستخدم
      if (verificationData.userID !== userID) return;
      
      sh.react("⏳");
      sh.reply('📹 جاري تحميل مقطع التأكد...');
      
      // ══════════════════════════════════════════════════════
      // تحميل وإرسال الفيديو
      // ══════════════════════════════════════════════════════
      const videoPath = path.join(__dirname, 'cache', `verify_${Date.now()}.mp4`);
      await fs.ensureDir(path.join(__dirname, 'cache'));
      
      try {
        const videoRes = await axios({
          method: 'GET',
          url: verificationData.videoUrl,
          responseType: 'stream',
          timeout: 60000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const writer = fs.createWriteStream(videoPath);
        videoRes.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
          setTimeout(() => {
            writer.destroy();
            reject(new Error('انتهت مهلة التحميل'));
          }, 55000);
        });
        
        const stats = await fs.stat(videoPath);
        if (stats.size === 0) {
          throw new Error('الفيديو فارغ');
        }
        
        await api.sendMessage({
          body: '✅ مقطع التأكد من النتيجة:',
          attachment: fs.createReadStream(videoPath)
        }, verificationData.threadID);
        
        sh.react("✅");
        
        setTimeout(() => fs.unlink(videoPath).catch(() => {}), 5000);
        
      } catch (videoError) {
        console.error('فشل تحميل الفيديو:', videoError.message);
        sh.react("❌");
        return sh.reply(`❌ فشل تحميل الفيديو: ${videoError.message}`);
      } finally {
        this.pendingVerifications.delete(messageID);
      }
      
    } catch (error) {
      console.error('خطأ في معالجة التفاعل:', error);
      sh.react("❌");
      return sh.reply(`❌ حدث خطأ: ${error.message}`);
    }
  }
};