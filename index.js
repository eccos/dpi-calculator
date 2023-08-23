if (!document.querySelector) {
    alert("Your browser does not support the basic DOM API, sorry.");
}

const linkData = [
    [1280, 720, "HDTV, 720p"],
    [1366, 768, "HD"],
    [1600, 900, "HD+, 900p"],
    [1680, 945, "WXGA++"],
    [1920, 1080, "HDTV 1080, FullHD, 1080p"],
    [2560, 1440, "WQHD, 1440p"],
    [3840, 2160, "QFHD, 4K, UltraHD, UHD-1"],
    [5120, 2880, "5K"],
    [7680, 4320, "8K UHD, UHD-2"],
    [1680, 1050, "WSXGA+"],
    [1920, 1200, "WUXGA"],
    [2560, 1600, "WQXGA"],
    [3840, 2400, "WQUXGA"],
    [3200, 1600, "QHD+"],
    [2560, 1080, "UW-UXGA"],
    [3440, 1440, "UW-QHD"],
    [3840, 1600, "UW-QHD+"],
    [4096, 2160, "DCI 4K"]
];

const inpWReso = document.querySelector("#hor");
const inpHReso = document.querySelector("#vert");
const inpDiagReso = document.querySelector("#diag");

inpWReso.addEventListener("keyup", onEnter);
inpHReso.addEventListener("keyup", onEnter);
inpDiagReso.addEventListener("keyup", onEnter);
inpWReso.addEventListener("change", updateDisplayCalcs);
inpHReso.addEventListener("change", updateDisplayCalcs);
inpDiagReso.addEventListener("change", updateDisplayCalcs);

function onEnter(e) {
    if (e.key == "Enter") {
        savePpiResult();
    }
}

const divPpiResult = document.querySelector("#result");
const btnSave = document.querySelector("#save");
const ulSavedPpiResults = document.querySelector("#saved");

btnSave.addEventListener("click", () => {
    const li = document.createElement("li");
    const ppiResult = document.createTextNode(divPpiResult.textContent);
    li.appendChild(ppiResult);
    ulSavedPpiResults.appendChild(li);
});

function setMonitorData(w, h, diag) {
    if (w) inpWReso.value = Number.parseInt(w);
    if (h) inpHReso.value = Number.parseInt(h);
    if (diag) inpDiagReso.value = Number.parseInt(diag);
    updateDisplayCalcs();
}

function updateDisplayCalcs() {
    const w = Number(inpWReso.value);
    const h = Number(inpHReso.value);
    const diag = Number(inpDiagReso.value);
    if (h <= 0 || w <= 0) return;
    const result = calcDpi(w, h, diag);
    // document.querySelector("#metricdiag").textContent = `${roundHundredth(result.metricdiag)} cm`;
    document.querySelector("#result").innerHTML = `${w}x${h} ${diag}in at
    <span title="Y: ${roundHundredth(result.hPpi)}">${roundHundredth(result.wPpi)}</span>
    <abbr title="pixels per inch">PPI</abbr>`;
    document.querySelector("#mpix").textContent = calcMegapixels(w, h);
    document.querySelector("#aspect").textContent = calcAspectRatio(w, h);
}

function calcDpi(w, h, diag) {
    const ratio = h / w;
    const wd = Math.sqrt(Math.pow(diag, 2) / (1 + Math.pow(ratio, 2)));
    const hd = wd * ratio;
    const pitch = 25.4 / (w / wd); // metric
    const result = {
        metricDiag: 2.54 * diag,
        sizeW: wd,
        sizeH: hd,
        area: wd * hd,
        metricSizeW: 2.54 * wd,
        metricSizeH: 2.54 * hd,
        metricArea: 2.54 * 2.54 * wd * hd,
        wPpi: w / wd,
        hPpi: h / hd,
        dotPitch: pitch,
        sqPpi: w / wd * h / hd
    };
    return result;
}

function roundHundredth(i) {
    const res = Math.round(i * 100) / 100;
    return res;
}

function calcMegapixels(w, h) {
    return roundHundredth(w * h / 1000000);
}

function calcAspectRatio(w, h) {
    // common aspect ratios (car)
    const car = {
        "3:4": 3 / 4,
        "1:1": 1,
        "5:4": 5 / 4,
        "4:3": 4 / 3,
        "IMAX 1.43:1": 1.43,
        "3:2": 3 / 2,
        "5:3": 5 / 3,
        "14:9": 14 / 9,
        "16:10": 16 / 10,
        "16:9": 16 / 9,
        "17:9": 17 / 9,
        "21:9": 21 / 9,
        "Academy ratio 1.375:1": 1.375,
        "CinemaScope 2.35:1": 2.35,
        "Cinemara 2.59:1": 2.59,
        "Ultra Panavision 70 2.75:1": 2.75,
        "MGM 65 2.76:1": 2.76,
    };
    const ratio = w / h;

    for (const ratioName in car) {
        const commonRatio = car[ratioName];
        // 1.6% error margin is ok
        if (Math.abs(commonRatio / ratio - 1) < 0.016)
            return ratioName;
    }
    // unknown aspect ratio
    if (w > h)
        // "1.xx:1"
        return `${roundHundredth(w / h)}:1`;
    return `1:${roundHundredth(h / w)}`;
}

function genLink(linkData) {
    const [w, h, desc] = linkData;
    const a = document.createElement("a");
    a.textContent = `${w}x${h}`;
    a.href = "#";
    a.addEventListener("click", () => {
        setMonitorData(w, h);
    });

    const ul = document.querySelector("#mylist");
    const aspectRatio = calcAspectRatio(w, h);

    const li = document.createElement("li");
    li.textContent = ` (${aspectRatio}) ${desc}`;
    li.insertBefore(a, li.firstChild);

    ul.appendChild(li);
}

setMonitorData(
    window.devicePixelRatio
        ? window.devicePixelRatio * screen.width
        : screen.width,
    window.devicePixelRatio
        ? window.devicePixelRatio * screen.height
        : screen.height
);
linkData.forEach(genLink);
