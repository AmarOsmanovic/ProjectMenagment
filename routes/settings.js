var express = require('express');
const pg = require("pg");
const bcrypt = require("bcrypt");
const saltRounds = 10;
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
            const user_role = userData.role;


            res.render('settings', {
                title: 'Postavke računa',
                user_id: user_id,
                first_name: user_first_name,
                last_name: user_last_name,
                email: user_email,
                age: user_age,
                role: user_role,
            });
        } catch (error) {

            return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});

        }
    });

router.post('/update-user', async function(req, res, next) {
    const userData = req.body;
    try {
        if(userData.password === ''){
            pool.query(
                'UPDATE users SET first_name = $1, last_name = $2, email = $3, age = $4 WHERE id = $5;',
                [userData.first_name, userData.last_name, userData.email, userData.age, userData.id]
            )

        }else{
            const plainPassword = req.body.password;
            const hashedPassword = await getHashedPassword(plainPassword);

            pool.query(
                'UPDATE users SET first_name = $1, last_name = $2, email = $3, password = $4,  age = $5 WHERE id = $6;',
                [userData.first_name, userData.last_name, userData.email, hashedPassword,  userData.age, userData.id]
            )
        }
    } catch (error) {

        return res.render('user/notAuthorized', {title: 'Error', message: 'Greška!', additionalInfo: 'Greška pri spajanju na bazu!'});

    }
    setTimeout(() => {
        return res.render('user/login', {title: 'Login'})
    }, 1000);

});

const getHashedPassword = async (plainPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
                reject(err)
            } else {
                bcrypt.hash(plainPassword, salt, function (err, hash) {
                    if (err)
                        reject(err)
                    else
                        resolve(hash)
                });
            }

        });
    })

}
module.exports = router;