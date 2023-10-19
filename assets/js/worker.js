// Import external scripts here
importScripts("./numjs.min.js", "./providers.js");

self.onmessage = function (e) {
    var t0 = performance.now();

    var data = e.data;

    var xlim = data.fundRange;
    var xstep = data.fundStep;
    var ylim = data.stockRange;
    var ystep = data.stockStep;
    var Nf = data.fundTrans;
    var Ns = data.stockTrans;

    // PROCESS DATA HERE
    var labels = ["HL", "AJB", "BARC", "FID", "II", "MIN"]
    var providers = [HL, AJB, BARC, FID, II, MIN]

    // Create template for provider value matrix
    var templateZ = {}
    for (var provider of labels) {
        templateZ[provider] = [];
    }

    var zPts = JSON.parse(JSON.stringify(templateZ));
    var xPts = [];
    var yPts = [];

    for (x = 0; x <= xlim; x += xstep) {
        let zTemp = JSON.parse(JSON.stringify(templateZ));
        let yTemp = [];
        let xTemp = [];
        for (y = 0; y <= ylim; y += ystep) {
            xTemp.push(x);
            yTemp.push(y);
            for (let [i, provider] of providers.entries()) {
                zTemp[labels[i]].push(provider(x, y, Nf, Ns));
            }
        }
        xPts.push(xTemp);
        yPts.push(yTemp);
        for (let [i, provider] of providers.entries()) {
            zPts[labels[i]].push(zTemp[labels[i]]);
        }
    }


    var result = [xPts, yPts, zPts];

    var t1 = performance.now();
    console.log("Processing took " + (t1 - t0) + " milliseconds.");
    self.postMessage(result);
}
