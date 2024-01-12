    var projectModal = document.getElementById("projectsModal");
    var projectBtns = document.getElementsByClassName("project");
    var projectSpan = document.getElementsByClassName("projectsCloseBtn")[0];

    function projectOpenModal() {
    projectModal.style.display = "block";
}

    function projectCloseModal() {
    projectModal.style.display = "none";
}

    for (var i = 0; i < projectBtns.length; i++) {
    projectBtns[i].onclick = projectOpenModal;
}

    projectSpan.onclick = projectCloseModal;

    window.onclick = function(event) {
    if (event.target === projectModal) {
    projectCloseModal();
}
}
