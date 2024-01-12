google.charts.load("current", {packages:['corechart']});
google.charts.setOnLoadCallback(drawChart);
async function drawChart() {

    var pregledData = google.visualization.arrayToDataTable([
        ["Mjesec", "Taskovi", {role: "style"}],
        ["Januar",  await fetchTasksByMonth(1), "color: #3876BF"],
        ["Februar", await fetchTasksByMonth(2), "color: #fa8c45"],
        ["Mart", await fetchTasksByMonth(3), "color: #3876BF"],
        ["April", await fetchTasksByMonth(4), "color: #fa8c45"],
        ["Maj", await fetchTasksByMonth(5), "color: #3876BF"],
        ["Juni", await fetchTasksByMonth(6), "color: #fa8c45"],
        ["Juli", await fetchTasksByMonth(7), "color: #3876BF"],
        ["August", await fetchTasksByMonth(8), "color: #fa8c45"],
        ["Septembar", await fetchTasksByMonth(9), "color: #3876BF"],
        ["Oktobar", await fetchTasksByMonth(10), "color: #fa8c45"],
        ["Novembar", await fetchTasksByMonth(11), "color: #3876BF"],
        ["Decembar", await fetchTasksByMonth(12), "color: #fa8c45"],

    ]);
    var pregledView = new google.visualization.DataView(pregledData);
    pregledView.setColumns([0, 1,
        {
            calc: "stringify",
            sourceColumn: 1,
            type: "string",
            role: "annotation"
        },
        2]);

    var pregledOptions = {
        title: "Pregled godine",
        bar: {groupWidth: "95%"},
        legend: {position: "none"},
        backgroundColor: 'white',
        titleTextStyle: {
            color: '#939394',
        },
        hAxis: {
            textStyle: {
                color: '#939394',
            }
        },
        vAxis: {
            textStyle: {
                color: '#939394',
            }
        },

    };
    var chart1 = new google.visualization.ColumnChart(document.getElementById("pregledGraf"));
    chart1.draw(pregledView, pregledOptions);
    const timeObject = new Date();
    timeObject.setHours(8, 0, 0, 0);

    var aktivnostData = google.visualization.arrayToDataTable([
        ["Sat", "Taskovi", {role: "style"}],
        ["08:00h", await fetchTasksByHour(new Date(timeObject)), "color: #3876BF"],
        ["09:00h", await fetchTasksByHour(new Date(timeObject.setHours(9))), "color: #fa8c45"],
        ["10:00h", await fetchTasksByHour(new Date(timeObject.setHours(10))), "color: #3876BF"],
        ["11:00h", await fetchTasksByHour(new Date(timeObject.setHours(11))), "color: #fa8c45"],
        ["12:00h", await fetchTasksByHour(new Date(timeObject.setHours(12))), "color: #3876BF"],
        ["13:00h", await fetchTasksByHour(new Date(timeObject.setHours(13))), "color: #fa8c45"],
        ["14:00h", await fetchTasksByHour(new Date(timeObject.setHours(14))), "color: #3876BF"],
        ["15:00h", await fetchTasksByHour(new Date(timeObject.setHours(15))), "color: #fa8c45"],

    ]);
    var aktivnostView = new google.visualization.DataView(aktivnostData);
    aktivnostView.setColumns([0, 1,
        {
            calc: "stringify",
            sourceColumn: 1,
            type: "string",
            role: "annotation"
        },
        2]);

    var aktivnostOptions = {
        title: "Dnevna aktivnost",
        bar: {groupWidth: "90%"},
        legend: {position: "none"},
        backgroundColor: 'white',
        titleTextStyle: {
            color: '#939394',
        },
        hAxis: {
            textStyle: {
                color: '#939394',
            }
        },
        vAxis: {
            textStyle: {
                color: '#939394',
            }
        }
    };
    var chart2 = new google.visualization.ColumnChart(document.getElementById("aktivnostGraf"));
    chart2.draw(aktivnostView, aktivnostOptions);
    window.addEventListener('resize', function () {
        chart1.draw(pregledData, pregledOptions);
        chart2.draw(aktivnostData, aktivnostOptions);
    });
}


async function fetchTasksByHour(time) {
    const response = await fetch('/stats/fetchTasksByHour', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            time: time
        }),
    });

    return parseInt(await response.json());
}


async function fetchTasksByMonth(month) {
    const response = await fetch('/stats/fetchTasksByMonth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            month: month
        }),
    });

    return parseInt(await response.json());
}