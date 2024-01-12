var express = require('express');
var router = express.Router();
const pg = require("pg");
const {rows} = require("pg/lib/defaults");


const config = {
  user: 'unpxabwm',
  host: 'cornelius.db.elephantsql.com',
  database: 'unpxabwm',
  password: '68kEazJIWTsalKOa6DTh82FUD-OBLgBV',
  port: 5432,
  max: 100,
  idleTimeoutMillis: 3000,
}
const pool = new pg.Pool(config);

router.get('/', async function(req, res) {

  try {

    const projects = await fetchProjects();
    const employees = await fetchEmployeeSessions();
    const allEmployees = await fetchAllEmployees();
    const employeesOnProject = await fetchEmployeesOnProject();
    const tasks = await fetchTasks();
    const taskPercentage = parseInt(await fetchTaskPercentage());
    const userRequests = await fetchUserRequests();
    const usersTimeOnProject = await fetchUsersTimeOnProject();

    res.render('stats', {
      title: 'Statistika',
      projects: projects,
      employees: employees,
      allEmployees: allEmployees,
      employeesOnProject: employeesOnProject,
      tasks: tasks,
      taskPercentage: taskPercentage,
      userRequests: userRequests,
      times: usersTimeOnProject,
    });
  } catch (error) {
    res.send(error)
  }
});

async function fetchTaskPercentage() {
  const date = new Date();
  const day = date.getDate();
    const result = await pool.query(
        'SELECT ' +
        '(SELECT COUNT(id) FROM tasks WHERE EXTRACT(DAY FROM tasks.finish_time) = $1) AS total_tasks, ' +
        '(SELECT COUNT(id) FROM tasks WHERE status = $2) AS active_tasks',
        [day,'aktivan']
    );
  const finishedTasks = parseInt(result.rows[0].total_tasks);
  const activeTasks = parseInt(result.rows[0].active_tasks);


  if(finishedTasks === 0 && activeTasks === 0){
    return 0;
  }else if(finishedTasks > 0 && activeTasks === 0){
    return 100;
  }
  else return (finishedTasks / (finishedTasks + activeTasks)) * 100;

}
async function fetchProjects() {
  const result = await pool.query(
      'SELECT ' +
      'projects.id AS project_id, ' +
      'projects.name AS project_name, ' +
      'projects.start_date AS start_date, ' +
      'projects.end_date AS end_date, ' +
      'projects.about AS about, ' +
      'projects.status AS status, ' +
      'TO_CHAR(projects.start_date, \'DD/MM\') AS formatted_start_date, ' +
      'TO_CHAR(projects.end_date, \'DD/MM\') AS formatted_end_date ' +
      'FROM projects ' +
      'ORDER by projects.end_date DESC; ',
  );
  return result.rows.map(row => ({
    project_id: row.project_id,
    project_name: row.project_name,
    start_date: row.start_date,
    end_date: row.end_date,
    about: row.about,
    status: row.status,
    formatted_start_date: row.formatted_start_date,
    formatted_end_date: row.formatted_end_date,
  }));
}


router.post('/fetchTasksByHour', async function(req,res){

  const time = (new Date(req.body.time))
  const time2 = new Date(time);
  time2.setHours(time.getHours() + 1);
  let data = await fetchTasksByHour(time, time2);

  res.send(data)
});


router.post('/fetchTasksByMonth', async function(req,res){

  const month = req.body.month;
  let data = await fetchTasksByMonth(month);

  res.send(data);
});

async function fetchEmployeeSessions() {
  const result = await pool.query(
      'SELECT ' +
      '    users.id AS user_id, ' +
      '    users.first_name AS users_first_name, ' +
      '    users.last_name AS users_last_name, ' +
      '    SUM( ' +
      '            CASE ' +
      '                WHEN DATE(user_sessions.login_time) = CURRENT_DATE AND user_sessions.logout_time IS NOT NULL THEN ' +
      '                        user_sessions.logout_time - user_sessions.login_time ' +
      '                WHEN DATE(user_sessions.login_time) = CURRENT_DATE AND user_sessions.logout_time IS NULL THEN ' +
      '                        NOW() - user_sessions.login_time ' +
      '                ELSE ' +
      '                    NULL ' +
      '                    END ' +
      '    ) AS total_session_duration ' +
      'FROM users ' +
      'LEFT JOIN user_sessions ON users.id = user_sessions.user_id ' +
      'GROUP BY users.id ' +
      'ORDER BY total_session_duration ASC;',

);
  return result.rows.map(row => ({
    id: row.user_id,
    first_name: row.users_first_name,
    last_name: row.users_last_name,
    activity: row.total_session_duration,
  }));
}
async function fetchTasksByHour(time, time2) {
  const result = await pool.query(
      'SELECT COUNT(id) ' +
      'FROM tasks ' +
      'WHERE tasks.finish_time >= $1 AND tasks.finish_time <= $2',
      [time, time2]
  );
  return result.rows[0].count;
}

async function fetchTasksByMonth(month) {
  const result = await pool.query(
      'SELECT count(id) ' +
      'FROM tasks ' +
      'WHERE EXTRACT(MONTH FROM tasks.finish_time) = $1',
      [month]
  );

  return result.rows[0].count
}

async function fetchUserRequests() {
  const result = await pool.query(
      'SELECT user_requests.text as request ' +
      'FROM user_requests;'
  );

  return result.rows.map(row => row.request);
}


async function fetchUsersOnProject(project_id){
  const result = await pool.query(
      'SELECT' +
      '    users.id AS user_id, ' +
      '    users.first_name AS user_first_name, ' +
      '    users.last_name AS user_last_name ' +
      'FROM ' +
      '    users ' +
      'JOIN ' +
      '    user_projects ON users.id = user_projects.user_id ' +
      'WHERE ' +
      '    user_projects.project_id = $1;',
      [project_id]
  );
  return result.rows.map(row => row.request);
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

async function fetchAllEmployees() {
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

async function fetchUsersTimeOnProject() {
  const result = await pool.query(
      'SELECT ' +
      'user_id, ' +
      'project_id, ' +
      'SUM(time) AS time ' +
      'FROM ' +
      'users_time_on_project ' +
      'GROUP BY ' +
      'user_id, project_id;'
  );
  return result.rows.map(row => ({
    user_id: row.user_id,
    project_id: row.project_id,
    time: row.time,
  }));
}


module.exports = router;
