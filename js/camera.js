export function stopCamera() {
    try {
        const video = document.getElementById(webgazer.params.videoElementId);

        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => { track.stop(); });
        }

        webgazer.pause();
    } catch (err) {
        console.log(err);
    }
}

export async function startCamera() {
    try {
        const video = document.getElementById(webgazer.params.videoElementId);

        if (!video) return false;

        const track = video.srcObject && video.srcObject.getVideoTracks()[0];

        if (track && track.readyState === 'live') {
            await webgazer.resume();
            return true;
        }

        video.srcObject = await navigator.mediaDevices.getUserMedia(webgazer.params.camConstraints);
        await video.play();
        await webgazer.resume();

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
