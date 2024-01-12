var express = require('express');
const pg = require("pg");
var router = express.Router();

const config = {
  user: 'unpxabwm',
  host: 'cornelius.db.elephantsql.com',
  database: 'unpxabwm',
  password: '68kEazJIWTsalKOa6DTh82FUD-OBLgBV',
  port: 5432,
  max: 100,
  idleTimeoutMillis: 3000,
}

const pool = new pg.Pool(config)

router.get('/', async function(req, res, next) {
        try {
            const userData = req.session.user;
            const user_id = userData.id;
            const user_first_name = userData.first_name;
            const user_last_name = userData.last_name;
            const user_email = userData.email;
            const user_age = userData.age;

            const projects = await fetchProjects(user_id);
            const tasks = await fetchTasks(user_id);
            const events = await fetchEvents(user_id);
            const notes = await fetchNotes(user_id);


            res.render('index', {
                title: 'Evidencija Projekata',
                user_id: user_id,
                first_name: user_first_name,
                last_name: user_last_name,
                email: user_email,
                age: user_age,
                projects: projects,
                tasks: tasks,
                events: events,
                notes: notes,
            });
        } catch (error) {

            return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});

        }
    });

router.post('/addNote', async function(req, res, next) {
    const noteData = req.body;
    await pool.query(
        'INSERT INTO notes(text, user_id) VALUES ($1, $2);',
        [noteData.text, noteData.user_id]
    );

    noteId = await pool.query(
        'SELECT id FROM notes WHERE text = $1 AND user_id = $2;',
        [noteData.text, noteData.user_id]
    );

});

router.post('/deleteNote', async function(req, res, next) {
    const noteData = req.body;
    await pool.query(
        'DELETE FROM notes WHERE id = $1',
        [noteData.id]
    );



});

    async function fetchProjects(user_id) {
        const result = await pool.query(
            'SELECT ' +
            'projects.id AS project_id, ' +
            'projects.name AS project_name, ' +
            'projects.start_date AS start_date, ' +
            'projects.end_date AS end_date, ' +
            'projects.status AS status, ' +
            'TO_CHAR(projects.start_date, \'DD/MM\') AS formatted_start_date, ' +
            'TO_CHAR(projects.end_date, \'DD/MM\') AS formatted_end_date ' +
            'FROM user_projects ' +
            'LEFT JOIN projects ON user_projects.project_id = projects.id ' +
            'WHERE user_projects.user_id = $1 ' +
            'ORDER BY status ASC, projects.start_date ASC;',
            [user_id],
        );
        return result.rows.map(row => ({
            project_id: row.project_id,
            project_name: row.project_name,
            start_date: row.start_date,
            end_date: row.end_date,
            status: row.status,
            formatted_start_date: row.formatted_start_date,
            formatted_end_date: row.formatted_end_date,
        }));
    }

async function fetchTasks(user_id) {
    const date = new Date();
    const day = String(date.getDate());
    const result = await pool.query(
        'SELECT ' +
        'tasks.id AS task_id, ' +
        'tasks.name AS task_name, ' +
        'TO_CHAR(tasks.end_date, \'HH24:MI DD/MM\') AS formatted_end_date, ' +
        'tasks.end_date AS end_date, ' +
        'tasks.status AS status, ' +
        'users.first_name AS supervisor_first_name ' +
        'FROM tasks ' +
        'LEFT JOIN ' +
        'users ON tasks.supervisor_id = users.id ' +
        'WHERE tasks.user_id = $1 ' +
        'AND (tasks.end_date > NOW() OR DATE(tasks.finish_time) = CURRENT_DATE OR tasks.status = $2) ' +
        'ORDER BY ' +
        'status ASC, tasks.end_date DESC;',
        [user_id,'aktivan'],
    );
    return result.rows.map(row => ({
        task_id: row.task_id,
        task_name: row.task_name,
        formatted_end_date: row.formatted_end_date,
        end_date: row.end_date,
        status: row.status,
        supervisor: row.supervisor_first_name,
    }));
}



async function fetchEvents(user_id) {
        const result = await pool.query(
            'SELECT events.name AS event_name, ' +
            'TO_CHAR(events.date, \'HH24:MI DD/MM\') AS formatted_date, ' +
            'events.date AS date ' +
            'FROM users_events ' +
            'LEFT JOIN events ON users_events.event_id = events.id ' +
            'WHERE users_events.user_id = $1 ' +
            'AND events.date > NOW()' +
            'ORDER BY events.date ASC;',
            [user_id],
        );
        return result.rows.map(row => ({
            event_name: row.event_name,
            formatted_date: row.formatted_date,
            date: row.date,
        }));
    }

    async function fetchNotes(user_id) {
        const result = await pool.query(
            'SELECT notes.text AS note, ' +
            'notes.id AS id ' +
            'FROM notes ' +
            'WHERE notes.user_id = $1;',
            [user_id],
        );
        return result.rows.map(row => ({
            note: row.note,
            id: row.id,
        }));
    }


const updateTaskStatus = (taskId, status, res) => {
    const newStatus = status ? 'zavrsen' : 'aktivan';
    const time = status  ? new Date() : null;
    pool.connect((err, client, done) => {
        if (err) {
            return handleError(res, err);
        }
        client.query(
            'UPDATE tasks SET status = $1, finish_time = $2 WHERE id = $3;',
            [newStatus, time, taskId],
            (err, result) => {
                done();
                if (err) {
                    return handleError(res, err);
                }

                res.status(200).send('Task status updated successfully');
            }
        );
    });
};

const handleError = (res, err) => {
    res.send(err);
};

router.post('/update-task', (req, res) => {
    const { taskId, status } = req.body;
    updateTaskStatus(taskId, status, res);
});

module.exports = router;
