const express = require('express');
const pg = require("pg");
const router = express.Router();
let io = null;


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
router.get('/', async function (req, res) {

    const userData = req.session.user;
    const user_id = userData.id;
    const user_first_name = userData.first_name;
    const user_last_name = userData.last_name;
    const user_email = userData.email;
    const user_age = userData.age;
    const employees = await fetchEmployees();
    const chats = await fetchChats();



    if (!io) {
        io = require('socket.io')(req.connection.server);

        io.on('connection', function (client) {

            client.on('clientMessage', function (message, sender_id, time_sent, first_name, last_name, receiver_id, chat_id){
                io.emit('serverMessage', message, sender_id, time_sent, first_name, last_name);

                pool.query(
                    'INSERT INTO chats (sender_id, receiver_id, message, time_sent, chat_id) VALUES ($1, $2, $3, $4, $5);',
                    [sender_id, receiver_id, message, time_sent, chat_id]
                )
            })

            client.on('show_chat', async function (d){
                const messages = await fetchMessages(d)

                messages.forEach(function (message){
                    io.emit(
                        'serverMessage',
                        message.message,
                        message.sender_id,
                        message.time_sent,
                        message.sender_first_name,
                        message.sender_last_name,
                        );
                })

            })
        });
    }

    res.render('chat', {
        title: 'Poruke',
        user_id: user_id,
        first_name: user_first_name,
        last_name: user_last_name,
        email: user_email,
        age: user_age,
        employees: employees,
        chats: chats,

    });
});


router.post('/newChat', async function(req,res){
    const userId = req.body;

    const result = pool.query(
        'INSERT INTO chats '
    )
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


async function fetchChats() {
    const result = await pool.query(
        'SELECT DISTINCT ON (chats.chat_id) ' +
        'chats.chat_id AS chat_id, ' +
        'chats.sender_id AS sender, ' +
        'chats.receiver_id AS receiver, ' +
        'sender.first_name AS sender_first_name, ' +
        'sender.last_name AS sender_last_name, ' +
        'receiver.first_name AS receiver_first_name, ' +
        'receiver.last_name AS receiver_last_name ' +
        'FROM chats ' +
        'JOIN users AS sender ON chats.sender_id = sender.id ' +
        'JOIN users AS receiver ON chats.receiver_id = receiver.id ' +
        'ORDER BY chats.chat_id; '
    );

    return result.rows.map(row => ({
        chat_id: row.chat_id,
        sender_id: row.sender,
        sender_first_name: row.sender_first_name,
        sender_last_name: row.sender_last_name,
        receiver_id: row.receiver,
        receiver_first_name: row.receiver_first_name,
        receiver_last_name: row.receiver_last_name,


    }));
}


async function fetchMessages(chatId) {
    const result = await pool.query(
        'SELECT ' +
        'chats.chat_id, ' +
        'chats.message, ' +
        'chats.message_id, ' +
        'chats.sender_id, ' +
        'chats.receiver_id, ' +
        'chats.time_sent, ' +
        'sender.first_name AS sender_first_name, ' +
        'sender.last_name AS sender_last_name, ' +
        'receiver.first_name AS receiver_first_name, ' +
        'receiver.last_name AS receiver_last_name ' +
        'FROM chats ' +
        'JOIN users AS sender ON chats.sender_id = sender.id ' +
        'JOIN users AS receiver ON chats.receiver_id = receiver.id ' +
        'WHERE chats.chat_id = $1 ' +
        'ORDER BY chats.time_sent ASC;',
        [chatId]
    );

    return result.rows.map(row => ({
        id: row.chat_id,
        message: row.message,
        message_id: row.message_id,
        sender_id: row.sender_id,
        receiver_id: row.receiver_id,
        time_sent: row.time_sent,
        sender_first_name: row.sender_first_name,
        sender_last_name: row.sender_last_name,
        receiver_first_name: row.receiver_first_name,
        receiver_last_name: row.receiver_last_name,
    }));
}


module.exports = router;
