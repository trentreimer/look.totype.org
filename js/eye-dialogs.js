import { settings, tw } from './settings.js';
import { startEyeMsg, stopEyeMsg } from './eye-msg-functions.js';

let eyeDialogOptions;
let eyeDialogOptionIndex = 0;
let eyeDialogRotationNum = 0;
let eyeDialogDefaultAction;

export function eyeDialog(dialogId, readingTimeout = 1000, defaultAction = 'resume') {
    const d = document.getElementById(dialogId);

    if (d && !tw.eyeDialogOpen) {
        tw.eyeDialogOpen = true;
        clearInterval(tw.eyeMsgInterval);

        document.querySelector('#eye-msg-panel').appendChild(d);

        eyeDialogOptions = d.querySelectorAll('.eye-dialog-option');
        eyeDialogOptionIndex = 0;
        eyeDialogRotationNum = 1;
        eyeDialogDefaultAction = defaultAction;

        if (eyeDialogOptions.length > 0) {
            setTimeout(function() {
                tw.eyeMsgInterval = setInterval(function() {
                    setEyeDialogFocus();
                }, settings.charRotationPause + 500);
            }, readingTimeout);
        }
    }

    return null;
}

export function setEyeDialogFocus() {
    eyeDialogOptions.forEach(e => {
        e.classList.remove('highlight');
    });

    if (eyeDialogOptionIndex >= eyeDialogOptions.length) {
        eyeDialogRotationNum ++;
        eyeDialogOptionIndex = 0;

        if (eyeDialogRotationNum > 2) { // After two rotations through the options just fire the default action.
            eyeDialogAction(eyeDialogDefaultAction);
            return;
        }
    }

    eyeDialogOptions[eyeDialogOptionIndex].classList.add('highlight');
    eyeDialogOptionIndex ++;
}

export function selectEyeDialogValue() {
    const highlighted = document.querySelector('#eye-msg-panel .eye-dialog-option.highlight');

    if (highlighted) {
        const action = typeof highlighted.getAttribute === 'function' && highlighted.getAttribute('data-action') ? highlighted.getAttribute('data-action') : null;
        eyeDialogAction(action);
    }
}

export function eyeDialogAction(action = 'resume') {
    closeEyeDialog();

    if (action === 'stop') {
        stopEyeMsg();
    } else if (action === 'empty') {
        document.getElementById('eye-msg-text').textContent = '';
        startEyeMsg();
    } else { // The default action is 'resume'
        startEyeMsg();
    }
}

export function closeEyeDialog() {
    tw.eyeDialogOpen = false;
    clearInterval(tw.eyeMsgInterval);

    document.querySelectorAll('#eye-msg-panel .eye-dialog').forEach(e => {
        document.body.appendChild(e);
        e.querySelectorAll('.highlight').forEach(ee => {
            ee.classList.remove('highlight');
        });
    });
}
