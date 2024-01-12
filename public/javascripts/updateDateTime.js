function updateDateTime() {
    let now = new Date();

    let dayNames = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
    let monthNames = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

    let day = now.getDate();
    let month = now.getMonth();

    let dateElement = document.getElementById("datum");
    dateElement.innerHTML = dayNames[now.getDay()] + ', ' + monthNames[month] + ' ' + day;
}

updateDateTime();