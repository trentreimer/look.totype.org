export function copyText() {
    const m = document.getElementById('eye-msg-text');
    const r = document.createRange();
    const s = window.getSelection();

    r.selectNodeContents(m);
    s.removeAllRanges();
    s.addRange(r);

    navigator.clipboard.writeText(m.textContent.trim());
}

export function clearText() {
    document.getElementById('eye-msg-text').textContent = '';
}

export function cutText() {
    copyText();
    clearText();
}
