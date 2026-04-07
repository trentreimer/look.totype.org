import { showMessage, hideMessage } from './messages.js';
import { settings, tw, initSettings, updateSetting } from './settings.js';
import { copyText, clearText, cutText } from './text-functions.js';
import { eyeFollower } from './eye-follower.js';
import { startEyeMsg, stopEyeMsg } from './eye-msg-functions.js';

await initSettings();

/////////////////////////////////////////////////////////////
// You need a camera
let hasVideoDevice = false;

if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    window.location.href = 'index.html';
}

navigator.mediaDevices.enumerateDevices().then(devices => {
    devices.forEach(device => {
        if (device.kind === 'videoinput') hasVideoDevice = true;
    });

    if (!hasVideoDevice) {
        window.location.href = 'index.html';
    }
});
/////////////////////////////////////////////////////////////

message.classList.add('middle');
showMessage('<span class="blink">Loading eye-tracker...</span>');

//hideMessage(); setUpEyeMsg(false); return; // Just show the layout for development purposes

webgazer.showPredictionPoints(false);
webgazer.showFaceOverlay(false);
webgazer.removeMouseEventListeners();
webgazer.saveDataAcrossSessions(false);
webgazer.begin();

webgazer.setGazeListener(function() {
    webgazer.clearGazeListener();
    console.log('webgazer is ready');

    // webgazer is a heavy load. The system needs a little breather before proceeding.
    setTimeout(function() {
        calibrateWebgazer(function() { startEyeMsg(); });
    }, 1500);
});

// Calibrate buttons
message.addEventListener('click', event => {
    const calibrateButton = event.target.closest('.run-calibrate');

    if (calibrateButton) {
        calibrateWebgazer();
    }
});

/////////////////////////////////////////////////////////////////////
// Calibration

let numCalibrationClicks = 5;
let calibrationClickNum = 0;
//const calibrationZones = ['middle-left', 'middle-right'];
const calibrationZones = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
//const calibrationZones = ['top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left', 'top-left'];
let calibrationZoneIndex = 0;
let calibrationTargetMoveTime = 2000; // Time it takes target to move from one position to another in milliseconds
let calibrationTargetClickTime = 3000; // Time to dwell on one spot and fire clicks

const calibrationTarget = document.querySelector('#calibration-target');
const calibrationBackground = document.querySelector('#calibration-background');

let calibrationCallbackFunction;
let calibrationPrecheckStart = null;

const calibrationPrecheck = function() {
    const c = document.getElementById('webgazerVideoContainer');
    const b = document.getElementById('webgazerFaceFeedbackBox');

    const now = performance.now();

    if (c && b && b.style && b.style.borderColor && b.style.borderColor == 'green') {
        hideMessage();
        setTimeout(() => { startCalibration(); }, 0);
        calibrationPrecheckStart = null;
    } else {
        if (b && b.style && b.style.borderColor) {
            if (calibrationPrecheckStart === null) calibrationPrecheckStart = now;

            if (calibrationPrecheckStart <= now - 2000) {
                showMessage('Make sure the camera can see your eyes');
                if (b.style.borderColor == 'red') c.classList.add('error');
            }
        }

        setTimeout(() => { calibrationPrecheck() }, 1000);
    }
}

const calibrateWebgazer = function(callbackFunction = null) {
    calibrationCallbackFunction = callbackFunction;

    setTimeout(function() {
        webgazer.clearGazeListener();
        webgazer.clearData();
    }, 0);

    calibrationClickNum = 0;
    calibrationZoneIndex = -1; // Set to -1 to calibrate the centre position too.

    calibrationTarget.className = 'hidden';
    calibrationTarget.style.setProperty('--transition-time', calibrationTargetMoveTime + 'ms');

    calibrationBackground.classList.remove('hidden');
    document.querySelector('#message').classList.add('middle');

    calibrationPrecheck();
    //startCalibration();
}

const startCalibration = function() {
    document.getElementById('webgazerVideoContainer').classList.remove('error');

    showMessage('Watch the dot');

    // Show the calibration dot
    setTimeout(() => {
        hideMessage();
        calibrationTarget.className = message.classList.contains('middle') ? '' : 'top-center';
        //calibrationTarget.className = 'top-center';
        //document.querySelector('#message').classList.remove('middle');

        // Move the calibration dot to the first "click" point
        setTimeout(() => {
            if (calibrationZoneIndex == -1) {
                clickCalibrationTarget();
            } else {
                calibrationTarget.className = calibrationZones[calibrationZoneIndex];
                setTimeout(clickCalibrationTarget, calibrationTargetMoveTime + 500);
            }
        }, 1000);
    }, 2000);
}

const clickCalibrationTarget = function() {
    calibrationTarget.classList.add('calibrating');

    if (calibrationClickNum < numCalibrationClicks) {
        // Fire a "click"
        const bounds = calibrationTarget.getBoundingClientRect();
        const x = bounds.left + (bounds.width / 2);
        const y = bounds.top + (bounds.height / 2);

        webgazer.recordScreenPosition(x, y, 'click');

        calibrationClickNum ++;
        setTimeout(clickCalibrationTarget, Math.floor(calibrationTargetClickTime / numCalibrationClicks));
    } else {
        if (calibrationZoneIndex < calibrationZones.length - 1) {
            calibrationZoneIndex ++;
            calibrationClickNum = 0;
            calibrationTarget.className = calibrationZones[calibrationZoneIndex];

            setTimeout(clickCalibrationTarget, calibrationTargetMoveTime + 500);
        } else {
            // done
            calibrationTarget.className = 'hidden';
            calibrationBackground.classList.add('hidden');
            showMessage('Thank you!');

            sessionStorage.setItem('calibrated', Math.round(Date.now() / 1000));

            setTimeout(function() {
                hideMessage();
                document.querySelector('#message').classList.remove('middle');
            }, 1000);

            if (typeof calibrationCallbackFunction === 'function') {
                setTimeout(function() { calibrationCallbackFunction(); }, 1500);
            }
        }
    }
}
/////////////////////////////////////////////////////////////////////


// Hard-set the height so contents can scroll
import { setEyeMsgTextBoxHeight } from './sizing.js';

window.addEventListener('resize', function() {
    setEyeMsgTextBoxHeight();
});



///////////////////////////////////////////
// Menu listeners
document.querySelector('#eye-msg-menu .interval').value = Math.round(settings.charRotationPause / 100) / 10;

document.querySelector('#eye-msg-menu .interval').addEventListener('change', function() {
    settings.charRotationPause = this.value * 1000;
    localStorage.setItem('charRotationPause', settings.charRotationPause);

    // If the rotation is going make sure it uses the new setting.
    if (document.querySelector('#eye-msg-menu .start-stop[data-action="stop"]')) {
        startEyeMsg();
    }
});

document.querySelectorAll('#eye-msg-menu .quit').forEach(e => { e.addEventListener('click', function() {
    window.location.href = 'index.html';
})});

document.querySelectorAll('#eye-msg-menu .recalibrate').forEach(e => { e.addEventListener('click', function() {
    webgazer.clearGazeListener();
    clearInterval(tw.eyeMsgInterval);
    document.querySelectorAll('#keyboard .highlight').forEach(e => { e.classList.remove('highlight'); });

    calibrateWebgazer(function() {
        tw.eyeMsgCharsetIndex = 0;
        tw.eyeMsgCharIndex = 0;
        tw.eyeMsgSelectMode = 'charset';
        webgazer.setGazeListener(eyeFollower);
        tw.eyeMsgInterval = setInterval(setEyeMsgFocus, settings.charRotationPause);
    });
})});

document.querySelectorAll('#eye-msg-menu .start-stop').forEach(e => {
    e.addEventListener('click', function() {
        const a = this.getAttribute('data-action');

        if (a === 'stop') {
            stopEyeMsg();
        } else {
            startEyeMsg();
        }
    });
});

document.querySelectorAll('#eye-msg-background .copy-text').forEach(e => {
    e.addEventListener('click', copyText);
});
