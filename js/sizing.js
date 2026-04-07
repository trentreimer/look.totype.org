export function setEyeMsgTextBoxHeight() {
    const m = document.getElementById('eye-msg-text');
    const t = m.textContent;

    m.textContent = '';
    m.style.height = 'calc(100% - 20px)'; // Revert to the original percentage based height;

    const h = m.getBoundingClientRect().height;

    m.style.height = h + 'px';
    m.textContent = t;
}

export function windowHeight() {
    return safari ? document.body.getBoundingClientRect().height : window.innerHeight;
}

export function windowWidth() {
    return safari ? document.body.getBoundingClientRect().width : window.innerWidth;
}
