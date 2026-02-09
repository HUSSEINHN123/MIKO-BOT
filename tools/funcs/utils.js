const axios = require("axios");
const fs = require("fs-extra");
const https = require("https");
const agent = new https.Agent({
 rejectUnauthorized: false
});
const mimeDB = require("mime-db");
const FormData = require('form-data');

const regCheckURL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

class CustomError extends Error {
 constructor(obj) {
  if (typeof obj === 'string')
   obj = { message: obj };
  if (typeof obj !== 'object' || obj === null)
   throw new TypeError('Object required');
  obj.message ? super(obj.message) : super();
  Object.assign(this, obj);
 }
}

async function topMedia(input, ext = "png") {
  try {
    let buf;

    if (typeof input === "string") {
      let b = await axios.get(input, { responseType: "arraybuffer" });
      buf = Buffer.from(b.data);
    } else if (Buffer.isBuffer(input)) {
      buf = input;
    } else if (input && typeof input.pipe === "function") {
      buf = await streamToBuffer(input);
    } else {
      throw new Error("Input must be a URL, Buffer, or Stream");
    }

    let data = new FormData();
    data.append("file_1_", buf, { filename: `shelly.${ext}` });
    data.append("submitr", "[ رفع الملفات ]");

    let config = {
      method: "POST",
      url: "https://top4top.io/index.php",
      headers: {
        ...data.getHeaders(),
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9,ar-US;q=0.8,ar;q=0.7",
        "Origin": "https://top4top.io",
        "Referer": "https://top4top.io/",
        "Upgrade-Insecure-Requests": "1",
      },
      data,
    };

    let res = await axios.request(config);
    let s = res.data;
    const m = s.match(/<input[^>]*\svalue="(https?:\/\/[^"]+)"/);
    return m?.[1] || null;
  } catch (e) {
    return { err: "ext not allowed or upload failed", msg: e.message };
  }
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

async function imgbb(file /* stream or image url */) {
  let type = "file";
  try {
    if (!file)
      throw new Error('The first argument (file) must be a stream or a image url');
    if (regCheckURL.test(file) == true)
      type = "url";
    if (
      (type != "url" && (!(typeof file._read === 'function' && typeof file._readableState === 'object')))
      || (type == "url" && !regCheckURL.test(file))
    )
      throw new Error('The first argument (file) must be a stream or an image URL');

    const res_ = await axios({
      method: 'GET',
      url: 'https://imgbb.com'
    });

    const auth_token = res_.data.match(/auth_token="([^"]+)"/)[1];
    const timestamp = Date.now();

    const res = await axios({
      method: 'POST',
      url: 'https://imgbb.com/json',
      headers: {
        "content-type": "multipart/form-data"
      },
      data: {
        source: file,
        type: type,
        action: 'upload',
        timestamp: timestamp,
        auth_token: auth_token
      }
    });

    return res.data.image.url;


  }
  catch (err) {
    throw new CustomError(err.response ? err.response.data : err);
  }
}

function createQueue(callback) {
	const queue = [];
	const queueObj = {
		push: function(task) {
			queue.push(task);
			if (queue.length == 1)
				queueObj.next();
		},
		running: null,
		length: function() {
			return queue.length;
		},
		next: function() {
			if (queue.length > 0) {
				const task = queue[0];
				queueObj.running = task;
				callback(task, async function(err, result) {
					queueObj.running = null;
					queue.shift();
					queueObj.next();
				});
			}
		}
	};
	return queueObj;
}

function getAttExt(type) {
 switch (type) {
  case "photo":
   return 'png';
  case "animated_image":
   return "gif";
  case "video":
   return "mp4";
  case "audio":
   return "mp3";
  default:
   return "txt";
 }
}

function getMimeType(mimeType = "") {
 return mimeDB[mimeType] ? (mimeDB[mimeType].extensions || [])[0] || "unknow" : "unknow";
}

function getExtFromUrl(url = "") {
 if (!url || typeof url !== "string")
  throw new Error('The first argument (url) must be a string');
 const reg = /(?<=https:\/\/cdn.fbsbx.com\/v\/.*?\/|https:\/\/video.xx.fbcdn.net\/v\/.*?\/|https:\/\/scontent.xx.fbcdn.net\/v\/.*?\/).*?(\/|\?)/g;
 const fileName = url.match(reg)[0].slice(0, -1);
 return fileName.slice(fileName.lastIndexOf(".") + 1);
}

function getPrefix(threadID) {
 if (!threadID || isNaN(threadID))
  throw new Error('The first argument (threadID) must be a number');
 threadID = String(threadID);
 let prefix = global.config.PREFIX;
 const threadData = global.db.allThreadData.find(t => t.threadID == threadID);
 if (threadData)
  prefix = threadData.data.prefix || prefix;
 return prefix;
}




function message(api, event) {
  async function sendMessageError(err) {
    if (typeof err === "object" && !err.stack)
      err = removeHomeDir(JSON.stringify(err, null, 2));
    else
      err = removeHomeDir(`${err.name || err.error}: ${err.message}`);
    return await api.sendMessage("error: " + err, event.threadID, event.messageID);
  }
  return {
    send: async (form, callback) => {
      try {
        return await api.sendMessage(form, event.threadID, callback);
      } catch (err) {
        if (JSON.stringify(err).includes('spam')) {
          throw err;
        }
        throw err; 
      }
    },
    reply: async (form, callback) => {
      try {
        return await api.sendMessage(form, event.threadID, callback, event.messageID);
      } catch (err) {
        if (JSON.stringify(err).includes('spam')) {
          throw err;
        }
        throw err; 
      }
    },
    str: async (T, U) => {
      let F;
      if (!U) {
        F = { attachment: await funcs.str(T) };
      } else {
        F = { body: T, attachment: await funcs.str(U) };
      }
      api.sendMessage(F, event.threadID, event.messageID);
    },
    unsend: async (messageID, callback) => await api.unsendMessage(messageID, callback),
    edit: async (from, callback = event.messageReply.messageID) => await api.editMessage(from, callback),
    react: async function (emoji) {
      try {
        return await new Promise((resolve, reject) => {
          api.setMessageReaction(emoji, event.messageID, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          }, true);
        });
      } catch (err) {
        throw err;
      }
    },
    err: async (err) => await sendMessageError(err),
    error: async (err) => await sendMessageError(err)
  };
}

function randomString(max, onlyOnce = false, possible) {
 if (!max || isNaN(max))
  max = 10;
 let text = "";
 possible = possible || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 for (let i = 0; i < max; i++) {
  let random = Math.floor(Math.random() * possible.length);
  if (onlyOnce) {
   while (text.includes(possible[random]))
    random = Math.floor(Math.random() * possible.length);
  }
  text += possible[random];
 }
 return text;
}

function removeHomeDir(fullPath) {
 if (!fullPath || typeof fullPath !== "string")
  throw new Error('The first argument (fullPath) must be a string');
 while (fullPath.includes(process.cwd()))
  fullPath = fullPath.replace(process.cwd(), "");
 return fullPath;
}

function translateAPI(text, lang) {
 return new Promise((resolve, reject) => {
  axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`)
   .then(res => {
    resolve(res.data[0][0][0]);
   })
   .catch(err => {
    reject(err);
   });
 });
}

async function downloadFile(url = "", path = "") {
 if (!url || typeof url !== "string")
  throw new Error(`The first argument (url) must be a string`);
 if (!path || typeof path !== "string")
  throw new Error(`The second argument (path) must be a string`);
 const getFile = await axios.get(url, {
  responseType: "arraybuffer"
 });
 fs.writeFileSync(path, Buffer.from(getFile.data));
 return path;
}

async function getStreamFromURL(url = "", pathName = "", options = {}) {
 if (!options && typeof pathName === "object") {
  options = pathName;
  pathName = "";
 }
 try {
  if (!url || typeof url !== "string")
   throw new Error(`The first argument (url) must be a string`);
  const response = await axios({
   url,
   method: "GET",
   responseType: "stream",
   ...options
  });
  if (!pathName)
   pathName = funcs.randomString(10) + (response.headers["content-type"] ? '.' + funcs.getMimeType(response.headers["content-type"]) : ".noext");
  response.data.path = pathName;
  return response.data;
 }
 catch (err) {
  throw err;
 }
}



async function shortenURL(url) {
 try {
  const result = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
  return result.data;
 }
 catch (err) {
  let error;
  if (err.response) {
   error = new Error();
   Object.assign(error, err.response.data);
  }
  else
   error = new Error(err.message);
 }
}

async function uploadImgbb(file /* stream or image url */) {
  let type = "file";
  try {
      if (!file)
          throw new Error('The first argument (file) must be a stream or a image url');
      if (regCheckURL.test(file) == true)
          type = "url";
      if (
          (type != "url" && (!(typeof file._read === 'function' && typeof file._readableState === 'object')))
          || (type == "url" && !regCheckURL.test(file))
      )
          throw new Error('The first argument (file) must be a stream or an image URL');

      const res_ = await axios({
          method: 'GET',
          url: 'https://imgbb.com'
      });

      const auth_token = res_.data.match(/auth_token="([^"]+)"/)[1];
      const timestamp = Date.now();

      const form = new FormData();
      form.append('source', file);
      form.append('type', type);
      form.append('action', 'upload');
      form.append('timestamp', timestamp);
      form.append('auth_token', auth_token);

      const headers = {
          ...form.getHeaders(), // get form headers
      };

      const res = await axios({
          method: 'POST',
          url: 'https://imgbb.com/json',
          headers: headers,
          data: form
      });

      return res.data;

  } catch (err) {
      throw new CustomError(err.response ? err.response.data : err);
  }
}

async function uploadZippyshare(stream) {
 const res = await axios({
  method: 'POST',
  url: 'https://api.zippysha.re/upload',
  httpsAgent: agent,
  headers: {
   'Content-Type': 'multipart/form-data'
  },
  data: {
   file: stream
  }
 });

 const fullUrl = res.data.data.file.url.full;
 const res_ = await axios({
  method: 'GET',
  url: fullUrl,
  httpsAgent: agent,
  headers: {
   "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.43"
  }
 });

 const downloadUrl = res_.data.match(/id="download-url"(?:.|\n)*?href="(.+?)"/)[1];
 res.data.data.file.url.download = downloadUrl;

 return res.data;
}
const funcs = {
 CustomError,
 topMedia,
 createQueue,
 getAttExt,
 getMimeType,
 getExtFromUrl,
 getPrefix,
 message,
 randomString,
 removeHomeDir,
 translateAPI,
 trgm: translateAPI,
 // async functions
 downloadFile,
 streamToBuffer,
 getStreamFromURL,
 imgd:getStreamFromURL,
  str: getStreamFromURL,
 shortenURL,
 uploadZippyshare,
 uploadImgbb,
 imgbb,
 Imgbb: uploadImgbb,
 topMedia
};

module.exports = funcs;
