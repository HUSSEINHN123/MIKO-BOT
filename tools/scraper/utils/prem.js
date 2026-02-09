const axios = require('axios');
const crypto = require('crypto');
const cheerio = require('cheerio');

async function Mail() {
  try {
    const data = JSON.stringify({});
    const config = {
      method: 'POST',
      url: 'https://tempmail.la/api/mail/create',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
      },
      data
    };
    const r = await axios.request(config);
    return r.data.data.address;
  } catch (err) {
    return Mail();
  }
}

async function MailBox(mail) {
  try {
    const data = JSON.stringify({ address: mail, cursor: null });
    const config = {
      method: 'POST',
      url: 'https://tempmail.la/api/mail/box',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
        'sec-ch-ua-mobile': '?0',
        'product': 'TEMP_MAIL',
        'locale': 'en-US',
        'platform': 'PC',
        'sec-gpc': '1',
        'accept-language': 'en;q=0.7',
        'origin': 'https://tempmail.la',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://tempmail.la/temporary-email',
        'priority': 'u=1, i'
      },
      data
    };
    const r = await axios.request(config);
    return r.data.data.rows;
  } catch (err) {
    return MailBox(mail);
  }
}

async function signUser(username, email) {
  let data = JSON.stringify([{
    email: email,
    userName: username,
    password: username + username
  }]);

  let config = {
    method: 'POST',
    url: 'https://fluxproweb.com',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Accept': 'text/x-component',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'text/plain;charset=UTF-8',
      'sec-ch-ua-platform': '"Windows"',
      'next-action': '424401cbe4e8b1b79045e4ac3dcf3d788c2156dd',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-gpc': '1',
      'accept-language': 'en;q=0.9',
      'origin': 'https://fluxproweb.com',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://fluxproweb.com/',
      'priority': 'u=1, i'
    },
    data: data
  };

  try {
    let response = await axios.request(config);
    return response.data;
  } catch (err) {
    throw err;
  }
}
async function verifyUser(username, code, email) {
  let data = JSON.stringify([{
    email: email,
    emailCode: code
  }]);

  let config = {
    method: 'POST',
    url: 'https://fluxproweb.com',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Accept': 'text/x-component',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'text/plain;charset=UTF-8',
      'sec-ch-ua-platform': '"Windows"',
      'next-action': 'efbaa6169049c8cb5fd4fd1abe810d880738ab19',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-gpc': '1',
      'accept-language': 'en;q=0.9',
      'origin': 'https://fluxproweb.com',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://fluxproweb.com/',
      'priority': 'u=1, i'
    },
    data: data
  };

  try {
    let response = await axios.request(config);
    return response.data;
  } catch (err) {
    throw err;
  }
}
async function loginUser(username, email) {
  let data = JSON.stringify([{
    email: email,
    password: username + username
  }]);

  let config = {
    method: 'POST',
    url: 'https://fluxproweb.com',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Accept': 'text/x-component',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'text/plain;charset=UTF-8',
      'sec-ch-ua-platform': '"Windows"',
      'next-action': '1c7778f900ce2db3f2c455a90e709ef29ae30db3',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-gpc': '1',
      'accept-language': 'en;q=0.9',
      'origin': 'https://fluxproweb.com',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://fluxproweb.com/',
      'priority': 'u=1, i'
    },
    data: data,
    withCredentials: true,
    maxRedirects: 0
  };

  try {
    let response = await axios.request(config);
    let cookies = response.headers["set-cookie"];
    if (!cookies || !cookies[0]) {
      throw new Error("Login failed: No cookies returned");
    }
    return cookies[0];
  } catch (err) {
    if (err.response?.headers?.["set-cookie"]) {
      const cookie = err.response.headers["set-cookie"][0];
      if (!cookie) {
        throw new Error("Login failed: Empty cookie");
      }
      return cookie;
    }
    throw new Error("Login failed: " + err.message);
  }
}

async function getPresignedUrl(token, length = 1) {
  const response = await axios.request({
    method: 'POST',
    url: 'https://api2.tap4.ai/image/presignedUrl',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    },
    data: {
      site: "fluxproweb.com",
      mineType: Array(length).fill("image/jpeg")
    },
    responseType: 'json',
    decompress: true
  });
  return response.data;
}
async function uploadImages(urls, buffers) {
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const config = {
      method: 'PUT',
      url: urls[i].signedUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'image/jpeg',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
        'sec-ch-ua-mobile': '?0',
        'Sec-GPC': '1',
        'Accept-Language': 'en;q=0.9',
        'Origin': 'https://fluxproweb.com',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://fluxproweb.com/'
      },
      data: buffers[i]
    };
    try {
      const response = await axios.request(config);
      results.push(urls[i].url);
    } catch (err) {
      console.log("err")
    }
  }
  return results;
}

async function generateImage(prompt, imageUrl, token, width = 1, height = 1) {
  const response = await axios.request({
    method: 'POST',
    url: 'https://api2.tap4.ai/image/generator4login/async',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    },
    data: {
      site: "fluxproweb.com",
      prompt: prompt,
      outputPrompt: prompt,
      platformType: 27,
      modelName: "gemini-25-flash-image-edit",
      aiEnhance: false,
      width: width,
      height: height,
      styleName: "",
      isPublic: 1,
      imageType: "nano-banana-image",
      imageUrlList: imageUrl
    },
    responseType: 'json',
    decompress: true
  });
  return response.data;
}

async function seeDreamEdit(prompt, imageUrl, token, width = 16, height = 9) {
  const response = await axios.request({
    method: "POST",
    url: "https://api2.tap4.ai/image/generator4login/async",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    data: {
      site: "fluxproweb.com",
      imageType: "seedream-4-0",
      platformType: 44,
      modelName: "seedream-v4-edit",
      isPublic: 1,
      prompt: prompt,
      outputPrompt: prompt,
      width: width,
      height: height,
      resolution: "4k",
      imageUrlList: imageUrl,
    },
    responseType: "json",
    decompress: true,
  });
  return response.data;
}

async function seeDreamGen(prompt, token, width = 16, height = 9) {
  const response = await axios.request({
    method: "POST",
    url: "https://api2.tap4.ai/image/generator4login/async",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    data: {
      site: "fluxproweb.com",
      imageType: "seedream-4-0",
      platformType: 44,
      modelName: "seedream-v4",
      isPublic: 1,
      prompt: prompt,
      outputPrompt: prompt,
      width: width,
      height: height,
      resolution: "4k",
    },
    responseType: "json",
    decompress: true,
  });
  return response.data;
}

async function waitForImageResult(taskID, token, interval = 2000) {
  const url = `https://api2.tap4.ai/image/getResult/${taskID}?site=fluxproweb.com`;

  while (true) {
    const response = await axios.request({
      method: 'GET',
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'json',
      decompress: true
    });

    const result = response.data;

    if (!result.data || result.data.status == "success") {
      return result;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

async function toBuffer(urls) {
  const buffers = [];
  for (let i = 0; i < urls.length; i++) {
    const response = await axios.get(urls[i], { responseType: 'arraybuffer' });
    buffers.push(Buffer.from(response.data));
  }
  return buffers;
}


async function SeeDreamEdit(prompt, imageUrls, width = 16, height = 9) {
  const username = crypto.randomBytes(6).toString("hex");
  const email = await Mail();
  await signUser(username, email);
  let mail = await MailBox(email);
  let code;
  while (true) {
    mail = await MailBox(email);
    if (mail.length != 0) {
      const match = cheerio.load(mail[0].html)('a').first().text().trim();
      if (match) {
        code = match;
        break;
      } else {
        console.log("No code found");
        break;
      }
    }
  }
  await verifyUser(username, code, email);
  let cookie = await loginUser(username, email);
  const decodedCookie = decodeURIComponent(cookie);

  const tokenMatch = decodedCookie?.match(
    /Authorization=(?:Bearer\s+)?([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/
  );
  if (!tokenMatch) {
    throw new Error("Failed to extract token from cookie");
  }
  const token = tokenMatch[1];
  const presigned = await getPresignedUrl(token, imageUrls.length);
  const urls = await uploadImages(
    presigned.rows,
    await toBuffer(
      imageUrls
    )
  );

  const task = await seeDreamEdit(prompt, urls, token, width = 16, height = 9);

  const result = await waitForImageResult(task.data.key, token);
  return result.data.imageResponseVo;
}

async function NanoBanana(prompt, imageUrls, width, height) {
  const username = crypto.randomBytes(6).toString("hex");
  const email = await Mail();
  await signUser(username, email);
  let mail = await MailBox(email);
  let code;
  while (true) {
    mail = await MailBox(email);
    if (mail.length != 0) {
      const match = cheerio.load(mail[0].html)('a').first().text().trim();
      if (match) {
        code = match;
        break;
      } else {
        console.log("No code found");
        break;
      }
    }
  }
  await verifyUser(username, code, email);
  let cookie = await loginUser(username, email);
  const decodedCookie = decodeURIComponent(cookie);

  const tokenMatch = decodedCookie?.match(
    /Authorization=(?:Bearer\s+)?([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/
  );
  if (!tokenMatch) {
    throw new Error("Failed to extract token from cookie");
  }
  const token = tokenMatch[1];
  const presigned = await getPresignedUrl(token);
  const urls = await uploadImages(
    presigned.rows,
    await toBuffer([
      imageUrls
    ])
  );
  const task = await generateImage(prompt, urls, token, width, height);
  const result = await waitForImageResult(task.data.key, token);
  return result.data.imageResponseVo;
}
async function SeeDreamGen(prompt, width, height) {
  const username = crypto.randomBytes(6).toString("hex");
  const email = await Mail();
  await signUser(username, email);
  let mail = await MailBox(email);
  let code;
  while (true) {
    mail = await MailBox(email);
    if (mail.length != 0) {
      const match = cheerio.load(mail[0].html)('a').first().text().trim();
      if (match) {
        code = match;
        break;
      } else {
        console.log("No code found");
        break;
      }
    }
  }
  await verifyUser(username, code, email);
  let cookie = await loginUser(username, email);
  const decodedCookie = decodeURIComponent(cookie);

  const tokenMatch = decodedCookie?.match(
    /Authorization=(?:Bearer\s+)?([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/
  );
  if (!tokenMatch) {
    throw new Error("Failed to extract token from cookie");
  }
  const token = tokenMatch[1];
  const task = await seeDreamGen(prompt, token, width, height);
  const result = await waitForImageResult(task.data.key, token);
  return result.data.imageResponseVo;
}




module.exports = {
  SeeDreamEdit,
  SeeDreamGen,
  NanoBanana
}