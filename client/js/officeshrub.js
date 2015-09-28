$(document).ready(function() {
    var lightData = [];
    var waterData = [];
    var colors = ['#222'];

    var INTERVAL = 2000;

    var currentPlant = "office_shrub";

    //Charts
    // TODO: Timestamps and better labelling
    var lightChart = c3.generate({
        bindto: '#lightChart',
        data: {
            columns: [
                ['light level (%)']
            ],
            color:function(color,d){
                return colors[d.index];    
            }     
        },
        axis: {
            y: {
                max: 100,
                min: 10
            }
        }
    });

    var waterChart = c3.generate({
        bindto: '#waterChart',
        data: {
            type: 'gauge',
            columns: [
                ['water level', 0]
            ],
            color:function(color,d){
                return colors[d.index];    
            }
        }
    });

    //Fetch data from server to update the charts
    function updateChartData() {
        $.ajax({
            method: "GET",
            url: "/" + currentPlant + "/light/?num=30",
            success: function(resp) {
                lightData = resp.light;
                var data = ["light level"];
                for (var i = 0; i < lightData.length; i++) {
                    data.push(lightData[i].light);
                }

                lightChart.load({
                    columns: [
                        data
                    ]               
                });
            }
        });

        $.ajax({
            method: "GET",
            url: "/" + currentPlant + "/water",
            success: function(resp) {
                waterData = resp;
                // TODO: Gross. good thing I'm going to revisit the API soon.
                var data = ["water level", resp.water[0].water];

                waterChart.load({
                    columns: [
                        data
                    ]
                });
            }
        });
    }
    updateChartData();
    setInterval(updateChartData, INTERVAL);

    //Load the plants list
    $.ajax({
        method: "GET",
        url: "plants",
        success: function(res) {
            var plants = res;
            for (var i=0; i < plants.length; i++) {
                $("<option>").attr("value", plants[i]).text(plants[i]).appendTo("#plant_name");
            }
        }
    });

    //Use the new plant name
    $("#plant_name").on("change", function() {
        currentPlant = $(this).val();
    });

});
