function round2(i) {
    return Math.round(i * 100) / 100;
}

function calc_dpi(x, y, diag) {
    var ratio = y / x;
    var xd = Math.sqrt(Math.pow(diag, 2) / (1 + Math.pow(ratio, 2)));
    var yd = xd * ratio;
    var pitch = 25.4 / (x / xd); // metric
    var result = {
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
    var x = document.getElementById('hor').value;
    var y = document.getElementById('vert').value;
    var diag = document.getElementById('diag').value;
    if (y == 0 || x == 0) return;
    var result = calc_dpi(x, y, diag);
    document.getElementById('metricdiag').firstChild.data = round2(result.metricdiag);
    document.getElementById('result').innerHTML =
        'Display size: ' + round2(result.sizex) + '" &times; ' + round2(result.sizey) + '" = ' +
        round2(result.area) + 'in&sup2; (' +
        round2(result.metricsizex) + 'cm &times; ' + round2(result.metricsizey) + 'cm = ' +
        round2(result.metricarea) + 'cm&sup2;) at ' +
        '<span title="Y: ' + round2(result.yppi) + '">' + round2(result.xppi) + '</span>' +
        ' <abbr title="pixels per inch">PPI</abbr>, ' +
        Math.round(result.dotpitch * 10000) / 10000 +
        'mm <a href="https://en.wikipedia.org/wiki/Dot_pitch">dot pitch</a>, ' +
        Math.round(result.sqppi) +
        ' <abbr title="pixels per square inch">PPI&sup2;</abbr>';
    document.getElementById('aspect').firstChild.data = aspect_ratio(x, y);
    document.getElementById('mpix').firstChild.data = in_megapixels(x, y);
}

function in_megapixels(x, y) {
    return round2(x * y / 1000000);
}

function aspect_ratio(x, y) {
    var car = { // common aspect ratios we recognize
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
        //		"Academy ratio 1.375:1" : 1.375,
        //		"CinemaScope 2.35:1" : 2.35,
        //		"Cinemara 2.59:1" : 2.59,
        //		"Ultra Panavision 70 2.75:1" : 2.75,
        //		"MGM 65 2.76:1" : 2.76,
    };
    var ratio = x / y;
    for (ratio_name in car) {
        var r2 = car[ratio_name];
        if (Math.abs(r2 / ratio - 1) < 0.016)  // 1.6% error margin is ok
            return ratio_name;
    }
    // this aspect ratio is unknown.
    if (x - 0 > y - 0) // "1.xx:1"
        return round2(x / y) + ":1";
    else
        return "1:" + round2(y / x);
}

function set_mon(x, y, diag) {
    if (x)
        document.getElementById('hor').value = x;
    if (y)
        document.getElementById('vert').value = y;
    if (diag)
        document.getElementById('diag').value = diag;
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
    var r, g, b;
    var i;
    var f, p, q, t;

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
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)];
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

        default: // case 5:
            r = v;
            g = p;
            b = q;
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)];
}

function gen_links() {
    var data = [
        [480, 320, 3.5, "Apple iPhone"],
        [720, 720, 3.1, "Blackberry Q5"],
        [800, 240, 3.53, "Nintendo 3DS (3D)"],
        [800, 480, 3, "Toshiba Port&eacute;g&eacute; G900"],
        [800, 600, 6, "Sony Libri&eacute;"],
        [854, 480, 3.7, "<a href='https://en.wikipedia.org/wiki/Motorola_Droid'>Motorola Droid</a>"],
        [960, 544, 5, "Sony PS Vita"],
        [960, 640, 3.5, "Apple iPhone 4/4S"],
        [1024, 600, 5.6, "Panasonic Toughbook CF-U1"],
        [1024, 600, 10.1, "Netbooks"],
        [1024, 768, 6.4, "Sony PCG-U1"],
        [1024, 768, 7.9, "Apple iPad Mini"],
        [1024, 768, 8.1, "iRex iLiad"],
        [1024, 768, 9.7, "Apple iPad (2010)"],
        [1136, 640, 4, "Apple iPhone 5/5S/SE"],
        [1280, 720, 4.3, "Sony Xperia S"],
        [1280, 720, 6.2, "Nintendo Switch"],
        [1280, 800, 5.3, "Samsung Galaxy Note"],
        [1280, 800, 7, "Oculus Rift DK1"],
        [1280, 800, 12, ""],
        [1280, 800, 13.3, "Sharp Mebius MW70J"],
        [1200, 825, 9.7, "Kindle DX"],
        [1200, 900, 7.5, "OLPC XO-1 (b/w mode)"],
        [1280, 1024, 0.61, "<a href='http://www.imaging-resource.com/news/2012/01/27/new-evf-makes-it-clear-the-optical-viewfinders-days-are-numbered'>MicroOLED microdisplay</a>"],
        [1334, 750, 4.7, "Apple iPhone 6/6S/7/8"],
        [1360, 768, 11.1, "Asus S6F"],
        [1366, 768, 11.6, "Apple MacBook Air 11&quot;"],
        [1366, 768, 15.6, ""],
        [1400, 1050, 12, "Toshiba Portege M200"],
        [1440, 900, 13.3, "Lenovo Thinkpad X300"],
        [1440, 900, 19, ""],
        [1440, 960, 15.2, "Apple PowerBook G4"],
        [1440, 1440, 4.5, "BlackBerry Passport"],
        [1600, 768, 8, "Sony Vaio P-Series"],
        [1600, 900, 13.1, "Sony Vaio VGN-Z11WN/B"],
        [1600, 900, 17.3, ""],
        [1620, 1080, 4.5, "BlackBerry KEYone"],
        [1680, 945, 18.4, "Sony Vaio VGN-AW11M/H"],
        [1680, 1050, 15.4, "Sony Vaio FS92"],
        [1792, 768, 14.4, "Toshiba Satellite U840W"],
        [1872, 1404, 10.3, "reMarkable"],
        [1920, 1080, 0.74, "<a href='http://www.siliconmicrodisplay.com/st1080.html'>Silicon Micro Display ST1080</a>"],
        [1920, 1080, 4.7, "HTC One"],
        [1920, 1080, 5.5, "Apple iPhone 6 Plus"],
        [1920, 1080, 5.7, "Playstation VR"],
        [1920, 1080, 11.6, "Asus Zenbook UX21A"],
        [1920, 1152, 10.1, "Lenovo IdeaTab K2"],
        [1920, 1200, 7, "Google Nexus 7 (2013)"],
        [1920, 1200, 10.1, "Acer Iconia Tab A700"],
        [1920, 1200, 15.4, "IBM Thinkpad T61p"],
        [1920, 1200, 24, ""],
        [1920, 1920, 26.5, "Eizo EV2730Q"],
        [2040, 1080, 6.4, "Xiaomi Mi MIX"],
        [2048, 1152, 23, "Samsung 2343BW"],
        [2048, 1536, 0.83, "Forth Dimension QXGA-R9"],
        [2048, 1536, 7.9, "iPad mini w/ Retina display"],
        [2048, 1536, 9.7, "iPad (3rd gen.)"],
        [2048, 1536, 15, "NEC Versa Pro NX VA20S/AE"],
        [2048, 1536, 20.8, "Iiyama ProLite H530-B"],
        [2048, 2048, 1, "<a href='http://www.kopin.com/investors/news-events/press-releases/press-release-details/2017/Kopin-Debuts-Lightning-OLED-Microdisplay-With-2k-x-2k-Resolution-for-Mobile-VR-at-2017-CES/default.aspx'>Kopin Lightning</a>"],
        [2160, 1080, 5.5, "LG Q6"],
        [2200, 1650, 13.3, "Sony DPT-RP1"],
        [2224, 1668, 10.5, "Apple iPad Pro 10.5&quot;"],
        [2304, 1440, 12, "Apple MacBook"],
        [2400, 1600, 12.3, "Google Pixelbook"],
        [2436, 1125, 5.8, "Apple iPhone X"],
        [2560, 1080, 25, "LG 25UM65-P"],
        [2560, 1312, 5.71, "Essential PH-1"],
        [2560, 1440, 5.1, "Samsung Galaxy S6/S7"],
        [2560, 1440, 11.6, "Dell XPS 11"],
        [2560, 1440, 27, "Apple iMac 27"],
        [2560, 1536, 5.5, "Meizu MX4G"],
        [2560, 1600, 5.6, "Samsung Galaxy Note Edge"],
        [2560, 1600, 8.9, "Kindle Fire HDX 8.9"],
        [2560, 1600, 10.055, "Google Nexus 10"],
        [2560, 1600, 13.3, "Apple Retina MacBook Pro 13&quot;"],
        [2560, 1700, 12.85, "Chromebook Pixel"],
        [2560, 1600, 30, ""],
        [2560, 1800, 10.2, "Google Pixel C"],
        [2560, 2048, 20.1, "<a href='http://www.necdisplay.com/p/medical%20-diagnostic%20-displays/md205mg-1?type=support'>NEC MD205MG-1</a>"],
        [2732, 2048, 12.9, "Apple iPad Pro 12.9&quot;"],
        [2736, 1824, 12.3, "Microsoft Surface Pro 4"],
        [2880, 1440, 5.7, "LG G6"],
        [2880, 1620, 15.6, "ASUS UX51VZ"],
        [2880, 1800, 15.4, "Apple Retina MacBook Pro 15&quot;"],
        [2960, 1440, 5.8, "Samsung Galaxy S8"],
        [2960, 1440, 6.2, "Samsung Galaxy S8+"],
        [3000, 2000, 13.5, "Microsoft Surface Book"],
        [3120, 1440, 6.1, "LG G7"],
        [3200, 1800, 13.3, "Samsung Ativ Q"],
        [3280, 2048, 30, "NEC MD MD302C6"],
        [3440, 1440, 29, "LG UM95"],
        [3840, 1600, 37.5, "Acer XR382CQK"],
        [3840, 2160, 5.5, "Sony Z5 Premium"],
        [3840, 2160, 15.6, ""],
        [3840, 2160, 23.6, "Acer K242HQKbmjdp"],
        [3840, 2160, 28, "Lenovo ThinkVision 28"],
        [3840, 2160, 31.5, "Asus PQ321"],
        [3840, 2400, 22.2, "<a href='https://en.wikipedia.org/wiki/IBM_T220/T221_LCD_monitors#IBM_T221'>IBM T221</a>"],
        [3840, 2560, 20, "Panasonic Toughpad 4K UT-MB4"],
        [4096, 2160, 31, "LG 31MU95"],
        [4096, 2160, 36.4, "<a href='http://www.eizo.com/na/products/duravision/fdh3601/'>Eizo FDH3601</a>"],
        [4096, 2304, 21.5, "Retina iMac 21.5&quot;"],
        [5120, 2160, 34, "LG 34WK95U"],
        [5120, 2880, 27, "Dell UP2715K, Retina iMac 27&quot;"],
        [7680, 4320, 17.3, "JDI LCD prototype"],
        [7680, 4320, 31.5, "Dell UP3218K"],
        [7680, 4320, 70, "Sharp Aquos 8K LC-70X500"],
        [10240, 4320, 82, "Boe LCD prototype"]
    ];
    for (var i = 0; i < data.length; i++) {
        var t = document.createTextNode(data[i][0] + "x" + data[i][1] + " @ " + data[i][2]);
        var a = document.createElement('a');
        a.appendChild(t);
        a.href = "javascript:set_mon(" + data[i][0] + "," + data[i][1] + "," + data[i][2] + ")";
        a.style.backgroundColor = link_color(data[i][0], data[i][1], data[i][2]);

        var li = document.createElement('li');
        li.innerHTML = " " + data[i][3];
        li.insertBefore(a, li.firstChild);

        var ul = document.getElementById("mylist");
        ul.appendChild(li);

    }
}

function link_color(x, y, d) {
    var result = calc_dpi(x, y, d);
    var size_factor = Math.max(1, 1 + ((d - 4) / 19)); // factor in the display size (4=1 80=5)
    result.xppi *= size_factor;
    // green = 100dpi or lower, red = 320dpi or higher
    // hsv 120,                hsv -60
    // 150 to 390 (-30)
    var hsv = 150 - Math.min(180, Math.max(0, (result.xppi - 100) / (400 - 72) * 120));
    if (hsv < 0) hsv += 360;
    var c = hsvToRgb(hsv, 25, 100);
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
}

/* ]]> */