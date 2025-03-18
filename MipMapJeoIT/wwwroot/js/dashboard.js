
const data = [23, 45, 12, 56, 34, 48, 19, 50, 38, 29];

function computeBoxPlotValues(data) {
    data.sort((a, b) => a - b); // Sort values ascending

    const min = data[0];
    const max = data[data.length - 1];

    const median = getPercentile(data, 50);
    const q1 = getPercentile(data, 25);
    const q3 = getPercentile(data, 75);

    return [min, q1, median, q3, max];
}
function getPercentile(sortedData, percentile) {
    const index = (percentile / 100) * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) return sortedData[lower];

    return sortedData[lower] + (sortedData[upper] - sortedData[lower]) * (index - lower);
}
var options = {
    series: [
        {
            name: "Dataset 1",
            type: "boxPlot",
            data: [
                { x: "Scenario 1", y: [50, 60, 70, 80, 90] },
                { x: "Scenario 2", y: [30, 40, 50, 60, 70] },
                { x: "Scenario 3", y: [20, 30, 40, 50, 60] }
            ]
        }
    ],
    chart: {
        type: "boxPlot",
        height: 350
    },
    title: {
        text: "Q Heating"
    },
    xaxis: {
        type: "category"
    }
};

const chart = new ApexCharts(document.querySelector("#locationChart"), options);
chart.render();

var options2 = {
    series: [
        {
            name: "Dataset 1",
            type: "boxPlot",
            data: [
                { x: "Scenario 1", y: [50, 60, 70, 80, 90] },
                { x: "Scenario 2", y: [30, 40, 50, 60, 70] },
                { x: "Scenario 3", y: [20, 30, 40, 50, 60] }
            ]
        }
    ],
    chart: {
        type: "boxPlot",
        height: 350
    },
    title: {
        text: "Co2 Emission"
    },
    xaxis: {
        type: "category"
    }
};

const chart2 = new ApexCharts(document.querySelector("#statusChart"), options2);
chart2.render();

var options3 = {
    series: [
        {
            name: "Dataset 1",
            type: "boxPlot",
            data: [
                { x: "Scenario 1", y: [50, 60, 70, 80, 90] },
                { x: "Scenario 2", y: [30, 40, 50, 60, 70] },
                { x: "Scenario 3", y: [20, 30, 40, 50, 60] }
            ]
        }
    ],
    chart: {
        type: "boxPlot",
        height: 350
    },
    title: {
        text: "Total Cost"
    },
    xaxis: {
        type: "category"
    }
};

const chart3 = new ApexCharts(document.querySelector("#phaseChart"), options3);
chart3.render();

var options4 = {
    chart: {
        type: 'scatter',
        height: 350,
        zoom: { enabled: true, type: 'xy' }
    },
    series: [
        {
            name: "Group 1 (Red)",
            data: [
                [145, 150], [147, 152], [148, 155], [149, 158],
                [150, 160], [151, 162], [152, 165], [153, 168]
            ],
            color: 'red'
        },
        {
            name: "Group 2 (Blue)",
            data: [
                [155, 170], [156, 173], [157, 175], [158, 178],
                [159, 180], [160, 183], [161, 185], [162, 188]
            ],
            color: 'blue'
        }
    ],
    xaxis: { title: { text: "TotalCost" }, min: 140, max: 180 },
    yaxis: { title: { text: "Q Heating" }, min: 140, max: 220 },
    stroke: { curve: "smooth" }
};
const chart4 = new ApexCharts(document.querySelector("#locationChart2"), options4);
chart4.render();

var options5 = {
    chart: {
        type: 'scatter',
        height: 350,
        zoom: { enabled: true, type: 'xy' }
    },
    series: [
        {
            name: "Group 1 (Red)",
            data: [
                [145, 150], [147, 152], [148, 155], [149, 158],
                [150, 160], [151, 162], [152, 165], [153, 168]
            ],
            color: 'red'
        },
        {
            name: "Group 2 (Blue)",
            data: [
                [155, 170], [156, 173], [157, 175], [158, 178],
                [159, 180], [160, 183], [161, 185], [162, 188]
            ],
            color: 'blue'
        }
    ],
    xaxis: { title: { text: "TotalCost" }, min: 140, max: 180 },
    yaxis: { title: { text: "Carbon Emission" }, min: 140, max: 220 },
    stroke: { curve: "smooth" }
};

const chart5 = new ApexCharts(document.querySelector("#statusChart2"), options5);
chart5.render();

var options6 = {
    chart: {
        type: 'scatter',
        height: 350,
        zoom: { enabled: true, type: 'xy' }
    },
    series: [
        {
            name: "Group 1 (Red)",
            data: [
                [145, 150], [147, 152], [148, 155], [149, 158],
                [150, 160], [151, 162], [152, 165], [153, 168]
            ],
            color: 'red'
        },
        {
            name: "Group 2 (Blue)",
            data: [
                [155, 170], [156, 173], [157, 175], [158, 178],
                [159, 180], [160, 183], [161, 185], [162, 188]
            ],
            color: 'blue'
        }
    ],
    xaxis: { title: { text: "IOD" }, min: 140, max: 180 },
    yaxis: { title: { text: "Q-Heating" }, min: 140, max: 220 },
    stroke: { curve: "smooth" }
};

const chart6 = new ApexCharts(document.querySelector("#phaseChart2"), options6);
chart6.render();