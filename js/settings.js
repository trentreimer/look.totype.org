import { languages } from './languages.js';
import { setLanguage, initLanguage } from './language-settings.js';
import { setUpEyeMsg } from './eye-msg-functions.js';

export const settings = {};
export const tw = {}; // Typewriter properties

export const storagePrefix = 'look.totype.org';

export function storageKey(name) {
    return `${storagePrefix}:${name}`;
}

const localStorageSettings = ['charRotationPause', 'language'];

export async function initSettings() {
    // Values written before storage keys were namespaced are dropped so a
    // stale key from another page on this origin can never influence the app.
    for (const key of ['charRotationPause', 'language']) {
        localStorage.removeItem(key);
    }

    const charRotationPause = parseInt(localStorage.getItem(storageKey('charRotationPause')));

    settings.charRotationPause = charRotationPause >= 750 ? charRotationPause : 1500;

    tw.lastSelectedValueIsWord = false;

    tw.eyeMsgChars = [];
    tw.eyeMsgCharsetIndex = 0;
    tw.eyeMsgCharIndex = 0;
    tw.eyeMsgSelectMode = 'charset';
    tw.eyeMsgCharRotationNum = 0;
    tw.eyeMsgInterval = null;

    tw.eyeDialogOpen = false;
    tw.eyeDialogOptions;
    tw.eyeDialogOptionIndex = 0;
    tw.eyeDialogRotationNum = 0;
    tw.eyeDialogDefaultAction;

    await initLanguage();
}

export function updateSetting(settingName, settingValue) {
    settings[settingName] = settingValue;

    if (localStorageSettings.includes(settingName)) {
        localStorage.setItem(storageKey(settingName), settingValue);
    }
}
