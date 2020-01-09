var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var jsonParser = bodyParser.json();
var session = require('express-session');
var path = require('path');
//var file= require('./assets/complaint.js');
var app = express();
var urlencodedParser = bodyParser.urlencoded({extended : false});
var router = express.Router();
var tagline,id,comitem;
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'facility',
	multipleStatements: true
});
//--- all function to be move to another profiletab
var complaints,complainttype;
var sql = "SELECT * FROM complaint;SELECT * FROM complainttype";
connection.query(sql,[2,1],function(err,rows){
    if(err) throw err;
    if(rows.length>0){
      complaints=rows[0];
			complainttype=rows[1];
    }else{
      complaints=null;
			complainttype=null;
    }
    //console.log(rows);
  }
);

var sh_com=function(req,res,next){
  res.render('complaint',{
    tagline: req.session.username,
    complaints:complaints,complainttype:complainttype
  });};
var sh_users=function(request,response){
	  response.render('userlist',{tagline:request.session.username});
	};

var sh_specom = function(request, response) {
	console.log("view complaint");
	//console.log(request.body);
	 id = request.query.id;

	if (id) {

		connection.query('SELECT * FROM complaint WHERE complaintId = ? ', id , function(error, results, fields) {
		 if (results.length > 0) {
	      console.log(results);
				console.log("get the complaint",id);
				console.log(request.query);
				response.render('viewcomplaint' ,{tagline:request.session.username,qs :id,results:results});
	}});} else {
		console.log("ntg get");
		response.render('complaint');
		response.end();

}};
var all =function(request, response, next) {
	//console.log(request.session);
 console.log("usernames session");
 if (request.session.loggedin){
 			console.log("auth function called");
			//pass tag line in every page load
         return next();
     } else{
			 message = "Please login to view this page!";
			 response.redirect('..',401,{message: message});
			 //message cant be display
			 //response.render('..',{message: message},401);
         //return response.sendStatus(401);
     }
};
var login = function(request, response) {
	console.log("connected wit db");
	//console.log(request.body);
	var username = request.body.username;
	var password = request.body.password;

	if (username && password) {
		connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password] , function(error, results, fields) {
      //console.log(results);
      if (results.length > 0) {
				 request.session.loggedin = true;
				 request.session.username = username;

				sess = request.session;
		    if(sess.username) {
					console.log("when login main page display");
					response.render('index',{tagline:request.session.username});
				}
			} else {
				response.render('login' ,{message: "Incorrect Username and/or Password!."});
			}
			response.end();
		});
	} else {
		response.render('login' ,{message: "Please enter Username and Password!."});
		response.end();
	}
};

var logout = function(request,response){//done
    request.session.destroy(function(err) {
        if(err) {
            return console.log(err);
        }
				console.log("detroy the session");
				response.clearCookie('username', { path: '/' });
				//res.send({message:'hii'});
				response.redirect('login');
    });
};
var clearsess= function(request,response){
	request.session.destroy(function(err) {
		if(err) {
				return console.log(err);
		}
	response.clearCookie( {path:'/'});
	//console.log(request.session);
  response.render('login');
})};
var displaymain= function(request, response) {
	if (request.session.loggedin) {
			console.log("main page display");
		response.render('index',{tagline:request.session.username});
	} else {
		message = "Please login to view this page!";
		response.render('login' ,{message: message});
	}
	response.end();
};

var viewcomplaint= function(request, response) {
	console.log(request.query);
		response.render('viewcomplaint' ,{tagline:request.session.username,qs : request.query});

};
//--- all function to be move to another profiletab
