module.exports.config = {
    name: "تحريك",
    Auth: 0,
    Multi: ["animate"],
    Owner: "Gry KJ",
    Info: "حوّل صورتك إلى فيديو متحرك حسب الوصف الذي تقدمه (مثال: اجعلها أنمي).",
    Class: "ذكاء اصطناعي",
    How: "[الوصف]",
};

module.exports.onPick = async function({ event, args, sh }) {
    const prompt = args.join(" ").trim();

    if (!prompt) {
        sh.reply("يرجى كتابة وصف لكيفية تحويل الصورة إلى فيديو.");
        return;
    }

    if (event?.messageReply && event.messageReply?.attachments[0]?.url && event.messageReply.attachments[0].type == "photo") {
        try {
            const img = await funcs.topMedia(event.messageReply.attachments[0].url);
            sh.react(`🕖`);
            let result = await scraper.glam.imgToVideo(prompt, img);
            if (Array.isArray(result) && result.length > 0) {
                sh.str("✨ تم تحويل صورتك إلى فيديو متحرك بنجاح:", result[0].video_url);
            } else {
                sh.reply("🚫 حدث خطأ أثناء معالجة الصورة. حاول مرة أخرى.");
            }
        } catch (e) {
            console.error(e);
            sh.reply("🚫 حدث خطأ غير متوقع أثناء تحويل الصورة إلى فيديو.");
        }
    } else {
        sh.reply("يرجى الرد على صورة لإجراء التحويل إلى فيديو.");
    }
};
