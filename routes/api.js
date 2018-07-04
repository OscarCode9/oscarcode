const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const mysqlConnection = require('../config/db');
const LocalStrategy = require("passport-local").Strategy;
const deleteEmailByid = require('../controles/deleteEmail');

const getAllEmail = require('../controles/getEmail');

router.delete('/deleteEmailById/:id', async(req, res, next)=> {
  const id = req.params.id;
  const result = await deleteEmailByid(id);
  res.send({
    result
  });
});


router.get('/getAllEmail', async (req, res, next)=> {
  
  const allEmails= await getAllEmail();
  
  res.send({
    result: allEmails
  });



});

router.get("/testUser", async (req, res, next) => {
  const email = req.query.email;
  const password = req.query.password;


  try {
    const connection = await mysql.createConnection(mysqlConnection);
    const sql = `SELECT * FROM Users WHERE email =? AND password=?`;

    const [rows, fields] = await connection.execute(sql, [email, password]);

    let user = rows;

    if (user.length > 0) {
      res.send(user);
    } else {
      res.send({
        user: "th6is user don{'t exist"
      })
    }



  } catch (error) {
    console.log('Error in the connection: ', error);
    return error;
  }
})

module.exports = router;
