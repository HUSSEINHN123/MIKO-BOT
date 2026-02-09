const Black = {
  name: "افتار",
  Multi: ["افاتار", "بروفايل", "بروفايلي", "بروفايله"],
  Owner: "Gry KJ",
  Auth: 0,
  Time: 0,
  Info: "صورتك او اخذ صوره غيرك",
  Class: "وسائط",
}

const cheerio = require('cheerio');
const axios = require ("axios");

module.exports = {
config: Black,
onPick: async ({ api, event, args, sh: black, usersData }) => {
    if(!event.messageReply && !args[0]) return black.reply("رد على حد او منشنه\n اذا بدك تبعك رد على نفسك بالامر ");
const CGB = config.AD[0];
  const Mods = funcs;
const tvm = args.join(" ");
if (tvm == "حط" && event.senderID == CGB)
{
if(["photo"].includes(event.messageReply.attachments[0].type))
{
 api.changeAvatar(await global.funcs.str(event.messageReply.attachments[0].url), (err, data) => { if (err) return black.reply("حدث خطأ ف تغيير الصورة")})
 return black.reply("تم!")     
}
else return black.reply("رد على صورة");
}

if (!event.messageReply && !args) {
  const avUrl = await usersData.getAvatarUrl(event.senderID);
black.reply({body: "┊ ┊ ⋆˚ ⁭تفضل ┊ ┊ ⋆˚ ⁭", attachment: await global.funcs.str(avUrl)})
}
if (event.messageReply)
{
if (event.messageReply.senderID == CGB) return black.reply("ماتقدرررر");
 const avUrl = await usersData.getAvatarUrl(event.messageReply.senderID)
black.reply({body: "┊ ┊ ⋆˚ ⁭تفضل ┊ ┊ ⋆˚ ⁭", attachment: await global.funcs.str(avUrl)})
}
if (Object.keys(event.mentions)[0] != undefined)
{
if (Object.keys(event.mentions)[0] == CGB) return black.reply("مش ممكن");
const avUrl = await usersData.getAvatarUrl(Object.keys(event.mentions)[0])
black.reply({body: "┊ ┊ ⋆˚ ⁭تفضل ┊ ┊ ⋆˚ ⁭", attachment: await global.funcs.str(avUrl)})

}
if (tvm.startsWith("https://facebook"))
{
const res = await axios.get(tvm);

const html = res.data;

const $ = cheerio.load(html);

const metaTags = {};
$('meta').each((index, element) => {
  const name = $(element).attr('name');
  const content = $(element).attr('content');
  if (name && content) {
      metaTags[name] = content;
  }
});

const UIDD = metaTags['apple-itunes-app'];
const UID = UIDD?.split('//profile/')[1] || "";
const avUrl = await usersData.getAvatarUrl(UID);
if (!UID) return black.reply("حذث خطأ");
black.reply({body: "┊ ┊ ⋆˚ ⁭تفضل ┊ ┊ ⋆˚ ⁭",attachment: await global.funcs.str(avUrl)})
}
}
 };
