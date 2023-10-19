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

    // Create template for provider value matrix
    const templateZ = {}
    for (var label of Object.keys(PROVIDERS)) {
        templateZ[label] = [];
    }
    const templateZString = JSON.stringify(templateZ)

    var zPts = JSON.parse(templateZString);
    var xPts = [];
    var yPts = [];

    for (x = 0; x <= xlim; x += xstep) {
        let zTemp = JSON.parse(templateZString);
        let yTemp = [];
        let xTemp = [];
        for (y = 0; y <= ylim; y += ystep) {
            xTemp.push(x);
            yTemp.push(y);
            for (let [label, provider] of Object.entries(PROVIDERS)) {
                zTemp[label].push(provider(x, y, Nf, Ns));
            }
        }
        xPts.push(xTemp);
        yPts.push(yTemp);
        for (let label of Object.keys(PROVIDERS)) {
            zPts[label].push(zTemp[label]);
        }
    }

    var result = [xPts, yPts, zPts];

    var t1 = performance.now();
    console.log("Processing took " + (t1 - t0) + " milliseconds.");
    self.postMessage(result);
}
