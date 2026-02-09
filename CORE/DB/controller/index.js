const { config } = global;
const { graphQlQueryToJson } = require("graphql-query-to-json");


const logger = (LOG) => (global.logger([
  {
  message: "※ DB ▷ ",
   color: [...config.THEME.main],
  },
  {
  message: LOG,
  color: config.THEME.text,
  },
]));

const databaseType = config.DATABASE.type;


function fakeGraphql(query, data, obj = {}) {
	if (typeof query != "string" && typeof query != "object")
		throw new Error(`The "query" argument must be of type string or object, got ${typeof query}`);
	if (query == "{}" || !data)
		return data;
	if (typeof query == "string")
		query = graphQlQueryToJson(query).query;
	const keys = query ? Object.keys(query) : [];
	for (const key of keys) {
		if (typeof query[key] === 'object') {
			if (!Array.isArray(data[key]))
				obj[key] = data.hasOwnProperty(key) ? fakeGraphql(query[key], data[key] || {}, obj[key]) : null;
			else
				obj[key] = data.hasOwnProperty(key) ? data[key].map(item => fakeGraphql(query[key], item, {})) : null;
		}
		else
			obj[key] = data.hasOwnProperty(key) ? data[key] : null;
	}
	return obj;
}

module.exports = async function (api) {
	var threadModel, userModel, dashBoardModel;
	switch (databaseType) {
		    case "mongodb": {
			const defaultClearLine = process.stderr.clearLine;
			process.stderr.clearLine = function () { };
           logger('Try connect MONGO');
			try {
				var { threadModel, userModel, globalModel } = await require("../connectDB/connectMongoDB.js")(config.DATABASE.URI);
				process.stderr.clearLine = defaultClearLine;
                logger('Done connected MONGO');
			}
			catch (err) {
				process.stderr.clearLine = defaultClearLine;
                logger(`Error when trying connect the DB:\n${err.message}`, 'DATABASE');
				process.exit(0);
			}
			break;
		}
		case "sqlite": {
			const defaultClearLine = process.stderr.clearLine;
			process.stderr.clearLine = function () { };
			try {
				var { threadModel, userModel, globalModel } = await require("../connectDB/connectSqlite.js")();
				process.stderr.clearLine = defaultClearLine;
                logger("sqlite DB has CONNECTED")
			}
			catch (err) {
				process.stderr.clearLine = defaultClearLine;
                logger(`cant connect db for ${err.stack}`);
				process.exit(0);
			}
			break;
		}
		default:
			break;
	}

	const threadsData = await require("./threadsData.js")(databaseType, threadModel, api, fakeGraphql);
	const usersData = await require("./usersData.js")(databaseType, userModel, api, fakeGraphql);
  const globalData = await require("./globalData.js")(databaseType, globalModel, fakeGraphql);
	

	global.db = {
		...global.db,
		threadModel,
		userModel,
    globalModel,
		threadsData,
		usersData,
    globalData
			};

	return {
		threadModel,
		userModel,
    globalModel,
		threadsData,
		usersData,
    globalData,
		databaseType
	};
};