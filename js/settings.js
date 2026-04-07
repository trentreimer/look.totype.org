import { languages } from './languages.js';
import { setLanguage, initLanguage } from './language-settings.js';
import { setUpEyeMsg } from './eye-msg-functions.js';

export const settings = {};
export const tw = {}; // Typewriter properties

export async function initSettings() {
    settings.charRotationPause = parseInt(localStorage.getItem('charRotationPause')) >= 750 ? parseInt(localStorage.getItem('charRotationPause')) : 1500;

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

    const localStorageSettings = ['longBlinkTime', 'charRotationPause'];

    if (localStorageSettings.includes(settingName)) {
        localStorage.setItem(settingName, settingValue);
    }
}
