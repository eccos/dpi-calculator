const inpHor = document.querySelector("#hor");
const inpVert = document.querySelector("#vert");
const inpDiag = document.querySelector("#diag");

inpHor.addEventListener("keyup", onKeyUp);
inpVert.addEventListener("keyup", onKeyUp);
inpDiag.addEventListener("keyup", onKeyUp);
inpHor.addEventListener("change", do_dpi);
inpVert.addEventListener("change", do_dpi);
inpDiag.addEventListener("change", do_dpi);

function onKeyUp(e) {
    if (e.key == "Enter") {
        remember();
    } else {
        do_dpi();
    }
}

const result = document.querySelector("#result");
const btnSave = document.querySelector("#save");
const savedContent = document.querySelector("#saved");

btnSave.addEventListener("click", remember);
function remember() {
    const li = document.createElement("li");
    li.appendChild(document.createTextNode(result.textContent));
    savedContent.appendChild(li);
}

setMonitorData(
    window.devicePixelRatio
        ? window.devicePixelRatio * screen.width
        : screen.width,
    window.devicePixelRatio
        ? window.devicePixelRatio * screen.height
        : screen.height
);
genLinks();

function round2(i) {
    return Math.round(i * 100) / 100;
}

function calc_dpi(x, y, diag) {
    const ratio = y / x;
    const xd = Math.sqrt(Math.pow(diag, 2) / (1 + Math.pow(ratio, 2)));
    const yd = xd * ratio;
    const pitch = 25.4 / (x / xd); // metric
    const result = {
        metricdiag: diag * 2.54,
        sizex: xd,
        sizey: yd,
        area: xd * yd,
        metricsizex: 2.54 * xd,
        metricsizey: 2.54 * yd,
        metricarea: xd * yd * 2.54 * 2.54,
        xppi: x / xd,
        yppi: y / yd,
        dotpitch: pitch,
        sqppi: x / xd * y / yd
    };
    return result;
}

function do_dpi() {
    if (!document.getElementById) {
        alert("Your browser does not support the basic DOM API, sorry.");
        return;
    }
    const x = inpHor.value;
    const y = inpVert.value;
    const diag = inpDiag.value;
    if (y == 0 || x == 0) return;
    const result = calc_dpi(x, y, diag);
    document.querySelector("#metricdiag").textContent = round2(result.metricdiag) + " cm";
    document.querySelector("#result").innerHTML =
        inpHor.value + "x" + inpVert.value + " " +
        inpDiag.value +
        "in at " +
        '<span title="Y: ' +
        round2(result.yppi) +
        '">' +
        round2(result.xppi) +
        "</span>" +
        ' <abbr title="pixels per inch">PPI</abbr>';
    document.querySelector("#aspect").firstChild.data = aspect_ratio(x, y);
    document.querySelector("#mpix").firstChild.data = in_megapixels(x, y);
}

function in_megapixels(x, y) {
    return round2(x * y / 1000000);
}

function aspect_ratio(x, y) {
    const car = {
        // common aspect ratios we recognize
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
        "21:9": 21 / 9
        //		"Academy ratio 1.375:1" : 1.375,
        //		"CinemaScope 2.35:1" : 2.35,
        //		"Cinemara 2.59:1" : 2.59,
        //		"Ultra Panavision 70 2.75:1" : 2.75,
        //		"MGM 65 2.76:1" : 2.76,
    };
    const ratio = x / y;
    for (ratio_name in car) {
        const r2 = car[ratio_name];
        if (Math.abs(r2 / ratio - 1) < 0.016)
            // 1.6% error margin is ok
            return ratio_name;
    }
    // this aspect ratio is unknown.
    if (x - 0 > y - 0)
        // "1.xx:1"
        return round2(x / y) + ":1";
    else return "1:" + round2(y / x);
}

function setMonitorData(w, h, diag) {
    if (w) inpHor.value = Number.parseInt(w);
    if (h) inpVert.value = Number.parseInt(h);
    if (diag) inpDiag.value = Number.parseInt(diag);
    do_dpi();
}

function genLinks() {
    const data = [
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

    for (const [w, h, desc] of data) {
        const textNode = document.createTextNode(`${w}x${h}`);
        const a = document.createElement("a");
        a.appendChild(textNode);
        a.href = "#";
        a.addEventListener("click", () => {
            setMonitorData(w, h);
        });

        const ul = document.querySelector("#mylist");
        const aspectRatio = aspect_ratio(w, h);

        const li = document.createElement("li");
        li.textContent = ` (${aspectRatio}) ${desc}`;
        li.insertBefore(a, li.firstChild);

        ul.appendChild(li);
    }
}