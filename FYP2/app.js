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
var complaints,complainttype,status,user,usetype;

var sqli =function(request, response, next) {
	var sql = "SELECT * FROM complaint;SELECT * FROM complainttype;SELECT * FROM status;SELECT * FROM user LEFT JOIN usertype ON uTypeId = userType ;SELECT * FROM usertype";

	connection.query(sql,[5],function(err,rows){
	    if(err) throw err;
	    if(rows.length>0){
	      complaints=rows[0];
				complainttype=rows[1];
				status=rows[2];
				user=rows[3];
				usertype=rows[4];
	    }else{
	      complaints=null;
				complainttype=null;
				status=null;
				user=null;
				usertype=null;
	    }
	    console.log('refreash dbdbd');
	  }
	);
	return next();
}
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

var formatDate = function (date , format) {
	var months = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
	var d = new Date(date);
	var  month = d.getMonth() ;
	var  day = '' + d.getDate();
	var  year = d.getFullYear();
	var h = date.getHours();
	var m,s;
	if(h<10)
		{h = "0"+h;}
		m = date.getMinutes();
	if(m<10)
		{m = "0"+m;}
		s = date.getSeconds();
	if(s<10)
		{s = "0"+s;}
	if (day.length < 2)
		day = '0' + day;
	if (format==1)
	    return [day,months[month],year ].join('-');
	else if (format==0){
		return ''+day+' '+months[month]+' '+year+' '+h+':'+m+':'+s;
	}
}

var sh_com=function(req,res,next){
  res.render('complaint',{
    tagline: req.session.username,
    complaints:complaints,
		status:status,
		formatDate:formatDate
  });};
var sh_report=function(req,res,next){
	res.render('report',{tagline: req.session.username});};

var sh_users=function(request,response){
	  response.render('userlist',{
			tagline:request.session.username,
			user:user,
			usertype:usertype
		});
	};

var sh_specom = function(request, response) {
	console.log("view complaint");
	 id = request.query.id;

	if (id) {
		connection.query('SELECT * FROM complaint LEFT JOIN user ON complaintUser = userId LEFT JOIN complainttype ON complaintType = comTypeId LEFT JOIN status ON statusId = updateStatus WHERE complaintId = ? ', id , function(error, results, fields) {
		if (error) {
  		return console.error(error.message);}
		 if (results.length>0) {

	      console.log(results[0]);
				console.log("get the complaint",results[0].complaintId);
				console.log(request.query);
				response.render('viewcomplaint' ,{formatDate:formatDate,tagline:request.session.username,qs :id,results:results[0],complainttype:complainttype});
	}});} else {
		console.log("ntg get");
		response.render('complaint');
		response.end();

}};

var user_dlt = function(request, response,next) {
	var userid= request.query.userid;
	console.log("delete sec...");
  console.log(userid);
	connection.query('SELECT * FROM user WHERE userId = ? ', userid , function(error, result, fields) {
			console.log(result);
		if (result.length!=0 ){
			console.log("insert...");
	connection.query('DELETE FROM user WHERE userId=?',userid, function(error, results) {
		if (error) throw error;

			console.log(results.affectedRows + " record deleted");
				return next();

			//response.end();
	});
	}else {
			response.redirect('userlist');
			console.log(" No this id");
	}
	});
};
var user_dtl = function(request, response,next) {//view detailsssss
	var userid= request.query.userid;
	console.log("detailsss sec...");
  console.log(userid);
	connection.query('SELECT * FROM user WHERE userId = ? ', userid , function(error, result, fields) {
			console.log(result);
		if (result.length!=0 ){
			console.log("detailsss...");
			response.render('userlist',
			{tagline:request.session.username,user:user,usertype:usertype,result:result});
	}else {
			response.redirect('userlist');
			console.log(" No this id");
	}
	});
};
var user_reg= function(request, response,next) {

	console.log("reg...");
	//console.log(request.body);
	var name = request.body.name;
	var username = request.body.username;
	var password = request.body.password;
	var unitno = request.body.unitno;
	var usertype = request.body.usertype;
	var gender = request.body.gender;
	var dob = request.body.dob;
	var phone = request.body.phone;
	var email = request.body.email;

connection.query('SELECT * FROM user WHERE userName = ? AND address = ?', [username, unitno] , function(error, result, fields) {
		console.log(result);
	if (result.length==0 ){
		console.log("insert...");
		var record={userName :username,fullName:name, password:password,userType:usertype,gender:gender,dateOfBirth:dob,address:unitno,contactNumber:phone,email:email};
		console.log(record);
		connection.query('INSERT INTO user SET ?',record, function(error, results) {
 		if (error) throw error;
		else {

			console.log(results);
			console.log(results.affectedRows + " record inserted");

				//sh_users();
				return next();
		}
		response.end();
	});
}else {
	console.log("username and unit no have been taken");
	response.redirect('userlist');
	response.end();
}
});
};

var login = function(request, response) {
	console.log("connected wit db");
	//console.log(request.body);
	var username = request.body.username;
	var password = request.body.password;

	if (username && password) {
		connection.query('SELECT * FROM user WHERE userName = ? AND password = ?', [username, password] , function(error, results, fields) {
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

//--- all function to be move to another profiletab


app.set('view engine','ejs');//support ejs engine
app.use('/assets',express.static('assets'));//to load the css file in assets folder
app.use('/image',express.static('image'));//to load the css file in image folder
app.use(session({
	secret: 'secret',
	resave: true,
	key   : 'username',
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
//app.use(session(sess));
//----this section is for nav query
app.use('/auth/*',all);//check session
app.use('/auth',sqli);//1t page call sqli
//app.use('/', router);

app.get('/logout',logout);//clear session
app.get(['/','/login'],clearsess);//clear session and direct page to login
app.get('/auth/complaint',sh_com);//display complaint
app.get('/auth/userlist',sh_users);//display user
app.get('/auth/home',displaymain);//display main
app.post('/auth', urlencodedParser,login);//login function
//app.get('/auth/viewcomplaint',viewcomplaint);//view complaint details
app.get('/auth/viewcomplaint',sh_specom);//view complaint details
app.get('/auth/report',sh_report);//view report details
app.post('/auth/userlist',user_reg,sh_users);//new user Register
//app.post('/auth/userlist',user_dlt);//delete user
app.get('/auth/userlistd',user_dlt,sh_users);//delete user
app.get('/auth/viewuser',user_dtl);//delete user
//port base on the env instead of set manually
var port = process.env.PORT || 3000;
app.listen(port,()=> console.log(`Listening on port ${port}`));

module.exports = app;
