const { join } = require("path");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "كمند",
    version: "1.0.0",
    Auth: 3,
    Owner: "S H A D Y",
    Class: "المطور",
    Hide: true,
    Time: 5,
  },
  onPick: async function ({ args, sh: Message, api }) {
    const allWhenChat = global.shelly.events;

    const loadCmd = function (filename, api) {
      try {
        const pathCommand = join(__dirname, `${filename}.js`);
        if (!fs.existsSync(pathCommand))
          throw new Error(`ليس هناك امر بأسم ${filename}.js `);
        
        const oldCommand = require(pathCommand);
        const oldNameCommand = oldCommand.config.name;

        if (oldCommand.config.Multi) {
          const oldShortName = Array.isArray(oldCommand.config.Multi)
            ? oldCommand.config.Multi
            : [oldCommand.config.Multi];

          for (const Multi of oldShortName)
            global.shelly.Multi.delete(Multi);
        }

        delete require.cache[require.resolve(pathCommand)];
        const command = require(pathCommand);
        const configCommand = command.config;
         const configCommand2 = command.onPick;

        if (!configCommand) throw new Error("خطأ في صياغة الامر");
         if (!configCommand2) throw new Error("خطأ في صياغة الامر");

        

        const nameScript = configCommand.name;
        const indexWhenChat = allWhenChat.findIndex((item) => item === oldNameCommand);

        if (indexWhenChat !== -1) {
          allWhenChat[indexWhenChat] = null;
        }

        if (command.All) global.shelly.events.push(command.config.name);
        global.shelly.cmds.set(command.config.name, command);

        if (configCommand.Multi) {
          const Multi = Array.isArray(configCommand.Multi)
            ? configCommand.Multi
            : [configCommand.Multi];

          for (const KJs of Multi) {
            if (typeof KJs === "string") {
              if (global.shelly.Multi.has(KJs)) {
                throw new Error(
                  ` الاسم المختصر ${KJs} موجود في اوامر اخري: ${global.shelly.Multi.get(
                    KJs
                  )}`
                );
              } else {
                global.shelly.Multi.set(KJs, command);
              }
            }
          }
        }

        if (!command.config.name) throw new Error(`امر بدون اسم !`);


        if (command.onLoad) {
          try {
            command.onLoad({ api });
          } catch (error) {
            const errorMessage = " خطاء في اوامر البداية.";
            throw new Error(errorMessage, "error");
          }
        }

        global.shelly.cmds.delete(oldNameCommand);
        global.shelly.cmds.set(nameScript, command);

        return {
          status: "success",
          name: filename,
        };
      } catch (err) {
        return {
          status: "failed",
          name: filename,
          error: err,
        };
      }
    };

    if (!args[0]) {
      return Message.reply("❌ | تحميل؟ او لود؟");
    } else if (args[0] == "تحميل") {
      if (!args[1]) return Message.reply("❌ | اكتب اسم امر");
      const infoLoad = loadCmd(args[1], api);
      if (infoLoad.status == "success")
        Message.reply(`✅ | تم تحميل "${infoLoad.name}.js" بنجاح`);
      else
        Message.reply(
          `❌ | حدث خطاء ${infoLoad.name} الاخطاء\n${infoLoad.error.stack
            .split("\n")
            .filter((i) => i.length > 0)
            .slice(0, 5)
            .join("\n")}`
        );
      global.shelly.events = allWhenChat.filter((item) => item !== null);
    } else if (args[0].toLowerCase() == "لود") {
      const allFile = fs
        .readdirSync(__dirname)
        .filter((item) => item.endsWith(".js"))
        .map((item) => item.split(".")[0]);
      const arraySuccess = [];
      const arrayFail = [];
      for (const name of allFile) {
        const infoLoad = loadCmd(name, api);
        infoLoad.status == "success"
          ? arraySuccess.push(name)
          : arrayFail.push(`${name}: ${infoLoad.error.name}: ${infoLoad.error.message}`);
      }
      global.shelly.events = allWhenChat.filter((item) => item !== null);
      Message.reply(
        `✅ | تم تحميل ${arraySuccess.length} امر بنجاح` +
          `${arrayFail.length > 0 ? `\n❌ | اخطاء التحميل: ${arrayFail.length} امر \n${arrayFail.join("\n")}` : ""}`
      );
    }
  },
};
