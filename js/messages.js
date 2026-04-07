// Message area
const message = document.querySelector('#message');

export function showMessage(html = null) {
    if (html !== null) message.innerHTML = html;
    message.classList.remove('hidden');
};

export function hideMessage() {
    message.classList.add('hidden');
};

