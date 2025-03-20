require(["esri/layers/FeatureLayer", "esri/rest/support/Query"], function (FeatureLayer, Query) {

    let storedScenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

    let queries = [];  // Her senaryo için query'leri tutacak

    // Senaryolar için veri dizilerini oluþturuyoruz
    let scenarioData = {
        scenario1: {
            Iod: [],
            Qheat: [],
            TotalHeat: []
        },
        scenario2: {
            Iod: [],
            Qheat: [],
            TotalHeat: []
        },
        scenario3: {
            Iod: [],
            Qheat: [],
            TotalHeat: []
        }
    };

    var featureLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/U6foQVCzh67NkRmC/arcgis/rest/services/IOD_multipatch_3857_/FeatureServer/23"
    });

    // Her senaryo için query oluþturuyoruz
    storedScenarios.forEach(function (scenario, index) {

        let query = new Query();
        query.where = "OBJECTID IN (" + scenario.objectIdList.join(", ") + ")";
        query.outFields = ["*"]; 
        query.returnGeometry = true;

        queries.push({ query, year: scenario.selectedYear, index: index });
    });


    let promises = queries.map(function (item) {

        return queryFeaturesForScenario(item.query, item.year, item.index); // her query ve yýl için veriyi iþle
    });

    // Asenkron iþlemleri tamamladýktan sonra grafikleri oluþturacaðýz
    Promise.all(promises).then(function () {
        // Veriler alýndýktan sonra grafik oluþturma iþlemleri
        Co2EmissionChart(scenarioData.scenario1, scenarioData.scenario2, scenarioData.scenario3);
        QHeatingChart(scenarioData.scenario1, scenarioData.scenario2, scenarioData.scenario3);
        TotalHeatingChart(scenarioData.scenario1, scenarioData.scenario2, scenarioData.scenario3);
        Qheat_IOD(scenarioData.scenario1.Iod, scenarioData.scenario1.Qheat); //sadece senaryo 1 için verileri gönderdim
        TotalCost_IOD(scenarioData.scenario1.TotalHeat, scenarioData.scenario1.Iod);
        QHeating_TotalHeating(scenarioData.scenario1.Qheat, scenarioData.scenario1.TotalHeat);
    }).catch(function (error) {
        console.error(error);
    });

    function queryFeaturesForScenario(query, selectedYear, index) {

        return featureLayer.queryFeatures(query).then(function (response) {
            processQueryResponse(response, selectedYear, index);  // Veriyi iþleme
        }).catch(function (error) {
            console.error(error);
        });
    }

    // Verileri iþleyen fonksiyon
    function processQueryResponse(response, selectedYear, index) {
        response.features.forEach(function (feature) {
            let scenarioKey = 'scenario' + (index + 1); // Senaryo anahtarýný oluþturuyoruz

            if (selectedYear == 2020) {
                scenarioData[scenarioKey].Iod.push(feature.attributes.IOD_2020);
                scenarioData[scenarioKey].Qheat.push(feature.attributes.Q_Heating_2020__kWh_m2_);
                scenarioData[scenarioKey].TotalHeat.push(feature.attributes.total_heating_2020);
            }
            else if (selectedYear == 2050) {
                scenarioData[scenarioKey].Iod.push(feature.attributes.IOD_2050);
                scenarioData[scenarioKey].Qheat.push(feature.attributes.Q_Heating_2050__kWh_m2_);
                scenarioData[scenarioKey].TotalHeat.push(feature.attributes.total_heating_2050);
            } else if (selectedYear == 2080) {
                scenarioData[scenarioKey].Iod.push(feature.attributes.IOD_2080);
                scenarioData[scenarioKey].Qheat.push(feature.attributes.Q_Heating_2080__kWh_m2_);
                scenarioData[scenarioKey].TotalHeat.push(feature.attributes.total_heating_2080);
            }
        });
    }
});



function Co2EmissionChart(scenario1, scenario2, scenario3) {
    var options = {
        series: [
            {
                name: "Dataset 1",
                type: "boxPlot",
                data: [
                    { x: "Scenario 1", y: scenario1.Iod }, // Scenario 1 verisi
                    { x: "Scenario 2", y: scenario2.Iod }, // Scenario 2 verisi
                    { x: "Scenario 3", y: scenario3.Iod }  // Scenario 3 verisi
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
function QHeatingChart(scenario1, scenario2, scenario3) {
    var options = {
        series: [
            {
                name: "Dataset 1",
                type: "boxPlot",
                data: [
                    { x: "Scenario 1", y: scenario1.Qheat }, // Scenario 1 verisi
                    { x: "Scenario 2", y: scenario2.Qheat }, // Scenario 2 verisi
                    { x: "Scenario 3", y: scenario3.Qheat }  // Scenario 3 verisi
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
function TotalHeatingChart(scenario1, scenario2, scenario3) {
    var options = {
        series: [
            {
                name: "Dataset 1",
                type: "boxPlot",
                data: [
                    { x: "Scenario 1", y: scenario1.TotalHeat }, // Scenario 1 verisi
                    { x: "Scenario 2", y: scenario2.TotalHeat }, // Scenario 2 verisi
                    { x: "Scenario 3", y: scenario3.TotalHeat }  // Scenario 3 verisi
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


function Qheat_IOD(iodS1, qheatS1) {
//Senaryo 1 için verileri gösterildi
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
                data: iodS1,  // Ýlk seri: iod2020 ile qheat20
                color: 'red'
            },
            {
                name: "Group 2 (2020)",
                data: qheatS1,
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
            min: 1,
            max: 200
        },
        yaxis: {
            title: { text: "Q-Heating" },
            min: 30,
            max: 60
        },
        stroke: { curve: "smooth" }
    };

    chart = new ApexCharts(document.querySelector("#locationChart2"), options);
    chart.render();

}

///senaryo 1 için verileri gösterdim
function TotalCost_IOD(theadS1,iodS1) {

    var options = {
        chart: {
            type: 'scatter',
            height: 350,
            zoom: { enabled: true, type: 'xy' }
        },
        series: [
            {
                name: "Group 1 (Red)",
                data: iodS1,
                color: 'red'
            },
            {
                name: "Group 2 (Blue)",
                data: theadS1,
                color: 'blue'
            }
        ],
        xaxis: { title: { text: "TotalCost" }, min: 140, max: 180 },
        yaxis: { title: { text: "IOD" }, min: 0, max: 1 },
        stroke: { curve: "smooth" }
    };
    const chart = new ApexCharts(document.querySelector("#statusChart2"), options);
    chart.render();
}
///Senaryo 1 için verileri gösterdim
function QHeating_TotalHeating(qheatS1,theatS1) {
    var options = {
        chart: {
            type: 'scatter',
            height: 350,
            zoom: { enabled: true, type: 'xy' }
        },
        series: [
            {
                name: "Group 1 (Red)",
                data: qheatS1,
                color: 'red'
            },
            {
                name: "Group 2 (Blue)",
                data: theatS1,
                color: 'blue'
            }
        ],
        xaxis: { title: { text: "Q Heating" }, min: 140, max: 180 },
        yaxis: { title: { text: "Total Heating" }, min: 0, max: 20000 },
        stroke: { curve: "smooth" }
    };
    const chart = new ApexCharts(document.querySelector("#phaseChart2"), options);
    chart.render();
}


// Perform the query
//featureLayer.queryFeatures(queries[0]).then(function (response) {
//    // Iterate through the features and extract the specified attribute
//    response.features.forEach(function (feature) {

//        if (selectedYear1 == 2020) {

//            Iod2020.push(feature.attributes.IOD_2020);
//            Qheat2020.push(feature.attributes.Q_Heating_2020__kWh_m2_);
//            TotalHeat20.push(feature.attributes.total_heating_2020);

//        }
//        else if (selectedYear1 == 2050) {

//            Iod2050.push(feature.attributes.IOD_2050);
//            Qheat2050.push(feature.attributes.Q_Heating_2050__kWh_m2_);
//            TotalHeat50.push(feature.attributes.total_heating_2050);

//        } else if (selectedYear1 == 2080) {

//            Iod2080.push(feature.attributes.IOD_2080);
//            Qheat2080.push(feature.attributes.Q_Heating_2080__kWh_m2_);
//            TotalHeat80.push(feature.attributes.total_heating_2080);

//        }
//    });
//}).catch(function (error) {
//    console.error(error);
//});

//featureLayer.queryFeatures(queries[1]).then(function (response) {
//    // Iterate through the features and extract the specified attribute
//    response.features.forEach(function (feature) {

//        if (selectedYear1 == 2020) {

//            Iod2020.push(feature.attributes.IOD_2020);
//            Qheat2020.push(feature.attributes.Q_Heating_2020__kWh_m2_);
//            TotalHeat20.push(feature.attributes.total_heating_2020);

//        }
//        else if (selectedYear1 == 2050) {

//            Iod2050.push(feature.attributes.IOD_2050);
//            Qheat2050.push(feature.attributes.Q_Heating_2050__kWh_m2_);
//            TotalHeat50.push(feature.attributes.total_heating_2050);

//        } else if (selectedYear1 == 2080) {

//            Iod2080.push(feature.attributes.IOD_2080);
//            Qheat2080.push(feature.attributes.Q_Heating_2080__kWh_m2_);
//            TotalHeat80.push(feature.attributes.total_heating_2080);

//        }
//    });
//}).catch(function (error) {
//    console.error(error);
//});

//featureLayer.queryFeatures(queries[2]).then(function (response) {
//    // Iterate through the features and extract the specified attribute
//    response.features.forEach(function (feature) {

//        if (selectedYear1 == 2020) {

//            Iod2020.push(feature.attributes.IOD_2020);
//            Qheat2020.push(feature.attributes.Q_Heating_2020__kWh_m2_);
//            TotalHeat20.push(feature.attributes.total_heating_2020);

//        }
//        else if (selectedYear1 == 2050) {

//            Iod2050.push(feature.attributes.IOD_2050);
//            Qheat2050.push(feature.attributes.Q_Heating_2050__kWh_m2_);
//            TotalHeat50.push(feature.attributes.total_heating_2050);

//        } else if (selectedYear1 == 2080) {

//            Iod2080.push(feature.attributes.IOD_2080);
//            Qheat2080.push(feature.attributes.Q_Heating_2080__kWh_m2_);
//            TotalHeat80.push(feature.attributes.total_heating_2080);

//        }
//    });
//}).catch(function (error) {
//    console.error(error);
//});


//Co2EmissionChart(Iod2020, Iod2050, Iod2080);
//QHeatingChart(Qheat2020, Qheat2050, Qheat2080);
//TotalHeatingChart(TotalHeat20, TotalHeat50, TotalHeat80);
//Qheat_IOD(Iod2020, Iod2050, Iod2080, Qheat2020, Qheat2050, Qheat2080);
//TotalCost_IOD(Iod2020, Iod2050, Iod2080, TotalHeat20, TotalHeat50, TotalHeat80);
//QHeating_TotalHeating(Qheat2020, Qheat2050, Qheat2080, TotalHeat20, TotalHeat50, TotalHeat80);
