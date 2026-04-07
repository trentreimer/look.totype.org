import { settings, tw } from './settings.js';
import { setEyeMsgFocus, selectEyeMsgValue } from './eye-msg-functions.js';

let eyePosition, eyePositionStartTime, eyeCursorMove;

export function eyeFollower(data, clock) {
    if (!data) return;

    let pos;

    // Set the right-side / left-side demarcator
    let rightSide;
    {
        const rect = document.getElementById('eye-msg-space').getBoundingClientRect();

        if (rect.width < window.innerWidth) {
            rightSide = rect.right * 0.85;
        } else {
            rightSide = rect.right * 0.75;
        }
    }

    if (data.x < rightSide) {
        pos = 'left';
    } else {
        pos = 'right';
    }

    if (pos === 'right') {
        document.getElementById('eye-msg-select').classList.add('viewed');
    } else {
        document.getElementById('eye-msg-select').classList.remove('viewed');
    }

    // Times are in milliseconds
    const positionWait = 200;
    const unpauseWait = 500;

    if (pos !== eyePosition) {
        eyePositionStartTime = clock;
        eyePosition = pos;
    } else if (['right', 'left'].includes(pos) && clock - eyePositionStartTime > positionWait) {
        if (pos === 'right') {
            clearInterval(tw.eyeMsgInterval);
            tw.eyeMsgInterval = null;
            eyeCursorMove = 'right';
        } else if (pos === 'left' && eyeCursorMove === 'right') {
            eyeCursorMove = null;

            if (tw.eyeMsgPaused) {
                tw.eyeMsgPaused = false;
                document.querySelectorAll('#keyboard .highlight').forEach(e => { e.classList.remove('highlight'); });
                tw.eyeMsgInterval = setInterval(setEyeMsgFocus, settings.charRotationPause);
                return;
            } else {
                selectEyeMsgValue();
            }
        }
    }
}
