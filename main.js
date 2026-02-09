const login = require('./CORE/FCA');
require("./CORE/HANDLING/LOADER/GLOBALS.js");
let appState;
try { appState = fs.readJSONSync(config.APPSTATEPATH) } catch {
	return global.logger([
            {
            message: "※ ERR ▷",
             color: [...config.THEME.main],
            },
            {
            message: "please check your appstate",
            color: "red",
            },
            ]);
}
const logger = (data) => (global.logger([
            {
            message: "※ REFRESHING ▷ ",
             color: [...config.THEME.main],
            },
            {
            message: data,
            color: config.THEME.text,
            },
            ]));
login({ appState }, async (err, api) => {
	if (err) return console.error(err);
	global.config.shellyID = api.getCurrentUserID();
	api.setOptions(global.config.FCAOption);
	const DATABASE = await require('./CORE/DB/controller/index.js')(api);
	const {
		threadsData,
		usersData,
		globalData,
		databaseType
	} = DATABASE;
	new (require("./CORE/HANDLING/LOADER/COMMANDS.js"))(api);
	new (require("./CORE/HANDLING/LOADER/EVENTS.js"));
	async function startListening() {
		const listen = require("./CORE/HANDLING/listen.js")({ threadsData, usersData, globalData, api });
		api.listenMqtt((error, message) => {
			if (error) return console.error(error);
			if (['presence', 'typ', 'read_receipt'].some(data => data == message.type)) return;
			if (global.config.DeveloperMode == true) console.log(message);
			return listen(message);
		});
		await new Promise(res => setTimeout(res, 1000));
		setTimeout(async () => {
			logger(`Listening Refresh...`);
			await api.stopListeningAsync();
			logger(`DONE REFRESHING`);
			startListening();
		    }, 1000 * 60 * 3);
	}
	startListening();
})