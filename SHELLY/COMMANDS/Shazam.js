const axios = require('axios');
const fs = require('fs');
const { Shazam } = require("node-shazam");
const qs = require('qs');
const yts = require('yt-search');

module.exports = {
  config: {
    name: "شازام",
    Multi: ["shazam", "شزم"],
    Auth: 0,
    Owner: "Takt Asahina",
    Info: "البحث عن اغنيتك بفيديو او اوديو",
    Class: "وسائط",
    How: "رد على فيديو او اوديو",
    Time: 0
  },
  
  onPick: async function({ api, event, sh: Message }) {
    if (event.type !== "message_reply") {
      return Message.reply("رد عا فيديو او اوديو 🙂🚮");
    }
    
    try {
      
      let type = event.messageReply?.attachments[0]?.type;
      let path;
      
      if (type == "audio") {
        path = __dirname + "/cache/Mser.mp3";
      } else if (type == "video") {
        path = __dirname + "/cache/Mser.mp4";
      } else {
        return Message.reply("ذي ما فيديو او اوديو");
      }
      
      let imageUr = event.messageReply.attachments[0].url;
      let bo = await axios.get(imageUr, { responseType: "arraybuffer" });
      let bu = Buffer.from(bo.data);
      fs.writeFileSync(path, bu);
      
      const shazam = new Shazam();
      const recognise = await shazam.recognise(path, 'en-US');
      let format = {
        image: recognise?.track?.images?.coverart,
        name: recognise?.track?.title,
        author: recognise?.track?.subtitle
      }
      
      const info = await Message.reply({
        body: `⌯︙المؤلف ❍> ${format.author} 👤\n⌯︙أسم لاغنية ❍> ${format.name} ☔
        رد ب "ارسلي" لكي يتم ارسال الاغنيه`,
        attachment: (await axios.get(format.image, { responseType: "stream" })).data
      });
      
      return global.shelly.Reply.push({
        name: "شازام",
        ID: info.messageID, 
        songName: format.name,
        author: event.senderID
      }
      )
      
    } catch (err) {
      console.error(err);
      return Message.reply("❌ | حدث خطأ");
    }
  },
  Reply: async ({args, event, sh, Reply}) => {
    const { songName, author } = Reply;
    if(event.senderID != author) return;
    if(event.body != "ارسلي") return;
    sh.reply("انتظر قليلا...")

  const r = await yts(songName);
  const data = r.videos[0];
  const song = {
    title: data.title,
    link: data.url
  };

  sh.str(song.title, (await getMp3(song.link)).dlink);
  }
};



async function getInfo(url) {
let data = qs.stringify({
  'query': url,
  'cf_token': '',
  'vt': 'youtube'
});

let config = {
  method: 'POST',
  url: 'https://ssvid.net/api/ajax/search',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/x-www-form-urlencoded',
    'sec-ch-ua-platform': '"Windows"',
    'x-requested-with': 'XMLHttpRequest',
    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'sec-ch-ua-mobile': '?0',
    'sec-gpc': '1',
    'accept-language': 'en;q=0.5',
    'origin': 'https://ssvid.net',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://ssvid.net/youtube-to-mp4',
    'priority': 'u=1, i'
  },
  data: data
};

return (await axios.request(config)).data;

}
async function download(vidCode, KCode) {

let data = qs.stringify({
  'vid': vidCode,
  'k': KCode
});

let config = {
  method: 'POST',
  url: 'https://ssvid.net/api/ajax/convert',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/x-www-form-urlencoded',
    'sec-ch-ua-platform': '"Windows"',
    'x-requested-with': 'XMLHttpRequest',
    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'sec-ch-ua-mobile': '?0',
    'sec-gpc': '1',
    'accept-language': 'en;q=0.5',
    'origin': 'https://ssvid.net',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://ssvid.net/youtube-to-mp4',
    'priority': 'u=1, i'
  },
  data: data
};

   return (await axios.request(config)).data;
}
async function getMp3(link) {
  const info = await getInfo(link);
  const firstMp3 = Object.values(info.links.mp3)[0];
  const data = await download(info.vid, firstMp3.k);
  return data;
}