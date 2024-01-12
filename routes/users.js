const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const pg = require('pg');
var session = require('express-session');


const config = {
    user: 'unpxabwm',
    host: 'cornelius.db.elephantsql.com',
    database: 'unpxabwm',
    password: '68kEazJIWTsalKOa6DTh82FUD-OBLgBV',
    port: 5432,
    max: 100,
    idleTimeoutMillis: 3000,
};

const pool = new pg.Pool(config);

router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/register', (req, res, next) => {
    res.render('user/register', { title: 'Register' });
});

router.get('/login', (req, res, next) => {
    res.render('user/login', { title: 'Login' });
});

router.get('/logout', (req, res, next) => {
    userData = req.session.user;
    pool.query(
        'UPDATE user_sessions SET logout_time = NOW() WHERE user_id = $1 AND logout_time IS NULL',
        [userData.id]
    );
    //req.session.destroy();
    res.render('user/logout', { title: 'Logout' });
});

router.post('/save-user', async (req, res, next) => {
    try {
        const plainPassword = req.body.password;
        const hashedPassword = await getHashedPassword(plainPassword);

        const userData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hashedPassword,
            age: req.body.age,
        };

        const result = await pool.query(
            'INSERT INTO users(first_name, last_name, email, password, age) VALUES($1, $2, $3, $4, $5) RETURNING id;',
            [
                userData.first_name,
                userData.last_name,
                userData.email,
                userData.password,
                userData.age,
            ]
        );
        userData.user_id = result.rows[0].id;


        req.session.user = userData;
        return res.render('index', {
            title: 'Početna',
            first_name: userData.first_name,
            user_id: userData.user_id,
            projects: [],
            tasks: [],
            events: [],
            notes: [],
        });
    } catch (error) {
        return res
            .render('user/notAuthorized', {
                title: 'Error',
                message: 'Greška!',
                additionalInfo: 'Regristracija nije uspjela.',
            });
    }
});


router.post('/login-user', async (req, res, next) => {
    const plainPassword = req.body.password;

    pool.connect((err, client, done) => {
        if (err) {
            return res.render('user/notAuthorized', {
                    title: 'Error',
                    message: 'Greška!',
                    additionalInfo: 'Greška pri spajanju na bazu!',
                });
        }

        client.query(
            'SELECT ' +
            'users.id, ' +
            'users.first_name, ' +
            'users.last_name, ' +
            'users.email, ' +
            'users.role,  ' +
            'users.age, ' +
            'users.password ' +
            'FROM users ' +
            'WHERE email = $1;',
            [req.body.email],
            async (err, result) => {
                done();
                if (err) {
                    return res.render('user/notAuthorized', {
                            title: 'Error',
                            message: 'Greška!',
                            additionalInfo: 'Greška pri dohvaćanju podataka!',
                        });
                }

                const userData = result.rows[0];

                if (!userData) {
                    return res
                        .render('user/notAuthorized', {
                            title: 'Error',
                            message: 'Greška!',
                            additionalInfo: 'Korisnik nije pronađen.',
                        });
                }

                const hashedPassword = userData.password;
                bcrypt.compare(plainPassword, hashedPassword, function (
                    err,
                    resultCompare
                ) {
                    if (resultCompare) {
                        client.query(
                            'INSERT INTO user_sessions(user_id, login_time)VALUES($1, NOW())',
                            [userData.id]
                        );
                        req.session.user = {
                            id: userData.id,
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            email: userData.email,
                            role: userData.role,
                            age: userData.age,
                            password: userData.password
                        };
                        req.session.save();

                        return res.redirect('/index');
                    } else {
                        return res
                            .render('user/notAuthorized', {
                                title: 'Error',
                                message: 'Greška!',
                                additionalInfo: 'Pogrešna lozinka.',
                            });
                    }
                });
            }
        );
    });
});


const getHashedPassword = async (plainPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
                reject(err);
            } else {
                bcrypt.hash(plainPassword, salt, function (err, hash) {
                    if (err) reject(err);
                    else resolve(hash);
                });
            }
        });
    });
};

module.exports = router;


