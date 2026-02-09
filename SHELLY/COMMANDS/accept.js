module.exports.config = {
  name: "قبول",
  Auth: 2,
  Owner: "Gry KJ",
  Info: "قبول اصدقاء الفيس",
  Class: "المطور",
  How: "قبول",
  Time: 0
};  


module.exports.Reply = async ({ Reply , event, api }) => {
  const { author, listRequest } = Reply;
  if (author != event.senderID) return;
  const args = event.body.replace(/ +/g, " ").toLowerCase().split(" ");

  const form = {
    av: api.getCurrentUserID(),
    fb_api_caller_class: "RelayModern",
    variables: {
      input: {
        source: "friends_tab",
        actor_id: api.getCurrentUserID(),
        client_mutation_id: Math.round(Math.random() * 19).toString()
      },
      scale: 3,
      refresh_num: 0
    }
  };

  const success = [];
  const failed = [];

  if (args[0] == "add") {
    form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
    form.doc_id = "3147613905362928";
  }
  else if (args[0] == "del") {
    form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
    form.doc_id = "4108254489275063";
  }
  else return api.sendMessage("من فضلك اختر <add | del > <end | order or \"all\">", event.threadID, event.messageID);
  let targetIDs = args.slice(1);

  if (args[1] == "all") {
    targetIDs = [];
    const lengthList = listRequest.length;
    for (let i = 1; i <= lengthList; i++) targetIDs.push(i);
  }

  const newTargetIDs = [];
  const promiseFriends = [];

  for (const stt of targetIDs) {
    const u = listRequest[parseInt(stt) - 1];
    if (!u) {
      failed.push(`لم يتم ايجاد ${stt} في القائمة`);
      continue;
    }
    form.variables.input.friend_requester_id = u.node.id;
    form.variables = JSON.stringify(form.variables);
    newTargetIDs.push(u);
    promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
    form.variables = JSON.parse(form.variables);
  }

  const lengthTarget = newTargetIDs.length;
  for (let i = 0; i < lengthTarget; i++) {
    try {
      const friendRequest = await promiseFriends[i];
      if (JSON.parse(friendRequest).errors) failed.push(newTargetIDs[i].node.name);
      else success.push(newTargetIDs[i].node.name);
    }
    catch(e) {
      failed.push(newTargetIDs[i].node.name);
    }
  }

  api.sendMessage(`» تم ${args[0] == 'حذف' ?'قبول': 'قبول'} طلبات الصداقة الخاصة ب ${success.length} اشخاص :\n${success.join("\n")}${failed.length > 0?'\n» فشل ${failed.length} اشخاص: ${failed.join("\n")}' : ""}`, event.threadID, event.messageID);
};


module.exports.onPick = async ({ event, api }) => {
  const moment = require("moment-timezone");
  const form = {
    av: api.getCurrentUserID(),
    fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
    fb_api_caller_class: "RelayModern",
    doc_id: "4499164963466303",
    variables: JSON.stringify({input: {scale: 3}})
  };
  const listRequest = JSON.parse(await api.httpPost("https://www.facebook.com/api/graphql/", form)).data.viewer.friending_possibilities.edges;
  let msg = "";
  let i = 0;
  for (const user of listRequest) {
    i++;
    msg += (`\n${i}. الاسم: ${user.node.name}`
         + `\n𝐈𝐃: ${user.node.id}`
         + `\nرابط الملف الشخصي: ${user.node.url.replace("www.facebook", "fb")}`
         + `\nالوقت: ${moment(user.time*1009).tz("africa/morocco").format("DD/MM/YYYY HH:mm:ss")}\n`);
  }
  api.sendMessage(`${msg}\قم بالرد على هذه الرسالة بأحد الاوامر التالية : <add | del> <the order of | or \"all\"> لاتخاد قرار`, event.threadID, (e, info) => {
      global.shelly.Reply.push({
        name: this. config. name,
        ID: info.messageID,
        listRequest,
        author: event.senderID
      });
    }, event.messageID);
};