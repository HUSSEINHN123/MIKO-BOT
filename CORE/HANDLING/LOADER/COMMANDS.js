const fs = require("fs");

class CommandBuilder {
    constructor(api) {
        this.api = api;
        this.loader();
    }
    loader() {
        const COMMANDS = fs.readdirSync(global.shelly.mainPath + '/MIKU/COMMANDS').filter(COMMAND => COMMAND.endsWith('.js'));
	for (let COMMAND of COMMANDS) {
		try {
			var module = require(global.shelly.mainPath + '/MIKU/COMMANDS/' + COMMAND);
			if (!module.config || !module.onPick) throw new Error("Error in cmd format");
			if (global.shelly.cmds.has(module.config.name || '')) throw new Error("Name Is Repeated " + module.config.name + " - " + COMMAND);
			if (module.All) {
				global.shelly.events.push(module.config.name);
			}
			global.shelly.cmds.set(module.config.name, module);
			if (module.config.Multi) {
				const MultiNames = module.config.Multi;
				for (let MultiName of MultiNames) {
					global.shelly.Multi.set(MultiName, module);
				}
			}
			if (module.onLoad) {
				try {
					const moduleData = {};
					moduleData.api = this.api;
					module.onLoad(moduleData);
				} catch (err) {
					throw new Error(`Can't onLoad : ${module.config.name} 👽 ${err}`);
				}
			}
		} catch (e) {
			console.error(e);
			
		}
	}
    }
}

module.exports = CommandBuilder;
