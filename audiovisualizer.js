let fft;

if (_URL.searchParams.has("loadVisualizer")) {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    const audioContext = new AudioContext();

    const fftBufferSize = 256;

    const audioSource = audioContext.createMediaElementSource(mainAudioElement);
    const audioProcessor = audioContext.createScriptProcessor(null, 2, 2);

    audioProcessor.addEventListener("audioprocess", processAudio);

    audioSource.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);

    fft = new FFT(fftBufferSize, 1);


    /**
     * @param {AudioProcessingEvent} e 
     */
    function processAudio(e) {
        let inputArrayL = e.inputBuffer.getChannelData(0);
        let inputArrayR = e.inputBuffer.getChannelData(1);
        let outputArrayL = e.outputBuffer.getChannelData(0);
        let outputArrayR = e.outputBuffer.getChannelData(1);
        let data = [];
        for (let i = 0; i < inputArrayL.length; ++i) {
            outputArrayL[i] = inputArrayL[i];
            outputArrayR[i] = inputArrayR[i];
            data[i] = (inputArrayL[i] + inputArrayR[i]) / 2;
        }

        fft.forward(data.slice(0, fftBufferSize));
    }


    function getAvgSpectrum() {
        const spectrum = [];
        let ray = 0;
        for (let i = 0, fftLen = (fft.spectrum.length / 16); i < fftLen; i++) {
            for (let j = 0; j < 16; j++) {
                ray += fft.spectrum[i * 16 + j];
            }
            ray /= 16;
            spectrum.push(ray);
        }
        return spectrum;
    }

    const visualizerWrapper = document.querySelector("#visualizerWrapper");

    /** @type {Array<HTMLSpanElement>} */
    const visualizerBars = [];

    for (let i = 0; i < 32; i++) {
        const bar = document.createElement("span");
        bar.classList.add("visualizerBar");
        visualizerWrapper.appendChild(bar);
        visualizerBars.push(bar);
    }

    function visualize() {
        for (let i = 0; i < 32; i++) {

            const value = fft.spectrum[i];
            const barElement = visualizerBars[i];

            const height = Math.min(value * 500, 100);
            barElement.setAttribute("style", `height: ${height}px; background-color: hsl(305, ${53+(Math.min(height,15))}%, ${55+(Math.min(height,30))}%); box-shadow: 0px 0px ${height}px black;`);

        }

    }

    setInterval(() => {
        requestAnimationFrame(visualize);
    }, 1000 / 30)
}