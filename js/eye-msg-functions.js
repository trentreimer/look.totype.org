import { settings, tw } from './settings.js';
import { setEyeMsgTextBoxHeight } from './sizing.js';
import { eyeDialog, selectEyeDialogValue } from './eye-dialogs.js';
import { eyeFollower } from './eye-follower.js';
import { showMessage, hideMessage } from './messages.js';

export function setUpEyeMsg(proceed = true) {
    try { webgazer.clearGazeListener(); } catch (error) { console.log(error); }
    try { clearInterval(tw.eyeMsgInterval); } catch (error) { console.log(error); }

    tw.eyeMsgCharsetIndex = 0;
    tw.eyeMsgCharIndex = 0;
    tw.eyeMsgSelectMode = 'charset';
    tw.eyeMsgCharRotationNum = 0;
    tw.eyeMsgInterval = null;

    tw.eyeMsgChars = [];
    for (const charset of settings.keyboard) tw.eyeMsgChars.push(charset);

    const u = document.createElement('div');

    let html = '<div class="eye-msg-charset-group">';

    for (let i = 0; i < tw.eyeMsgChars.length; i ++) {
        html += '<div class="eye-msg-charset">';
        tw.eyeMsgChars[i].forEach(val => {
            u.innerHTML = val;
            const e = u.firstChild;
            html += '<span data-character="' + (typeof e.getAttribute === 'function' && e.getAttribute('data-character') ? e.getAttribute('data-character') : val) + '">' + val + '</span>';
        });
        html += '</div>';
    }

    html += '</div>';

    document.querySelector('#keyboard').innerHTML = html;
    u.remove();
    //console.log(html);

    setEyeMsgTextBoxHeight();

    setTimeout(function() {
        document.querySelector('#eye-msg-background').classList.remove('clear');
    }, 0);

    if (proceed) tw.eyeMsgInterval = setInterval(() => { setEyeMsgFocus(); }, settings.charRotationPause);
}

export function setEyeMsgFocus() {
    document.querySelectorAll('#keyboard .highlight').forEach(e => { e.classList.remove('highlight'); });

    const charsets = document.querySelectorAll('.eye-msg-charset');

    if (tw.eyeMsgCharsetIndex >= charsets.length) {
        tw.eyeMsgCharsetIndex = 0;
    } else if (tw.eyeMsgCharsetIndex === charsets.length - 1 && tw.eyeMsgSelectMode === 'charset') { // In the last row go straight to the characters
        tw.eyeMsgCharIndex = 0;
        tw.eyeMsgCharRotationNum = 0;
        tw.eyeMsgSelectMode = 'char';
    }

    if (tw.eyeMsgSelectMode === 'charset') {
        charsets[tw.eyeMsgCharsetIndex].classList.add('highlight');
        tw.eyeMsgCharsetIndex ++;

        tw.eyeMsgCharIndex = 0;
        tw.eyeMsgCharRotationNum = 0;
    } else { // character
        const chars = charsets[tw.eyeMsgCharsetIndex].querySelectorAll('span');

        if (tw.eyeMsgCharIndex >= chars.length) {
            tw.eyeMsgCharIndex = 0;
            tw.eyeMsgCharRotationNum ++;

            if (tw.eyeMsgCharRotationNum > 0) { // Revert to row selection
                tw.eyeMsgSelectMode = 'charset';
                tw.eyeMsgCharsetIndex = 0;
                return;
            }
        }

        chars[tw.eyeMsgCharIndex].classList.add('highlight');
        tw.eyeMsgCharIndex ++;
    }
}

export function startEyeMsg() {
    hideMessage();
    setUpEyeMsg();
    webgazer.setGazeListener(eyeFollower);

    document.querySelectorAll('#eye-msg-menu .start-stop').forEach(e => { e.setAttribute('data-action', 'stop'); });
}

export function stopEyeMsg() {
    try {
        clearInterval(tw.eyeMsgInterval);

        document.querySelectorAll('#keyboard .highlight').forEach(ee => { ee.classList.remove('highlight'); });
        document.querySelectorAll('#eye-msg-menu .start-stop').forEach(e => { e.setAttribute('data-action', 'start'); });
        document.querySelectorAll('#keyboard [data-character="🛑"], #keyboard [data-character="Stop"], #keyboard [data-character="Done"]').forEach(e => { e.classList.add('highlight'); });

        webgazer.clearGazeListener();
    } catch (error) {
        console.log(error);
    }
}

export function hideEyeMsg() {
    if (tw.eyeMsgInterval) {
        clearInterval(tw.eyeMsgInterval);
        tw.eyeMsgInterval = null;
    }

    try { webgazer.clearGazeListener(); } catch (error) {};
    document.querySelectorAll('#eye-msg-background, #eye-msg-select').forEach(e => { e.remove(); });
}

export function selectEyeMsgValue() {
    if (tw.eyeDialogOpen) {
        tw.lastSelectedValueIsWord = false;
        return selectEyeDialogValue();
    }

    const highlighted = document.querySelector('#keyboard .highlight');

    if (highlighted) {
        highlighted.classList.remove('highlight');
        clearInterval(tw.eyeMsgInterval);
        tw.eyeMsgInterval = null;

        const c = highlighted.getAttribute('data-character');

        if (c) document.querySelectorAll('#keyboard .eye-msg-charset-group.autosuggest').forEach(e => e.remove());

        if (['Pause', '⏸', '⏯︎'].includes(c)) {
            tw.lastSelectedValueIsWord = false;
            highlighted.classList.add('highlight');
            tw.eyeMsgPaused = true;

            tw.eyeMsgSelectMode = 'charset';
            tw.eyeMsgCharsetIndex = 0;

            return;
        } else if (['Stop', 'Done', '🛑'].includes(c)) {
            tw.lastSelectedValueIsWord = false;
            //highlighted.classList.add('highlight');
            // Fire the dialog
            eyeDialog('stop-dialog');
            return;
        } else if (['Clear', 'Reset', 'Empty', 'NewMsg', '🗑'].includes(c)) {
            tw.lastSelectedValueIsWord = false;
            eyeDialog('empty-dialog');
            return;
        }

        if (!c && tw.eyeMsgSelectMode === 'charset') {
            tw.eyeMsgSelectMode = 'char';
            tw.eyeMsgCharIndex = 0;
            tw.eyeMsgCharsetIndex = tw.eyeMsgCharsetIndex - 1;
            if (tw.eyeMsgCharsetIndex < 0) tw.eyeMsgCharsetIndex = document.querySelectorAll('.eye-msg-charset').length - 1;
        } else if (c) { // Character select mode
            const m = document.getElementById('eye-msg-text');
            const text = m.textContent;

            if (['⌫', '«', '<'].includes(c)) {
                tw.lastSelectedValueIsWord = false;

                if (/\W$/.test(text)) {
                    m.textContent = text.replace(/\W$/, '');
                } else {
                    m.textContent = text.replace(/.$/, '');
                }
            } else if (['_', '␣'].includes(c)) {
                tw.lastSelectedValueIsWord = false;
                m.textContent = text + ' ';
            } else if (['Clear', 'Reset', 'Empty', 'NewMsg', '🗑'].includes(c)) {
                tw.lastSelectedValueIsWord = false;
                m.textContent = '';
            } else if (['↵'].includes(c)) {
                tw.lastSelectedValueIsWord = false;
                m.textContent = text + "\n\n";
            } else {
                if (c.length > 1) { // This is an autocompletion selection
                    tw.lastSelectedValueIsWord = true;
                    let partWordLength = c.length;
                    let wordMatch = false;

                    while (partWordLength > 0) {
                        const matchString = c.substring(0, partWordLength);

                        if (text.substring(text.length - partWordLength) == matchString) {
                            wordMatch = true;
                            m.textContent = text + c.substring(partWordLength) + ' ';
                            break;
                        } else {
                            partWordLength --;
                        }
                    }

                    if (!wordMatch) {
                        m.textContent = text + c + ' ';
                    }
                } else {
                    if (['.', '?', ',', '!', ':', ';'].includes(c)) {
                        if (tw.lastSelectedValueIsWord && text.substring(text.length - 1) == ' ') {
                            // Move the trailing space after this character
                            m.textContent = text.substring(0, text.length - 1) + c + ' ';
                        } else {
                            m.textContent = text + c + ' ';
                        }
                    } else {
                        const newText = text + c;
                        m.textContent = newText;

                        if (/[A-Z|']/.test(c)) { // Show suggestions
                            const lastWord = newText.match(/[A-Z|']+$/);

                            if (lastWord) {
                                //console.log(lastWord[0]);
                                const firstLetter = lastWord[0].charAt(0);
                                //console.log(firstLetter);
                                if (settings.autocompleteLibrary[firstLetter]) {
                                    const suggestions = [];

                                    for (const suggestion of settings.autocompleteLibrary[firstLetter]) {
                                        if (suggestion.substring(0, lastWord[0].length) == lastWord && suggestions.length < 6) {
                                            suggestions.push(suggestion);
                                        }
                                    }

                                    if (suggestions.length > 0) {
                                        let html = '<div class="eye-msg-charset-group autosuggest">';

                                        for (const suggestion of suggestions) {
                                            html += `<div class="eye-msg-charset autosuggest" data-character="${suggestion}"><span data-character="${suggestion}">${suggestion}</span></div>`;
                                        }

                                        html += '</div>';

                                        document.querySelector('#keyboard').insertAdjacentHTML('beforeend', html);
                                    }
                                }
                            }
                        }
                    }

                    tw.lastSelectedValueIsWord = false;
                }
            }

            m.scrollTop = m.scrollHeight;

            tw.eyeMsgSelectMode = 'charset';
            tw.eyeMsgCharsetIndex = 0;
        }

    }

    tw.eyeMsgInterval = setInterval(setEyeMsgFocus, settings.charRotationPause);
}
