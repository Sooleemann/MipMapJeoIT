﻿let iodChart;
let qHeatingChart;
let totalHeatingChart; ///chartss

// Senaryolar 
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

require(["esri/layers/FeatureLayer", "esri/rest/support/Query"], function (FeatureLayer, Query) {

    let storedScenarios = JSON.parse(localStorage.getItem("scenarios")) || []; // LocalStorage'dan senaryoları aldık

    let queries = [];  // Her senaryo için query'leri tutacak



    var featureLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/U6foQVCzh67NkRmC/arcgis/rest/services/IOD_multipatch_3857_/FeatureServer/23"
    });

    // Her senaryo için query oluşturuyoruz
    storedScenarios.forEach(function (scenario, index) {

        let query = new Query();
        query.where = "OBJECTID IN (" + scenario.objectIdList.join(", ") + ")";
        query.outFields = ["*"]; 
        query.returnGeometry = true;

        queries.push({ query, year: scenario.selectedYear, index: index });
    });

    console.log(queries);

    let promises = queries.map(function (item) {

        return queryFeaturesForScenario(item.query, item.year, item.index); // her query ve yıl için veriyi işle
    });

    // Asenkron işlemleri tamamladıktan sonra grafikleri oluşturacağız
    Promise.all(promises).then(function () {
        // Veriler alındıktan sonra grafik oluşturma işlemleri
        Co2EmissionChart(scenarioData.scenario1, scenarioData.scenario2, scenarioData.scenario3);
        QHeatingChart(scenarioData.scenario1, scenarioData.scenario2, scenarioData.scenario3);
        TotalHeatingChart(scenarioData.scenario1, scenarioData.scenario2, scenarioData.scenario3);
        Qheat_IOD(scenarioData.scenario1.Iod, scenarioData.scenario1.Qheat);                       //sadece senaryo 1 için verileri gönderdim
        TotalCost_IOD(scenarioData.scenario1.TotalHeat, scenarioData.scenario1.Iod);
        QHeating_TotalHeating(scenarioData.scenario1.Qheat, scenarioData.scenario1.TotalHeat);
    }).catch(function (error) {
        console.error(error);
    });

    function queryFeaturesForScenario(query, selectedYear, index) {

        return featureLayer.queryFeatures(query).then(function (response) {
            processQueryResponse(response, selectedYear, index);  // Veriyi işleme
        }).catch(function (error) {
            console.error(error);
        });
    }

    // Verileri işleyen fonksiyon
    function processQueryResponse(response, selectedYear, index) {
        response.features.forEach(function (feature) {
            let scenarioKey = 'scenario' + (index + 1); // Senaryo anahtarını oluşturuyoruz

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

    iodChart = new ApexCharts(document.querySelector("#locationChart"), options);
    iodChart.render();
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
    qHeatingChart = new ApexCharts(document.querySelector("#statusChart"), options);
    qHeatingChart.render();
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
    totalHeatingChart = new ApexCharts(document.querySelector("#phaseChart"), options);
    totalHeatingChart.render();
}

// senaryo 1 verileri
function Qheat_IOD(iodS1, qheatS1) {
//Senaryo 1 için verileri gösterildi
    //Dizi uzunluklarını eşitle ve veriyi uygun formata çevir:
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
                data: iodS1,  // İlk seri: iod2020 ile qheat20
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

///senaryo 1 verileri
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
///Senaryo 1 verileri 
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




/// senaryoları drawerda gösterme 
document.addEventListener("DOMContentLoaded", function () {
    // LocalStorage'dan senaryoları al
    let storedScenarios = JSON.parse(localStorage.getItem("scenarios")) || [];
    let scenarioCardsContainer = document.getElementById("scenarioCards");

    // Senaryoları card içerisinde 
    storedScenarios.forEach((scenario, index) => {
        let card = document.createElement("div");
        card.className = "col-12";  
        card.innerHTML = `
            <div class="card bg-dark text-white mb-3">
                <div class="card-header">
                    Scenario ${index + 1} (Year: ${scenario.selectedYear})
                </div>
                <div class="card-body">
                    <ul class="list-unstyled">
                        <li><strong>Function:</strong> between ${scenario.function_}</li>
                        <li><strong>Infiltration:</strong> between ${scenario.infiltration}</li>
                        <li><strong>SHGC:</strong> between ${scenario.shgc}</li>
                        <li><strong>U-Ground:</strong> between ${scenario.uground}</li>
                        <li><strong>U-Roof:</strong> between ${scenario.uroof}</li>
                        <li><strong>U-Wall:</strong> between ${scenario.uwall}</li>
                        <li><strong>U-Window:</strong> between ${scenario.uwindow}</li>
                    </ul>
                </div>
            </div>
        `;
        scenarioCardsContainer.appendChild(card);
    });
});


// yıllara göre
function selectYear(year) {
    document.getElementById("yearDropdown").textContent = `Year: ${year}`; // Seçilen yılı butona yazdır

    // Eski grafik verilerini temizleyelim
    if (iodChart) {
        iodChart.destroy(); // Mevcut iod grafiklerini destroy
    }
    if (qHeatingChart) {
        qHeatingChart.destroy(); // Q Heating grafiklerini de
    }
    if (totalHeatingChart) {
        totalHeatingChart.destroy(); //  Total Heating grafiklerini de
    }


    if (year == 2020) {
        //burası net değil , doldurulacak

        //// Güncellenen verileri tekrar çizelim
        //Co2EmissionChart(scenarioData.scenario1., scenarioData.scenario2, scenarioData.scenario3);
        //QHeatingChart(scenarioData.scenario1, scenarioData.scenario2, scenarioData.scenario3);
        //TotalHeatingChart(scenarioData.scenario1, scenarioData.scenario2, scenarioData.scenario3);

        //// Kartları da güncelleyelim
        //updateScenarioCards();
    }

}

// Kartları Güncelle
function updateScenarioCards() {
    let scenarioCardsContainer = document.getElementById("scenarioCards");

    // Kartları içeriğini sil
    scenarioCardsContainer.innerHTML = "";
}

// Compare butonuna tıklanıldığında 
document.getElementById('compareButton').addEventListener('click', function () {
    // Seçilen senaryoları al
    let scenario1 = document.getElementById('scenario1Select').value;
    let scenario2 = document.getElementById('scenario2Select').value;

    // İlgili verileri al ve grafikleri güncelle
    let scenario1Data = scenarioData[scenario1];
    let scenario2Data = scenarioData[scenario2];

    // Eski grafik verilerini temizleyelim
    if (iodChart) {
        iodChart.destroy(); // Mevcut iod grafiklerini destroy
    }
    if (qHeatingChart) {
        qHeatingChart.destroy(); // Q Heating grafiklerini de
    }
    if (totalHeatingChart) {
        totalHeatingChart.destroy(); //  Total Heating grafiklerini de
    }

    var options = {
        series: [
            {
                name: "Dataset 1",
                type: "boxPlot",
                data: [
                    { x: scenario1, y: scenario1Data.Iod }, // Scenario 1 verisi
                    { x: scenario2, y: scenario2Data.Iod }, // Scenario 2 verisi
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

    iodChart = new ApexCharts(document.querySelector("#locationChart"), options);
    iodChart.render();

    var options2 = {
        series: [
            {
                name: "Dataset 1",
                type: "boxPlot",
                data: [
                    { x: scenario1, y: scenario1Data.Qheat }, // Scenario 1 verisi
                    { x: scenario2, y: scenario2Data.Qheat }, // Scenario 2 verisi
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
    qHeatingChart = new ApexCharts(document.querySelector("#statusChart"), options2);
    qHeatingChart.render();


    var options3 = {
        series: [
            {
                name: "Dataset 1",
                type: "boxPlot",
                data: [
                    { x: scenario1, y: scenario1Data.TotalHeat }, // Scenario 1 verisi
                    { x: scenario2, y: scenario2Data.TotalHeat }, // Scenario 2 verisi
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
    totalHeatingChart = new ApexCharts(document.querySelector("#phaseChart"), options3);
    totalHeatingChart.render();

});