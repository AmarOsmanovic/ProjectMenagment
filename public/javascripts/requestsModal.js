    var reqModal = document.getElementById("requestsModal");
    var reqBtns = document.getElementsByClassName("req");
    var reqSpan = document.getElementsByClassName("reqCloseBtn")[0];

    function reqOpenModal() {
    reqModal.style.display = "block";
}

    function reqCloseModal() {
    reqModal.style.display = "none";
}

    for (var i = 0; i < reqBtns.length; i++) {
    reqBtns[i].onclick = reqOpenModal;
}

    reqSpan.onclick = reqCloseModal;

    window.onclick = function(event) {
    if (event.target === reqModal) {
    reqCloseModal();
}
}
