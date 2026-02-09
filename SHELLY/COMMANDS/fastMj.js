const fs = require("fs");
const sharp = require("sharp");
const axios = require("axios");

module.exports.config = {
  name: "ميد",
  Multi: ["fastMj", "fmj"], 
  Auth: 0,
  Owner: "Gry KJ",
  Info: "تشغيل أغنية",
  Class: "ادوات"
};
module.exports.onPick = async function({sh, args, event}) {
  if (!args) {
    return sh.reply("⚠️ | يرجى تقديم نص لإنشاءه");
  }
  try {
            sh.react("⚙️");
            const prompt = args.join(" ");
            const image = await scraper.fastMj(prompt);
            if(!image[0].imageUrl) return sh.react("❌");
            const imageStream = await funcs.imgd(image[0].imageUrl);
            const imageUrl = image[0].imageUrl;
            const info = await sh.reply({
                body: "✅ | تم الانتهاء بنجاح ✨\n\nاختار : \n" + "U1 , U2 , U3 , U4",
                attachment: imageStream
            });
            global.shelly.Reply.push({
                    name: "ميد",
                    ID: info.messageID,
                    author: event.senderID,
                    imageUrl: imageUrl,
                    Actions: image.actions
                });
            await sh.react("✅");
} catch (e) {
  sh.react("🚫");
}
}

module.exports.Reply = async ({ sh: Message, event, Reply }) => {
        let { author, imageUrl } = Reply;
        if (event.senderID !== author) return;
        const args = event.body.split(" ");
        const options = [
          "U1",
          "U2",
          "U3",
          "U4",
        ];
        const userSelection = args[0]?.toUpperCase();
        if (!options.includes(userSelection)) {
            Message.reply(`⚠️ | اختيار خاطئ اختار بين ${options.join(' , ')}.`);
            return;
        }
        try {
           Message.react("⚙️");
           await Message.reply("⚠️ | جاري تعديل الصورة انتظر...");
           const res = await axios.get(imageUrl, {responseType: "arraybuffer"});
           const buffer = Buffer.from(res.data);
           await cutImage(buffer, options.indexOf(userSelection));
           Message.reply({
                body:`✅ | تم تعديل الصورة : ${userSelection.toUpperCase()}}`,
                attachment: fs.createReadStream(__dirname + "/cache/fastMj.png")
            });
            await Message.react("✔️");
        } catch (error) {
            Message.react("❌");
            Message.reply(".فشل في العملية");
        }
    }



  async function cutImage(buffer, imageNUM) {
  const image = sharp(buffer);
  const { width, height } = await image.metadata();
  const widthQuarter = Math.floor(width / 2);
  const heightQuarter = Math.floor(height / 2);

  const regions = [
    { left: 0, top: 0, width: widthQuarter, height: heightQuarter },
    { left: widthQuarter, top: 0, width: widthQuarter, height: heightQuarter }, 
    { left: 0, top: heightQuarter, width: widthQuarter, height: heightQuarter }, 
    { left: widthQuarter, top: heightQuarter, width: widthQuarter, height: heightQuarter }
  ];

    const region = regions[imageNUM];
    const buff = await sharp(buffer)
      .extract(region)
      .toBuffer();
      fs.writeFileSync(__dirname + "/cache/fastMj.png", buff);

}