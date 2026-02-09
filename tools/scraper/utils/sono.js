const axios = require('axios');
const qs = require('qs');
const crypto = require("crypto");
function decrypt(base64Str) {
  const key = Buffer.from("147258369topmeidia96385topmeidia", "utf-8");
  const iv = Buffer.from("1597531topmeidia", "utf-8");
  const data = Buffer.from(base64Str, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf-8");
}
async function Result(token, taskIds, interval = 2000) {
  const url = 'https://aimusic-api.topmediai.com/app/v2/task/results';
  const idsParam = taskIds.join(',');

  while (true) {
    try {
      const res = await axios.get(`${url}?ids=${encodeURIComponent(idsParam)}`, {
        headers: {
          'User-Agent': 'okhttp/4.12.0',
          'Accept-Encoding': 'gzip',
          'authorization': `Bearer ${token}`,
        },
      });

      const results = res.data?.data?.result;

      if (results && results.every(r => r.audio_url !== null)) {
        return [
            {
                audioUrl: decrypt(results[0].audio_url),
                coverUrl: decrypt(results[0].cover_url),
                title: results[0].title
            },
            {
                audioUrl: decrypt(results[1].audio_url),
                coverUrl: decrypt(results[1].cover_url),
                title: results[1].title
            }
        ]
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (err) {
      console.error('Error fetching results:', err.message);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
}
async function getToken() {
    let data = qs.stringify({
  'email': crypto.randomBytes(7).toString("hex") + '@gmail.com',
  'password': crypto.randomBytes(16).toString("hex"),
  'equipment_code': 'a54x',
  'first_name': '',
  'last_name': '',
  'information_sources': '20035',
  'lang': 'EN',
  'source_site': '',
  'platform': 'phone-app',
  'from_language': 'EN',
  'operating_system': 'android',
  'token': '',
  'timestamp': Date.now().toString(),
  'sign': '6298C3A0EADF18F164E1BE2E890663148F7A3D3A'
});

let config = {
  method: 'POST',
  url: 'https://account-api.topmediai.com/app/v2/register',
  headers: {
    'User-Agent': 'okhttp/4.12.0',
    'Connection': 'Keep-Alive',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  data: data
};

return (await axios.request(config)).data.data.token;
}
async function makeSong(lyrics, styles, title, gender = 1, token) {
let data = qs.stringify({
  'action': 'custom',
  'lyrics': lyrics,
  'style': styles,
  'title': title,
  'instrumental': '0',
  'mv': 'v4.5',
  'gender': gender == 1 ? 'male' : 'female'
});

let config = {
  method: 'POST',
  url: 'https://aimusic-api.topmediai.com/app/v2/async/text-to-song',
  headers: {
    'User-Agent': 'okhttp/4.12.0',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/x-www-form-urlencoded',
    'authorization': 'Bearer ' + token
  },
  data: data
};


return (await axios.request(config)).data.data.ids;

}

async function sono(lyrics, styles, title, gender) {
const token = await getToken();
const task = await makeSong(lyrics, styles, title, gender, token);
const result = await Result(token, task);
return result;
};
module.exports = sono;