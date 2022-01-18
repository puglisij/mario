'use strict';
/*
    See npm "env-paths"
*/
import path from 'path';
import os from 'os';

const homedir = os.homedir();
const tmpdir = os.tmpdir();
const { env } = process;

const macos = name => {
	const library = path.join(homedir, 'Library');

	return {
		config: path.join(library, 'Preferences', name),
		log: path.join(library, 'Logs', name),
		working: path.join(tmpdir, name, 'Working')
	};
};

const windows = name => {
	const appData = env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
	const localAppData = env.LOCALAPPDATA || path.join(homedir, 'AppData', 'Local');

	return {
		config: path.join(appData, name, 'Config'),
		log: path.join(localAppData, name, 'Log'),
		working: path.join(tmpdir, name, 'Working')
	};
};

const envPaths = (name, options) => {
	if (typeof name !== 'string') {
		throw new TypeError(`Expected string, got ${typeof name}`);
	}

	options = Object.assign({suffix: 'nodejs'}, options);

	if (options.suffix) {
		// Add suffix to prevent possible conflict with native apps
		name += `-${options.suffix}`;
	}

	if (process.platform === 'darwin') {
		return macos(name);
	}
	if (process.platform === 'win32') {
		return windows(name);
	}

	return null;
};

export default envPaths;
