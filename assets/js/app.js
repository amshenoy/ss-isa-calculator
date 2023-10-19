// Worker initialisation
const myWorker = new Worker("./assets/js/worker.js");

function updatePlot(data) {

    var xPts = data[0], yPts = data[1], zPts = data[2]

    var labels = ["HL", "AJB", "BARC", "FID", "II", "MIN"]
    var colors = ["rgb(0,0,255)", "rgb(255,180,0)", "rgb(0,255,0)", "rgb(255,0,0)", "rgb(255,0,180)", "rgb(200,200,200)"]

    var traces = []
    for (let [i, label] of labels.entries()) {
        var trace = {
            x: xPts,
            y: yPts,
            z: zPts[label],
            type: 'surface',
            name: label,
            showscale: false,
            colorscale: [[0, colors[i]], [1, colors[i]]],
            showlegend: true,
        }
        traces.push(trace)
    }

    var layout = {
        title: 'Stocks & Shares ISA Providers',
        scene: {
            xaxis: { title: "Fund Value" },
            yaxis: { title: "Share Value" },
            zaxis: { title: "Total Annual Cost" },
            camera: {
                // center: {x: 0, y: 0, z: 0 },
                eye: { x: 1.8, y: 1.2, z: 1.2 },
                up: { x: 0, y: 0, z: 0.3 }
            },
        },
        autosize: false,
        width: 1200,
        height: 840,
        // margin: {
        // l: 65,
        // r: 50,
        // b: 65,
        // t: 90,
        // },
    }

    Plotly.newPlot('plot', traces, layout);
}

// Process received data here
myWorker.onmessage = function (e) {
    var result = e.data
    // Process/display data here
    updatePlot(result)
    loading.style.display = "none"
}

const loading = document.querySelector('#sim-loading')
const numFunds = document.querySelector('#num-funds')
const numStocks = document.querySelector('#num-stocks')
const simulate = document.querySelector('#simulate')

simulate.onclick = function () {
    myWorker.postMessage({ fundRange: 40e3, fundStep: 2e2, stockRange: 40e3, stockStep: 2e2, fundTrans: parseInt(numFunds.value), stockTrans: parseInt(numStocks.value) })
    loading.style.display = "inline-block"
}

document.addEventListener("DOMContentLoaded", function (event) {
    simulate.click()
})
