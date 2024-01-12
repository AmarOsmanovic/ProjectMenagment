var express = require('express');
const pg = require("pg");
const e = require("express");
var router = express.Router();

const config = {
  user: 'unpxabwm',
  host: 'cornelius.db.elephantsql.com',
  database: 'unpxabwm',
  password: '68kEazJIWTsalKOa6DTh82FUD-OBLgBV', // TODO: DODATI KASKADU NA BRISANJE PROJEKATA
  port: 5432,
  max: 100,
  idleTimeoutMillis: 3000,
}

const pool = new pg.Pool(config)

router.get('/', async function(req, res, next) {
            const userData = req.session.user;
            const user_id = userData.id;
            const user_first_name = userData.first_name;
            const user_last_name = userData.last_name;
            const user_email = userData.email;
            const user_age = userData.age;
            const userRole = userData.role;

            const projects = await fetchProjects();
            const events = await fetchEvents();
            const tasks = await fetchTasks();

            const employees = await fetchEmployees();
            const employeesOnProject =  await  fetchEmployeesOnProject();
            const employeesOnEvent = await fetchEmployeesOnEvent()

            if(userRole === 'uposlenik'){
                try {
                    res.render('edit/userEdit', {
                        title: 'Evidencija Projekata',
                        user_id: user_id,
                        first_name: user_first_name,
                        last_name: user_last_name,
                        email: user_email,
                        age: user_age,
                        projects: projects,

                    });
                } catch (error) {
                    console.error('Error adding tasks:', error);
                    return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});
                }
            }else if(userRole === 'menadzer'){
                try {
                    res.render('edit/menagerEdit', {
                        title: 'Evidencija Projekata',
                        user_id: user_id,
                        first_name: user_first_name,
                        last_name: user_last_name,
                        email: user_email,
                        age: user_age,
                        employees: employees,
                        employeesOnProject: employeesOnProject,
                        projects: projects,
                        tasks: tasks,
                        events: events,
                        employeesOnEvent: employeesOnEvent,
                    });
                } catch (error) {
                    console.error('Error adding tasks:', error);
                    return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});
                }
            }else{
                try {
                    res.render('edit/adminEdit', {
                        title: 'Evidencija Projekata',
                        user_id: user_id,
                        first_name: user_first_name,
                        last_name: user_last_name,
                        email: user_email,
                        age: user_age,
                        employees: employees,
                        employeesOnProject: employeesOnProject,
                        projects: projects,
                        tasks: tasks,
                        events: events,
                        employeesOnEvent: employeesOnEvent,
                    });
                } catch (error) {
                    console.error('Error adding tasks:', error);
                    return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});
                }
            }
    });

router.post('/addProject', async function(req, res){
    const projectData = req.body;
    let stat;
    if(new Date(projectData.startDate) > new Date())
        stat = 'nadolazeci';
    else stat = 'aktivan';

    await pool.query(
        'INSERT INTO projects(name, start_date, end_date, about, status) VALUES ($1, $2, $3, $4, $5);',
        [projectData.projectName, projectData.startDate, projectData.endDate, projectData.aboutProject, stat]
    );

    const projectIdResult = await pool.query(
        'SELECT id FROM projects ORDER BY id DESC LIMIT 1;'
    );

    const projectId = projectIdResult.rows[0].id;

    const employees = projectData.employee;

    if (Array.isArray(employees)) {
        employees.forEach(async function(employee){
            await pool.query(
                'INSERT INTO user_projects(user_id, project_id) VALUES ($1, $2);',
                [employee, projectId]
            );
        });
    } else {
        await pool.query(
            'INSERT INTO user_projects(user_id, project_id) VALUES ($1, $2);',
            [employees, projectId]
        );
    }

    res.status(200);
});

router.post('/editProject', async function(req, res){
    const projectData = req.body;
    let stat;
    if(new Date(projectData.startDate) > new Date())
        stat = 'nadolazeci';
    else stat = 'aktivan';

    await pool.query(
        'UPDATE projects SET name = $1 , start_date = $2, end_date = $3, about = $4, status = $5 WHERE id = $6;',
        [projectData.projectName, projectData.startDate, projectData.endDate, projectData.aboutProject, stat,  projectData.projectId]
    );

    await pool.query(
        'DELETE FROM user_projects WHERE project_id = $1;',
        [projectData.projectId]
    );

    if (Array.isArray(projectData.employee)) {
        projectData.employee.forEach(async function(user){
            await pool.query(
                'INSERT INTO user_projects(project_id, user_id) VALUES ($1, $2);',
                [projectData.projectId, user]
            );
        });
    } else {
        await pool.query(
            'INSERT INTO user_projects(project_id, user_id) VALUES ($1, $2);',
            [projectData.projectId, projectData.employee]
        );
    }


    res.status(200);
});


router.post('/addTask', async function(req, res) {
    const taskData = req.body;
    let status = 'aktivan';

    const employees = taskData.employee;

    try {
        if (Array.isArray(employees)) {
            await Promise.all(employees.map(async function(employee) {
                await pool.query(
                    'INSERT INTO tasks(name, end_date, user_id, supervisor_id, status, project_id) VALUES ($1, $2, $3, $4, $5, $6);',
                    [taskData.taskName, taskData.endDate, employee, taskData.supervisorId, status, taskData.project]
                );
            }));
        } else {
            await pool.query(
                'INSERT INTO tasks(name, end_date, user_id, supervisor_id, status, project_id) VALUES ($1, $2, $3, $4, $5, $6);',
                [taskData.taskName, taskData.endDate, employees, taskData.supervisorId, status, taskData.project]
            );
        }


    } catch (error) {
        console.error('Error adding tasks:', error);
        return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});
    }
});

router.post('/editTask', async function(req, res) {
    const taskData = req.body;
    console.log(taskData)


    try {
        await pool.query(
            'UPDATE tasks SET name = $1, end_date = $2, user_id = $3, supervisor_id = $4, status = $5, project_id = $6 WHERE id = $7',
            [taskData.taskName, taskData.endDate, taskData.employee, taskData.supervisorId, taskData.status , taskData.project, taskData.taskId]
        );

    } catch (error) {
        console.error('Error adding tasks:', error);
        return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});
    }
});


router.post('/addEvent', async function(req, res){
    const eventData = req.body;

    await pool.query(
        'INSERT INTO events(name, date) VALUES ($1, $2);',
        [eventData.eventName, eventData.date,]
    );

    const eventIdResult = await pool.query(
        'SELECT id FROM events ORDER BY id DESC LIMIT 1;'
    );

    const eventId = eventIdResult.rows[0].id;

    const employees = eventData.employee;

    if (Array.isArray(employees)) {
        employees.forEach(async function(employee){
            await pool.query(
                'INSERT INTO users_events(user_id, event_id) VALUES ($1, $2);',
                [employee, eventId]
            );
        });
    } else {
        await pool.query(
            'INSERT INTO users_events(user_id, event_id) VALUES ($1, $2);',
            [employees, eventId]
        );
    }

    res.status(200);
});

router.post('/editEvent', async function(req, res){
    const eventData = req.body;


    await pool.query(
        'UPDATE events SET name = $1 , date = $2 WHERE id = $3;',
        [eventData.eventName, eventData.date, eventData.eventId]
    );

    await pool.query(
        'DELETE FROM users_events WHERE event_id = $1;',
        [eventData.eventId]
    );

    if (Array.isArray(eventData.employee)) {
        eventData.employee.forEach(async function(user){
            await pool.query(
                'INSERT INTO users_events (event_id, user_id) VALUES ($1, $2);',
                [eventData.eventId, user]
            );
        });
    } else {
        await pool.query(
            'INSERT INTO users_events (event_id, user_id) VALUES ($1, $2);',
            [eventData.eventId, eventData.employee]
        );
    }


});

router.post('/editEmployee', async function(req, res) {
    const employeeData = req.body;


    try {
        await pool.query(
            'UPDATE users SET first_name = $1, last_name = $2, email = $3, age = $4, role = $5 WHERE id = $6',
            [employeeData.firstName, employeeData.lastName, employeeData.email, employeeData.age, employeeData.role, employeeData.id]
        );

    } catch (error) {
        console.error('Error adding tasks:', error);
        return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});
    }

});
router.get('/deleteProject/:projectId', async function (req, res) {
    const projectId = req.params.projectId;

    await pool.query(
        'DELETE FROM user_projects WHERE user_projects.project_id = $1;',
        [projectId]
    )
    await pool.query(
        'DELETE FROM user_projects WHERE user_projects.project_id = $1;',
        [projectId]
    )
    await pool.query(
        'DELETE FROM projects WHERE projects.id = $1;',
        [projectId]
    )
});

router.get('/deleteTask/:taskId', async function (req, res) {
    const taskId = req.params.taskId;

    try {
        await pool.query(
            'DELETE FROM tasks WHERE id = $1;',
            [taskId]
        );

    } catch (error) {
        console.error('Error adding tasks:', error);
        return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});
    }
});


router.get('/deleteEvent/:eventId', async function (req, res) {
    const eventId = req.params.eventId;

    try {
        await pool.query(
            'DELETE FROM users_events WHERE event_id = $1;',
            [eventId]
        );

        await pool.query(
            'DELETE FROM events WHERE id = $1;',
            [eventId]
        );

    } catch (error) {
        console.error('Error adding tasks:', error);
        return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});
    }
});


router.get('/deleteEmployee/:employeeId', async function (req, res) {
    const employeeId = req.params.employeeId;

    try {
        await pool.query(
            'DELETE FROM user_projects WHERE user_id = $1;',
            [employeeId]
        );

        await pool.query(
            'DELETE FROM users WHERE id = $1;',
            [employeeId]
        );

    } catch (error) {
        console.error('Error adding tasks:', error);
        return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});
    }
});


router.post('/addTime', async function(req, res) {
    const timeData = req.body;
    const minutes = parseInt(timeData.hours * 60) + parseInt(timeData.minutes);

    pool.query(
        'INSERT INTO users_time_on_project (user_id, project_id, time) VALUES ($1, $2, $3);',
        [timeData.userId, timeData.projectId, minutes],
        (err, result) => {
            if (err) {
                console.error('Error adding tasks:', err);
                return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});
            }
        }
    );



});
async function fetchEmployees() {
    const result = await pool.query(
        'SELECT ' +
        'users.id AS id, ' +
        'users.first_name AS first_name, ' +
        'users.last_name AS last_name, ' +
        'users.email AS email, ' +
        'users.age AS age,' +
        'users.role AS role  ' +
        'FROM users;'
    );
    return result.rows.map(row => ({
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        age: row.age,
        role: row.role,
    }));
}

    async function fetchProjects() {
        const result = await pool.query(
            'SELECT ' +
            'projects.id AS project_id, ' +
            'projects.name AS project_name, ' +
            'projects.start_date AS start_date, ' +
            'projects.end_date AS end_date, ' +
            'projects.status AS status, ' +
            'projects.about AS about, ' +
            'TO_CHAR(projects.start_date, \'DD/MM\') AS formatted_start_date, ' +
            'TO_CHAR(projects.end_date, \'DD/MM\') AS formatted_end_date ' +
            'FROM projects ' +
            'ORDER BY status ASC, projects.start_date ASC;',
        );
        return result.rows.map(row => ({
            project_id: row.project_id,
            project_name: row.project_name,
            start_date: row.start_date,
            end_date: row.end_date,
            status: row.status,
            about: row.about,
            formatted_start_date: row.formatted_start_date,
            formatted_end_date: row.formatted_end_date,
        }));
    }
async function fetchEmployeesOnProject() {
    const result = await pool.query(
        'SELECT ' +
        'user_projects.user_id AS user_id, ' +
        'user_projects.project_id AS project_id ' +
        'FROM user_projects;'
    );
    return result.rows.map(row => ({
        user_id: row.user_id,
        project_id: row.project_id,
    }));
}



async function fetchTasks() {
    const result = await pool.query(
        'SELECT ' +
        'tasks.id AS id, ' +
        'tasks.name AS name, ' +
        'tasks.end_date AS end_date, ' +
        'tasks.status AS status, ' +
        'tasks.user_id AS user_id, ' +
        'tasks.supervisor_id AS supervisor_id, ' +
        'tasks.project_id AS project_id, ' +
        'users.first_name AS first_name, ' +
        'users.last_name AS last_name ' +
        'FROM tasks ' +
        'JOIN users ON users.id = tasks.user_id ' +
        'GROUP BY ' +
        'tasks.project_id, ' +
        'tasks.id, ' +
        'tasks.name, ' +
        'tasks.end_date, ' +
        'tasks.status, ' +
        'tasks.user_id, ' +
        'tasks.supervisor_id, ' +
        'users.first_name, ' +
        'users.last_name ' +
        'ORDER BY tasks.project_id;'
    );
    return result.rows.map(row => ({
        task_id: row.id,
        task_name: row.name,
        end_date: row.end_date,
        status: row.status,
        user_id: row.user_id,
        supervisor_id: row.supervisor_id,
        project_id: row.project_id,
        user_first_name: row.first_name,
        user_last_name: row.last_name
    }));
}


async function fetchTasksOnProject() {
    const result = await pool.query(
        'SELECT ' +
        'user_projects.user_id AS user_id, ' +
        'user_projects.project_id AS project_id ' +
        'FROM user_projects;'
    );
    return result.rows.map(row => ({
        user_id: row.user_id,
        project_id: row.project_id,
    }));
}

async function fetchEvents() {
        const result = await pool.query(
            'SELECT ' +
            'events.id AS id, ' +
            'events.name AS event_name, ' +
            'events.date AS date ' +
            'FROM events;'
        );
        return result.rows.map(row => ({
            id: row.id,
            name: row.event_name,
            date: row.date,
        }));
    }

async function fetchEmployeesOnEvent() {
    const result = await pool.query(
        'SELECT ' +
        'users_events.user_id AS user_id, ' +
        'users_events.event_id AS event_id ' +
        'FROM users_events;'
    );
    return result.rows.map(row => ({
        user_id: row.user_id,
        event_id: row.event_id,
    }));
}

module.exports = router;