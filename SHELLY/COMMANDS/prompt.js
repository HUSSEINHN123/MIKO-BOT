const axios = require('axios');
const crypto = require("crypto");

// دالة بدء جلسة استخراج الـ prompt
async function startSession(imgUrl) {
  let sessionID = crypto.randomBytes(4).toString("hex").toUpperCase();
  let data = JSON.stringify({
    data: [
      null,
      null,
      imgUrl,
      0.3,
      0.85,
      "threshold",
      25,
      10,
      false,
      false
    ],
    event_data: null,
    fn_index: 2,
    trigger_id: 26,
    session_hash: sessionID
  });

  let config = {
    method: 'POST',
    url: 'https://pixai-labs-pixai-tagger-demo.hf.space/gradio_api/queue/join?__theme=system',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'application/json',
      'sec-ch-ua-platform': '"Windows"',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'x-zerogpu-uuid': crypto.randomBytes(4).toString("hex").toUpperCase(),
      'sec-ch-ua-mobile': '?0',
      'sec-gpc': '1',
      'accept-language': 'en;q=0.7',
      'origin': 'https://pixai-labs-pixai-tagger-demo.hf.space',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'sec-fetch-storage-access': 'none',
      'referer': 'https://pixai-labs-pixai-tagger-demo.hf.space/?__theme=system',
      'priority': 'u=1, i'
    },
    data: data,
    timeout: 30000
  };

  return {
    data: (await axios.request(config)).data,
    sessionID
  };
}

// دالة الحصول على النتيجة
async function getResult(sessionID) {
  let config = {
    method: 'GET',
    url: 'https://pixai-labs-pixai-tagger-demo.hf.space/gradio_api/queue/data?session_hash=' + sessionID,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Accept': 'text/event-stream',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'sec-ch-ua-platform': '"Windows"',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'content-type': 'application/json',
      'sec-ch-ua-mobile': '?0',
      'sec-gpc': '1',
      'accept-language': 'en;q=0.7',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'sec-fetch-storage-access': 'none',
      'referer': 'https://pixai-labs-pixai-tagger-demo.hf.space/?__theme=system',
      'priority': 'u=1, i'
    },
    timeout: 60000
  };

  return (await axios.request(config)).data;
}

// دالة استخراج الـ prompt من الصورة
async function extractPrompt(imageUrl) {
  try {
    console.log('بدء استخراج الـ prompt من الصورة...');
    
    const session = await startSession(imageUrl);
    console.log('تم إنشاء الجلسة:', session.sessionID);
    
    // انتظار قليل للمعالجة
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const data = await getResult(session.sessionID);
    console.log('تم الحصول على البيانات');
    
    // البحث عن الـ prompt في النتيجة
    const match = data.match(/"output":\{"data":\["([^"]+)","([^"]+)","([^"]+)"/);
    
    if (match) {
      const prompt = match[1];            
      const character = (match[2] && match[2] !== '—') ? match[2] : null; 
      const series = (match[3] && match[3] !== '—') ? match[3] : null; 

      if (character && series) {
        return `${series}, ${character}, ${prompt}`;
      } else if (character) {
        return `${character}, ${prompt}`;
      } else if (series) {
        return `${series}, ${prompt}`;
      } else {
        return prompt;
      }
    }
    
    // محاولة patterns أخرى
    const alternativePatterns = [
      /"data":\["([^"]+)"/,
      /"text":"([^"]+)"/,
      /"prompt":"([^"]+)"/
    ];
    
    for (let pattern of alternativePatterns) {
      const altMatch = data.match(pattern);
      if (altMatch && altMatch[1]) {
        return altMatch[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('خطأ في استخراج الـ prompt:', error.message);
    throw error;
  }
}

// ══════════════════════════════════════════════════════
// الكود المتوافق مع مكتبتك
// ══════════════════════════════════════════════════════

module.exports = {
  config: {
    name: "برومبت",
    Auth: 0,
    Multi: ["prompt", "استخراج", "تحليل"],
    Owner: "Assistant",
    Info: "استخراج الـ prompt من الصور المولدة بالذكاء الاصطناعي",
    Class: "ذكاء اصطناعي",
    How: "رد على صورة",
    Time: 15
  },

  onPick: async function({ api, sh, event }) {
    try {
      console.log('تم استدعاء أمر استخراج الـ prompt');
      
      // ردة فعل ابتدائية
      sh.react("⏳");
      
      let imageUrl = null;
      let source = '';
      
      // ══════════════════════════════════════════════════════
      // فحص الرد على رسالة تحتوي على صورة
      // ══════════════════════════════════════════════════════
      if (event.type === "message_reply" && event.messageReply) {
        console.log('فحص مرفقات الرد:', event.messageReply.attachments);
        
        if (event.messageReply.attachments && event.messageReply.attachments.length > 0) {
          const imageAttachment = event.messageReply.attachments.find(att => {
            return att.type === "photo" || 
                   att.type === "image" || 
                   att.type === "sticker" || 
                   (att.url && att.url.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i));
          });
          
          if (imageAttachment && imageAttachment.url) {
            imageUrl = imageAttachment.url;
            source = 'الرسالة المردود عليها';
          }
        }
      }
      
      // ══════════════════════════════════════════════════════
      // فحص المرفقات في الرسالة الحالية
      // ══════════════════════════════════════════════════════
      if (!imageUrl && event.attachments && event.attachments.length > 0) {
        console.log('فحص المرفقات الحالية:', event.attachments);
        
        const imageAttachment = event.attachments.find(att => {
          return att.type === "photo" || 
                 att.type === "image" || 
                 att.type === "sticker" ||
                 (att.url && att.url.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i));
        });
        
        if (imageAttachment && imageAttachment.url) {
          imageUrl = imageAttachment.url;
          source = 'الرسالة الحالية';
        }
      }
      
      // ══════════════════════════════════════════════════════
      // التحقق من وجود صورة
      // ══════════════════════════════════════════════════════
      if (!imageUrl) {
        console.log('لم يتم العثور على صورة');
        sh.react("❌");
        return sh.reply(
          '⚠️ لم أجد صورة!\n\n' +
          '📝 الطرق الصحيحة:\n' +
          '• رد على رسالة تحتوي على صورة\n' +
          '• أرسل صورة مع الأمر\n\n' +
          '💡 الأمر يعمل فقط على صور مولدة بالذكاء الاصطناعي'
        );
      }
      
      console.log(`تم العثور على صورة في ${source}:`, imageUrl);
      
      // ══════════════════════════════════════════════════════
      // استخراج الـ prompt
      // ══════════════════════════════════════════════════════
      sh.reply('🔍 جاري تحليل الصورة واستخراج الـ prompt...\n⏳ قد يستغرق هذا بضع ثوانٍ...');
      
      const extractedPrompt = await extractPrompt(imageUrl);
      
      if (extractedPrompt) {
        // النجاح - إرسال الـ prompt
        sh.react("✅");
        
        return sh.reply(
          `✨ تم استخراج الـ Prompt بنجاح!\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `${extractedPrompt}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `💡 يمكنك استخدام هذا الـ prompt لتوليد صور مشابهة`
        );
      } else {
        // فشل الاستخراج
        sh.react("❌");
        return sh.reply(
          '❌ لم أتمكن من استخراج prompt من هذه الصورة\n\n' +
          '🤔 الأسباب المحتملة:\n' +
          '• الصورة غير مولدة بالذكاء الاصطناعي\n' +
          '• جودة الصورة منخفضة جداً\n' +
          '• الصورة محررة بشكل كبير\n\n' +
          '💡 جرب صورة أخرى مولدة بـ AI'
        );
      }
      
    } catch (error) {
      console.error('خطأ في معالجة الصورة:', error);
      sh.react("❌");
      
      return sh.reply(
        `❌ حدث خطأ أثناء معالجة الصورة\n\n` +
        `📝 التفاصيل: ${error.message}\n\n` +
        `💡 جرب مرة أخرى أو استخدم صورة مختلفة`
      );
    }
  }
};