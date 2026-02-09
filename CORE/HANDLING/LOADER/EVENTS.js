class EventLoader {
    constructor() {
        this.loader();
    }
    loader() {
        const EVENTOS = fs.readdirSync(global.shelly.mainPath + '/SHELLY/EVENTS').filter(COMMAND => COMMAND.endsWith('.js'));
	for (let EVENTO of EVENTOS) {
		try {
			var module = require(global.shelly.mainPath + '/SHELLY/EVENTS/' + EVENTO);
			if (!module.config || !module.Event) throw new Error("Error in cmd format");
			if (global.shelly.eventV2.has(module.config.name || '')) throw new Error("Name Is Repeated");
			global.shelly.eventV2.set(module.config.name, module);
		} catch (e) {
			console.error(e);
		}
	}
    }
}

module.exports = EventLoader;