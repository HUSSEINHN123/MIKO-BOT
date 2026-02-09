class SeeDreamEdit {

  constructor(name) {

    this.config = {

      name,

      Multi: ["sd"],

      Auth: 0,

      Owner: "Gry KJ",

      Class: "ذكاء اصطناعي",

    };

  }

  async onPick({ sh, text, event }) {

    if (!text) return sh.reply("اكتب شيءا");

    sh.react("⏱️")

    try {

    if (event?.messageReply?.attachments?.[0]) {

      const urls = event.messageReply.attachments.map((e) => e.url);

      sh.str(

        "تم تعديل صورتك",

        (await scraper.prem.SeeDreamEdit(text, urls)).url

      );

    } else {

      sh.str("تم انشاء صورتك", (await scraper.prem.SeeDreamGen(text)).url);

    }

  } catch (e) {
    console.error("SeeDream Error:", e);
  }

} 

}

module.exports = new SeeDreamEdit( "سيدريم");