const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const OSS = require('ali-oss');

function setupImageEditClient() {
  try {
    const timestamp = Date.now();
    const anonymousId = uuidv4();
    const sboxGuid = Buffer.from(`${timestamp}|${Math.floor(Math.random() * 1000)}|${Math.floor(Math.random() * 1000000000)}`).toString('base64');
    
    const cookies = [
      `anonymous_user_id=${anonymousId}`,
      `i18n_redirected=en`,
      `_ga_PFX3BRW5RQ=GS2.1.s${timestamp}$o1$g0$t${timestamp}$j60$l0$h${timestamp + 100000}`,
      `_ga=GA1.1.${Math.floor(Math.random() * 2000000000)}.${timestamp}`,
      `sbox-guid=${sboxGuid}`
    ].join('; ');
    
    // Return a simple axios instance with default headers
    return axios.create({
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
      }
    });
  } catch (error) {
    throw error;
  }
}

async function getStsToken(client) {
  try {
    const response = await client.get('https://notegpt.io/api/v1/oss/sts-token', {
      headers: {
        'accept': '*/*',
        'x-token': ''
      }
    });
    
    if (response.data.code === 100000) {
      return response.data.data;
    } else {
      throw new Error('فشل في الحصول على STS Token');
    }
  } catch (error) {
    throw error;
  }
}

async function uploadImageToOSS(imageUrl, stsData) {
  try {
    const fileName = `${uuidv4()}.jpg`;
    const ossPath = `notegpt/web3in1/${fileName}`;
    
    const ossClient = new OSS({
      region: 'oss-us-west-1',
      accessKeyId: stsData.AccessKeyId,
      accessKeySecret: stsData.AccessKeySecret,
      stsToken: stsData.SecurityToken,
      bucket: 'nc-cdn'
    });
    
    const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
    const result = await ossClient.putStream(ossPath, imageResponse.data);
    
    return `https://nc-cdn.oss-us-west-1.aliyuncs.com/${ossPath}`;
  } catch (error) {
    throw error;
  }
}

async function startImageEdit(client, imageUrl, prompt) {
  try {
    const response = await client.post('https://notegpt.io/api/v2/images/handle', {
      "image_url": imageUrl,
      "type": 60,
      "user_prompt": prompt,
      "aspect_ratio": "match_input_image",
      "num": 4,
      "model": "google/nano-banana",
      "sub_type": 3
    }, {
      headers: { 'accept': 'application/json, text/plain, */*' }
    });
    
    if (response.data.code === 100000) {
      return response.data.data.session_id;
    } else {
      throw new Error('فشل في بدء تحرير الصورة');
    }
  } catch (error) {
    throw error;
  }
}

async function trackEditingStatus(client, sessionId) {
  try {
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      const response = await client.get(`https://notegpt.io/api/v2/images/status?session_id=${sessionId}`, {
        headers: { 'accept': 'application/json, text/plain, */*' }
      });
      
      if (response.data.code === 100000) {
        const status = response.data.data.status;
        
        if (status === 'succeeded') return response.data.data.results;
        else if (status === 'failed') throw new Error('فشل في تحرير الصورة');
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
    
    throw new Error('انتهت مهلة انتظار تحرير الصورة');
  } catch (error) {
    throw error;
  }
}

module.exports = {
  config: {
  name: "تعديل",
  Multi: ["edit"],
  Owner: "AYOUB",
  Info: "تعديل الصور باستخدام AI",
  Class: "ذكاء اصطناعي",
  How: "رد على صورة واكتب: تعديل <وصف التعديل>"
},
  onPick: async function({ api, event, args }) {
    if (event.type !== "message_reply" || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return api.sendMessage("الرجاء الرد على صورة", event.threadID, event.messageID);
    }
    
    const attachment = event.messageReply.attachments[0];
    if (attachment.type !== "photo") return api.sendMessage("هذا ليس صورة", event.threadID, event.messageID);
    
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("الرجاء إضافة وصف للتعديل، مثال: معدل sad girl", event.threadID, event.messageID);
    
    api.sendMessage("🎨 جاري تعديل الصورة...", event.threadID, event.messageID);
    
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const cacheDir = __dirname + "/cache";
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      
      const client = setupImageEditClient();
      const stsData = await getStsToken(client);
      const uploadedImageUrl = await uploadImageToOSS(attachment.url, stsData);
      const sessionId = await startImageEdit(client, uploadedImageUrl, prompt);
      const results = await trackEditingStatus(client, sessionId);
      
      const editedImages = [];
      const filesToDelete = [];
      
      for (let i = 0; i < results.length; i++) {
        const imageUrl = results[i].url;
        const filePath = cacheDir + `/edited_${uniqueId}_${i + 1}.png`;
        const response = await axios.get(imageUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        editedImages.push(fs.createReadStream(filePath));
        filesToDelete.push(filePath);
      }
      
      if (editedImages.length === 0) return api.sendMessage("❌ فشل في تحميل الصور المحررة", event.threadID, event.messageID);
      
      await api.sendMessage({ body: "✨ تم تعديل الصورة", attachment: editedImages }, event.threadID, event.messageID);
      
      setTimeout(() => filesToDelete.forEach(file => fs.existsSync(file) && fs.unlinkSync(file)), 3000);
    } catch (error) {
      return api.sendMessage("❌ حدث خطأ أثناء تعديل الصورة", event.threadID, event.messageID);
    }
  }
};