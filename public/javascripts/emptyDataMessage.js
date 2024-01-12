var projectsDiv = document.getElementById('projectsCon');
var tasksDiv = document.getElementById('tasksCon');
var eventsDiv = document.getElementById('eventsCon');
var notesDiv = document.getElementById('notesCon');

if (projectsDiv.innerHTML.trim() === '') {
    projectsDiv.innerHTML = '<div class="poruka"><p>Trenutno nemate projekata</p></div>';
}
if (tasksDiv.innerHTML.trim() === '') {
    tasksDiv.innerHTML = '<div class="poruka"><p>Trenutno nemate taskova</p></div>';
}
if (eventsDiv.innerHTML.trim() === '') {
    eventsDiv.innerHTML = '<div class="poruka"><p>Trenutno nemate događaja</p></div>';
}
if (notesDiv.innerHTML.trim() === '') {
    notesDiv.innerHTML = '<div class="poruka"><p>Trenutno nemate napomena</p></div>';
}