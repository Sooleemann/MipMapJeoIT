require(["esri/layers/FeatureLayer", "esri/rest/support/Query"], function (FeatureLayer, Query) {


    let storedScenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

    let Iod2020 = [];
    let Iod2050 = [];
    let Iod2080 = [];
    let Qheat2020 = [];
    let Qheat2050 = [];
    let Qheat2080 = [];
    let TotalHeat20 = [];
    let TotalHeat50 = [];
    let TotalHeat80 = [];

    var query = new Query();
    query.where = "OBJECTID IN (" + storedScenarios[0].objectIdList.join(", ") + ")";// Array of Object IDs you want to query
    query.outFields = ["*"]; // You can specify which fields to return
    query.returnGeometry = true;

    // Reference to your FeatureLayer
    var featureLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/U6foQVCzh67NkRmC/arcgis/rest/services/IOD_multipatch_3857_/FeatureServer/23"
    });


    // Perform the query
    featureLayer.queryFeatures(query).then(function (response) {
        // Iterate through the features and extract the specified attribute
        response.features.forEach(function (feature) {
            
            Iod2020.push(feature.attributes.IOD_2020);  
            Iod2050.push(feature.attributes.IOD_2050);  
            Iod2080.push(feature.attributes.IOD_2080); 

            Qheat2020.push(feature.attributes.Q_Heating_2020__kWh_m2_);
            Qheat2050.push(feature.attributes.Q_Heating_2050__kWh_m2_);
            Qheat2080.push(feature.attributes.Q_Heating_2080__kWh_m2_);

            TotalHeat20.push(feature.attributes.total_heating_2020);
            TotalHeat50.push(feature.attributes.total_heating_2050);
            TotalHeat80.push(feature.attributes.total_heating_2080);
        });
        Co2EmissionChart(Iod2020, Iod2050, Iod2080);
        QHeatingChart(Qheat2020, Qheat2050, Qheat2080);
        TotalHeatingChart(TotalHeat20, TotalHeat50, TotalHeat80);
        Qheat_IOD(Iod2020, Iod2050, Iod2080, Qheat2020, Qheat2050, Qheat2080);
        TotalCost_IOD(Iod2020, Iod2050, Iod2080, TotalHeat20, TotalHeat50, TotalHeat80);
        QHeating_TotalHeating(Qheat2020, Qheat2050, Qheat2080, TotalHeat20, TotalHeat50, TotalHeat80);


    }).catch(function (error) {
        console.error(error);
    });

   




});

function Co2EmissionChart(iod2020, iod2050, iod2080) {
    var options = {
        series: [
            {
                name: "Dataset 1",
                type: "boxPlot",
                data: [
                    { x: "Scenario 1", y: iod2020 },
                    { x: "Scenario 2", y: iod2050 },
                    { x: "Scenario 3", y: iod2080 }
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

    const chart = new ApexCharts(document.querySelector("#locationChart"), options);
    chart.render();
}

function QHeatingChart(qheat20,qheat50,qheat80)
{
    var options = {
        series: [
            {
                name: "Dataset 1",
                type: "boxPlot",
                data: [
                    { x: "Scenario 1", y: qheat20 },
                    { x: "Scenario 2", y: qheat50 },
                    { x: "Scenario 3", y: qheat80 }
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
    const chart = new ApexCharts(document.querySelector("#statusChart"), options);
    chart.render();
}

function TotalHeatingChart(totalHeat20, totalHeat50, totalHeat80) {
    var options = {
        series: [
            {
                name: "Dataset 1",
                type: "boxPlot",
                data: [
                    { x: "Scenario 1", y: totalHeat20 },
                    { x: "Scenario 2", y: totalHeat50 },
                    { x: "Scenario 3", y: totalHeat80 }
                ]
            }
        ],
        chart: {
            type: "boxPlot",
            height: 350
        },
        title: {
            text: "Total Heating"
        },
        xaxis: {
            type: "category"
        }
    };
    const chart = new ApexCharts(document.querySelector("#phaseChart"), options);
    chart.render();
}

function Qheat_IOD(iod2020, iod2050, iod2080, qheat20, qheat50, qheat80) {

    ///diziler ayný deðerlerde olmadýðý için güzel görünmüyor , biri 0-1 arasý biri 30-60 arasý
    //Dizi uzunluklarýný eþitle ve veriyi uygun formata çevir:
    //let seriesData1 = iod2020.map((iod, index) => [iod, qheat20[index] || 0]);
    //let seriesData2 = iod2050.map((iod, index) => [iod, qheat50[index] || 0]);
    //let seriesData3 = iod2080.map((iod, index) => [iod, qheat80[index] || 0]);

    var options = {
        chart: {
            type: 'scatter',
            height: 350,
            zoom: { enabled: true, type: 'xy' }
        },
        series: [
            {
                name: "Group 1 (2020)",
                data: iod2020,  // Ýlk seri: iod2020 ile qheat20
                color: 'red'
            },
            {
                name: "Group 2 (2020)",
                data: qheat20,
                color: 'blue'
            }
            //{
            //    name: "Group 2 (2050)",
            //    data: seriesData2, 
            //    color: 'blue'
            //},
            //{
            //    name: "Group 3 (2080)",
            //    data: seriesData3, 
            //    color: 'green'
            //}
        ],
        xaxis: {
            title: { text: "IOD" },
            min: 0,  
            max: 1   
        },
        yaxis: {
            title: { text: "Q-Heating" },
            min: 30,  
            max:60 
        },
        stroke: { curve: "smooth" }
    };

   chart = new ApexCharts(document.querySelector("#locationChart2"), options);
   chart.render();

}

function TotalCost_IOD(iod2020, iod2050, iod2080,theat20,theat50,theat80) {
    let seriesData1 = iod2020.map((iod, index) => [iod, theat20[index] || 0]);
    let seriesData2 = iod2050.map((iod, index) => [iod, theat50[index] || 0]);
    let seriesData23 = iod2080.map((iod, index) => [iod, theat80[index] || 0]);

    console.log(seriesData1);
    var options = {
        chart: {
            type: 'scatter',
            height: 350,
            zoom: { enabled: true, type: 'xy' }
        },
        series: [
            {
                name: "Group 1 (Red)",
                data: iod2020,
                color: 'red'
            },
            {
                name: "Group 2 (Blue)",
                data: theat20,
                color: 'blue'
            }
        ],
        xaxis: { title: { text: "TotalCost" }, min: 140, max: 180 },
        yaxis: { title: { text: "IOD" }, min:0, max: 1 },
        stroke: { curve: "smooth" }
    };
    const chart = new ApexCharts(document.querySelector("#statusChart2"), options);
    chart.render();
}

function QHeating_TotalHeating(qheat20,qheat50,qheat80,theat20,theat50,theat80) {
    var options = {
        chart: {
            type: 'scatter',
            height: 350,
            zoom: { enabled: true, type: 'xy' }
        },
        series: [
            {
                name: "Group 1 (Red)",
                data: qheat20,
                color: 'red'
            },
            {
                name: "Group 2 (Blue)",
                data: theat20,
                color: 'blue'
            }
        ],
        xaxis: { title: { text: "IOD" }, min: 140, max: 180 },
        yaxis: { title: { text: "TotalHeating" }, min: 140, max: 220 },
        stroke: { curve: "smooth" }
    };
    const chart = new ApexCharts(document.querySelector("#phaseChart2"), options);
    chart.render();
}
