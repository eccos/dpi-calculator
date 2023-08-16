const html = document.querySelector("html");
const themeOptions = document.querySelector("#theme-options");

themeOptions.addEventListener("click", (e) => {
    /** @type {HTMLButtonElement} */
    const btnSelectedOption = e.target;
    const theme = btnSelectedOption.getAttribute("data-bs-theme-value");
    // user indicates preference through OS setting (e.g. light or dark mode) or user agent setting
    const preferDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
    if (theme == "dark" || theme == "auto" && preferDarkTheme) {
        html.setAttribute("data-bs-theme", "dark");
    } else {
        html.setAttribute("data-bs-theme", "light");
    }

    /** @type {HTMLUListElement} */
    const ul = e.currentTarget;
    /** @type {HTMLCollection} */
    const liOptions = ul.children;
    for (let liOption of liOptions) {
        const btn = liOption.firstElementChild;
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
    }
    
    btnSelectedOption.classList.add("active");
    btnSelectedOption.setAttribute("aria-pressed", "true");
});
// input boxes
const inpHor = document.querySelector("#hor");
const inpVert = document.querySelector("#vert");
const inpDiag = document.querySelector("#diag");

// add events to input boxes
inpHor.addEventListener("keyup", onKeyUp);
inpVert.addEventListener("keyup", onKeyUp);
inpDiag.addEventListener("keyup", onKeyUp);
inpHor.addEventListener("change", do_dpi);
inpVert.addEventListener("change", do_dpi);
inpDiag.addEventListener("change", do_dpi);

// if key == "Enter", remember result, else calculate DPI/PPI
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
    //savedContent.innerHTML = savedContent.innerHTML + document.querySelector("#result").innerHTML + "<br>";
}

set_mon(
    window.devicePixelRatio
        ? window.devicePixelRatio * screen.width
        : screen.width,
    window.devicePixelRatio
        ? window.devicePixelRatio * screen.height
        : screen.height
);
gen_links();

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
    document.querySelector("#metricdiag").firstChild.data = round2(
        result.metricdiag
    );
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

function set_mon(x, y, diag) {
    if (x) inpHor.value = x;
    if (y) inpVert.value = y;
    if (diag) inpDiag.value = diag;
    do_dpi();
}

/**
 * HSV to RGB color conversion
 *
 * H runs from 0 to 360 degrees
 * S and V run from 0 to 100
 *
 * Ported from the excellent java algorithm by Eugene Vishnevsky at:
 * http://www.cs.rit.edu/~ncs/color/t_convert.html
 */
function hsvToRgb(h, s, v) {
    let r, g, b;
    let i;
    let f, p, q, t;

    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // that conversion here.
    s /= 100;
    v /= 100;

    if (s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch (i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        default:
            // case 5:
            r = v;
            g = p;
            b = q;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function gen_links() {
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
    let aspectRatioSection = "";

    for (let i = 0; i < data.length; i++) {
        const t = document.createTextNode(
            data[i][0] + "x" + data[i][1]
        );
        const a = document.createElement("a");
        a.appendChild(t);
        a.href = "#";
        const x = data[i][0];
        const y = data[i][1];
        a.addEventListener("click", function () {
            set_mon(x, y);
        });

        const ul = document.querySelector("#mylist");

        temp = aspect_ratio(x, y);
        // if (aspectRatioSection != temp) {
        //     aspectRatioSection = temp;

        //     const li = document.createElement("li");
        //     li.innerHTML = aspectRatioSection;
        //     ul.appendChild(li);
        // }

        const li = document.createElement("li");
        li.innerHTML = " (" + temp + ") " + data[i][2];
        li.insertBefore(a, li.firstChild);

        ul.appendChild(li);
    }
}

function link_color(x, y, d) {
    const result = calc_dpi(x, y, d);
    const size_factor = Math.max(1, 1 + (d - 4) / 19); // factor in the display size (4=1 80=5)
    result.xppi *= size_factor;
    // green = 100dpi or lower, red = 320dpi or higher
    // hsv 120,                hsv -60
    // 150 to 390 (-30)
    const hsv =
        150 - Math.min(180, Math.max(0, (result.xppi - 100) / (400 - 72) * 120));
    if (hsv < 0) hsv += 360;
    const c = hsvToRgb(hsv, 25, 100);
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
}