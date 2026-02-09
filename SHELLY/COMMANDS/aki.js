const FormData  = require("form-data");
 
async function NewGame() {
 
  const res = await fetch("https://ar.akinator.com/game", {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "content-type": "application/x-www-form-urlencoded",
    "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": "cf_clearance=sU4_wF_8CSgbHxbtDmg4HBfUQN1Pab8.0bduXdP85ss-1755019501-1.2.1.1-.D.htXLKKT6EBww0_3P7SMBURs9SkSDCJNplIKGcc0kEDc3v5vtTH7xCKgQtwhsixndvgKS8Lb7x.qpRzPeys6l0WAbQTSIVH1Y00oIH9mYq6jFYaJ30iJDJbAO8GEGC1wDRc7iDEuAC1NYSXtEqBB6ZzqyLTu2Mpp5j4B_qkbRgEF.dF5FqhSt1xjlXJhjPGhuwvGG1ZR4QZXgQRFXBarQpZB2dDTEBs0Gca0Jbz6k; SERVERID250165=00aa354c|aJt5A|aJt45",
    "Referer": "https://ar.akinator.com/",
    "Referrer-Policy": "same-origin"
  },
  "body": "cm=false&sid=1",
  "method": "POST"
});
 
  const text = await res.text();
 
  const question = text.match(/<p class="question-text" id="question-label">(.+)<\/p>/)[1];
  const session = text.match(/session: '(.+)'/)[1];
  const signature = text.match(/signature: '(.+)'/)[1];
 
  return {
    question: question,
    si: session,
    co: signature,
    progression: "0.0000",
    step: "0"
  };
}
 
async function NextGame(si, co, answer, progression, step) {
  const params = new URLSearchParams({
    'step': step,
    'progression': progression,
    'sid': 'NaN',
    'cm': 'false',
    'answer': answer,
    'step_last_proposition': '',
    'session': si,
    'signature': co
  });
 
  const res = await fetch('https://ar.akinator.com/answer', {
    method: "POST",
    headers: {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "content-type": "application/x-www-form-urlencoded",
    "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": "cf_clearance=sU4_wF_8CSgbHxbtDmg4HBfUQN1Pab8.0bduXdP85ss-1755019501-1.2.1.1-.D.htXLKKT6EBww0_3P7SMBURs9SkSDCJNplIKGcc0kEDc3v5vtTH7xCKgQtwhsixndvgKS8Lb7x.qpRzPeys6l0WAbQTSIVH1Y00oIH9mYq6jFYaJ30iJDJbAO8GEGC1wDRc7iDEuAC1NYSXtEqBB6ZzqyLTu2Mpp5j4B_qkbRgEF.dF5FqhSt1xjlXJhjPGhuwvGG1ZR4QZXgQRFXBarQpZB2dDTEBs0Gca0Jbz6k; SERVERID250165=00aa354c|aJt5A|aJt45",
    "Referer": "https://ar.akinator.com/",
    "Referrer-Policy": "same-origin"
  },
    body: params
  });
 
  const data = await res.json();
  data.akitude = "https://ar.akinator.com/assets/img/akitudes_670x1096/" + data.akitude;
  return data;
}
 
async function BackGame(si, co, progression, step) {
  const params = new URLSearchParams({
    'step': step,
    'progression': progression,
    'sid': 'NaN',
    'cm': 'false',
    'session': si,
    'signature': co
  });
 
  const res = await fetch('https://ar.akinator.com/cancel_answer', {
    method: "POST",
    headers: {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "content-type": "application/x-www-form-urlencoded",
    "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "cookie": "cf_clearance=sU4_wF_8CSgbHxbtDmg4HBfUQN1Pab8.0bduXdP85ss-1755019501-1.2.1.1-.D.htXLKKT6EBww0_3P7SMBURs9SkSDCJNplIKGcc0kEDc3v5vtTH7xCKgQtwhsixndvgKS8Lb7x.qpRzPeys6l0WAbQTSIVH1Y00oIH9mYq6jFYaJ30iJDJbAO8GEGC1wDRc7iDEuAC1NYSXtEqBB6ZzqyLTu2Mpp5j4B_qkbRgEF.dF5FqhSt1xjlXJhjPGhuwvGG1ZR4QZXgQRFXBarQpZB2dDTEBs0Gca0Jbz6k; SERVERID250165=00aa354c|aJt5A|aJt45",
    "Referer": "https://ar.akinator.com/",
    "Referrer-Policy": "same-origin"
  },
    body: params
  });
 
  const data = await res.json();
  data.akitude = "https://ar.akinator.com/assets/img/akitudes_670x1096/" + data.akitude;
  return data;
}
 
module.exports = {
  config: {
    name: "اكيناتور",
    Auth: 0,
    Multi: ["aki"],
    Class: "العاب",
    Owner: "Gry KJ",
  },
 
  onPick: async function ({ event, api, args, sh: message, commandName }) {
    let GenGame = await NewGame();
 
      const message_ = GenGame.question;
    return message.reply({ body: `${message_} 👀\n\nالرجاء الرد ب\n\nنعم | لا | لا اعلم | من الممكن | الضاهر لا | رجوع` }, (error, info) => {
      global.shelly.Reply.push({
        name: "اكيناتور",
        author: event.senderID,
        ID: info.messageID,
        progression: GenGame.progression,
        si: GenGame.si,
        co: GenGame.co,
        step: GenGame.step
      });
    });
  },
 
  Reply: async function ({ api, event, Reply, sh: message }) {
    const { author, messageID, progression, si, co, step } = Reply;
    if (event.senderID != author) return;
    let answer;
    switch (event.body) {
      case "نعم":
        answer = "0";
        break;
      case "لا":
        answer = "1";
        break;
      case "لا اعلم":
        answer = "2";
        break;
      case "من الممكن":
        answer = "3";
        break;
        case "الضاهر لا":
        answer = "4";
        break;
       case "رجوع":
       answer = "e";
        break;
 
      default:
        return message.reply("الرجاء الرد ب\n\nنعم | لا | لا اعلم | رجوع | من الممكن | الضاهر لا | رحوع");
    }
let result;
      if(answer == "e") {
          result = await BackGame(si, co, progression, step);
      } else {
   result = await NextGame(si, co, answer, progression, step);
      }
if(result?.name_proposition) {
  const name = result.name_proposition;
    const des = result.description_proposition;
    const imged = await funcs.imgd(result.photo);
 return message.reply({
    body: `🪄|إســـم الشـخصـية: ❨${name}❩\n⌯↢نبــــذة عنها:${des}`,
    attachment: imged
  })
}
 
    const replymessage = result.question;
 
    return message.reply({ body: `${replymessage} 🚶\n\nالرجاء الرد ب\n\nنعم | لا | لا اعلم | من الممكن | الضاهر لا | رجوع` }, (error, info) => {
      global.shelly.Reply.push({
        name: "اكيناتور",
        author: event.senderID,
        ID: info.messageID,
        progression: result.progression,
        si: si,
        co: co,
        step: result.step
      });
    });
  },
};