module.exports = {

config: {

name:"بادئة",

Multi: ["prefix", "بريفكس"],

Class:"اعدادات",

Info: "كسم ليهتم",

Time: 0,

Auth: 1

},

onPick: async ({args, sh, threadsData, event}) => {

const prefix = args[0];

if (prefix.length < 1 || prefix.length > 1) return;

await threadsData.set(event.threadID, prefix.toString(), "data.prefix");

sh.reply(`تم تغيير البادئة إلى [${prefix}]`);

}};