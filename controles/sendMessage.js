const nodemailer = require('nodemailer');
var mysql = require('mysql');



function sendMensaje(req, res, next) {
  var transporter = nodemailer.createTransport(process.env.DATABASE_URL);


  let mailOptions = {
    from: "'" + req.fields.nombre + "' <" + req.fields.email + ">", // sender address
    to: "oscar.99.tris@gmail.com", // list of receivers
    subject: 'Oscar Code mensaje', // Subject line
    text: req.fields.requerim
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(404).send({
        enviado: "Tu mensaje no se pudo enviar"
      });
    }

    res.status(200).send({
      enviado: "Tu mensaje fue enviado exitosamente"
    });
  });
}

function getCometarios(numero, query) {
  var myQuery = query;
  var conn = mysql.createConnection('mysql://j8zdtysyz41uv9iq:yniktu2ff31goblf@ysp9sse09kl0tzxj.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/wcrk58io9f4zgrff');
  
  const promise = new Promise(function (resolve, reject) {
    conn.query(myQuery, function (err, result) {
      if (err) {
        console.log(err)
        conn.end();
        reject(new Error('No existe un array'))
      } else {
        conn.end();
        resolve(result);
      }
    });
  })
  return promise
}

function QueryPost(req, res, next) {

  const numero = req.query.tagId;
  const postTag = req.query.tagR;
  console.log(postTag);
  
  if (req.query.tagId === undefined) {


    let connection;
    
     connection = mysql.createConnection('mysql://j8zdtysyz41uv9iq:yniktu2ff31goblf@ysp9sse09kl0tzxj.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/wcrk58io9f4zgrff');


    connection.connect();
    connection.query(`select idPost,titulo, 
    contenido_html,likes,urlImg,
    descripcion, 
    DATE_FORMAT(fecha, "%W %M %e %Y") fecha from Post`,
    function (err, rows, fields) {
      if (err){
        connection.end();
        console.log('Error while performing Query.' + err);
      }else{
        connection.query(`select count(idComent) idComment, p.idPost
        from Post p, Comentarios c 
        where p.idPost = c.idPost group by p.idPost`, function (errComm, rowsComm, fieldsComm){
          rows.forEach(function(elemt) {
            rowsComm.forEach(function(elemtComm) {
              if(elemt.idPost === elemtComm.idPost){
                elemt.comment = elemtComm.idComment;
              }
            }, this);
          }, this);
          let comentarios = rows;
          connection.end();
          res.render('blog', {
            title: 'Blog | Oscar Code', comentarios: comentarios
          })
        })
      }
    });
  } else {
    var conn = mysql.createConnection('mysql://j8zdtysyz41uv9iq:yniktu2ff31goblf@ysp9sse09kl0tzxj.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/wcrk58io9f4zgrff');
    
    var sqlQueryComent = `select C.usuarioname, C.urlPerfil, 
            C.contenido,C.likes,C.idPost, CONCAT(DAY(C.fecha), '-',MONTH(C.fecha), '-',year(C.fecha)) as fecha
            from Post P inner join Comentarios C on P.idPost = C.idPost where C.idPost = ${numero} order by C.fecha desc`;

    var sqlQueryNum = `select count(*) as comNum from Post P inner join Comentarios C on P.idPost = C.idPost where C.idPost = ${numero};`

    var sqlQueryPost = `select * from Post where  idPost = ${numero};`

    var comentarios = null;
    var infPost = null;
    var numeroComentario = null;

    getCometarios(numero, sqlQueryComent)
      .then(function (data) {
        console.log(data);
        comentarios = data;
        return getCometarios(numero, sqlQueryPost);
      })
      .then(function (data) {
        console.log(data)
        infPost = data;
        return getCometarios(numero, sqlQueryNum);
      })
      .then(function (data) {
        numeroComentario = Number(data[0].comNum)
      })
      .then(function () {
        if (typeof comentarios !== 'undefined' && comentarios.length >= 0) {
            if(Number(postTag) === 3){
              res.render('1000', {
                helpers: {
                  Frame: function () {
                    return infPost[0].contenido_html;
                  },
                  IdPost: function () {
                    return JSON.stringify(numero);
    
                  },
                  likeTotal: function () {
                    let likes = infPost[0].likes;
                    return likes;
                  }
    
                },
                place_urls: JSON.stringify(numero),
                numeroComentario,
                infPost,
                comentarios,
                title: 'Blog | Oscar Code',
              });
            }else{
              res.render('blogid', {
                helpers: {
                  Frame: function () {
                    return infPost[0].contenido_html;
                  },
                  IdPost: function () {
                    return JSON.stringify(numero);
    
                  },
                  likeTotal: function () {
                    let likes = infPost[0].likes;
                    return likes;
                  }
    
                },
                place_urls: JSON.stringify(numero),
                numeroComentario,
                infPost,
                comentarios,
                title: 'Blog | Oscar Code',
              });
            }
        } else {
          res.render('error');
        }
      })
      .catch(err => {
        console.log(err.message)
        res.render('error', {
          message: err.message
        });
      })
  }

}

function QueryComent(req, res, next) {
  console.log(req.fields)
  const numero = req.query.tagId;
  console.log(numero);
  var usuarioname = req.fields.nombre;
  var contenido = req.fields.contenido;
  sqlQueryComent = `
    INSERT INTO Comentarios ( usuarioname, urlPerfil, contenido,likes,idPost,fecha )
     VALUES ('${usuarioname}','https://www.w3schools.com/howto/img_avatar.png',
      '${contenido}',
       0, ${numero}, sysdate());`;
  getCometarios(numero, sqlQueryComent)
    .then(function (data) {
      console.log(data.insertId)
      res.send({
        numero: 'Gracias por comentar<3',
        data:data.insertId
      });
    })
    .catch(function (e) {
      res.send({
        numero: "Hay un erro interno: " + e,
        error: true
      })
    })
}


module.exports = {
  sendMensaje,
  QueryPost,
  QueryComent
}