const { Jimp } = require("jimp");

module.exports.config = {

  name: "تحرش",
  Hide: true,
 

  Auth: 0,

  Owner: "Gry KJ",

  Info: "رد على لبدك تقبله",

  Class: "ادوات"

};

module.exports.onPick = async function({event, args, sh, usersData}) {

  if(!event.messageReply && Object.keys(event.mentions).length == 0) {

  sh.reply("رد على حد او منشنه عشان تقبله");

  } else {

  sh.reply("⏳ جاري تجهيز القبلة، انتظر قليلاً...");

  const target = event.messageReply?.senderID || Object.keys(event.mentions)?.[0];

  const targetUrl = args[0] == "pic" || args[0] == "صورة" ? event.messageReply.attachments[0].url : args[0] == "2pics" || args[0] == "صورتين" ? event.messageReply.attachments[0].url : await usersData.getAvatarUrl(target);

      const userUrl = args[0] == "2pics" || args[0] == "صورتين" ? event.messageReply.attachments[1].url : await usersData.getAvatarUrl(event.senderID);

  const background = new Jimp({ width: 720 * 2, height: 720, color: 0xffffffff });

  const image = await Jimp.read(targetUrl);

  const image2 = await Jimp.read(userUrl);

  image.cover({w: 720, h: 720});

  image2.cover({w: 720, h: 720});

  background.composite(image, 0, 0);

  background.composite(image2, 720, 0);

  await background.write(__dirname + "/cache/kiss.png");

  const img = await funcs.imgbb(fs.createReadStream(__dirname + "/cache/kiss.png"));

  let result = await scraper.glam.imgToVideo("make the person in right slap a fast slap the other person, the other person will touch his cheek with angry face", img, 5);

  if (Array.isArray(result) && result.length > 0) {

  sh.str("مبروك! لقد تم تقبيل الشخص بنجاح 🎉", result[0].video_url);

  } else {

  sh.react("🚫");

  }

 }

}