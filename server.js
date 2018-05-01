const server = require("express");
const ejs = require("ejs");
const app = server();
const mysql = require("mysql");
const bodyParser = require('body-parser');
const session = require("express-session");

app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.use(session({
    secret: "rfesdthigunkmgjhpuolmd",
    resave: false
}));

const mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "node-js-todo"
});

const tableCreateList = "CREATE TABLE lists(id int not null auto_increment primary key, title text, description text, status boolean)";
const tableCreateUser = "CREATE TABLE users(id int not null auto_increment primary key, userName varchar(15), password varchar(30))";
const addForeignKeyToList = "ALTER TABLE `lists` add `user_id` int unsigned NOT NULL";
const getTodoListAll = "SELECT id,title,description from lists where status is true and user_id = ";

try{
    mysqlConnection.connect();
}catch(exception){
    console.log("Mysql Error:" + exception);
}

app.set("view engine", "ejs");

var prot = function(req, res, next){
    if(undefined == req.session.userID || 
        req.session.userID == false ||
        req.session.userID == "")
        {
            return res.redirect("/");
        }

    next();
}

var protAuth = function(req, res, next){
    if(req.session.userID){
        return res.redirect("/todos");
    }
    next();
}

app.get("/", protAuth, function(req, res){
    res.render("login", {err: false});
});

app.post("/", protAuth, function(req, res){
    mysqlConnection.query("select id, userName from users where username = '" + req.body.userName + "' and password = '" + req.body.password +"'", function (err, result){
        if(err) {
            return res.send('Something went wrong');
        }else{
            if(result.length != 1){
                return res.render("login", {err: "Either the password or user name is wrong, check again!"});
            }
            req.session.userID = result[0].id;
            return res.redirect('/todos');
        }
    });
});

app.get("/register", protAuth, function(req, res){
    return res.render("register");
});

app.post("/user/new", protAuth, function(req, res){
    mysqlConnection.query("insert into users (userName,password) value('" + req.body.userName + "','" + req.body.password +"')", function (err, result){
        if(err) {
            return res.send('Something went wrong');
        }else{
            console.log(result);
            req.session.userID = result.insertId;
            console.log(req.session.userID);
            return res.redirect('/todos');
        }
    });
});



app.get("/todos", prot, function (req, res){
    var todoList;
    mysqlConnection.query(getTodoListAll + req.session.userID, function(err, result){
        mysqlConnection.query("select userName from users where id = " + req.session.userID, function (err, user){
            if(err) return res.send(err);
            res.render("index", {todoList: result, userName: user[0].userName});
        });
    });
});

app.post("/new", prot, function(req, res){
    var query = "INSERT INTO lists (title, status,user_id) value('" + req.body.todo_title+"',1,"+req.session.userID+")"
    mysqlConnection.query(query, function (err, result){
        if(err) throw err;

        return res.redirect("/todos");
    })
});

app.post("/remove/:todoID", prot, function(req, res){
    mysqlConnection.query("update lists set status = 0 where id = " + req.params.todoID, function (err, result){
        if(err) throw err ;

        res.redirect("/");
    })
});

app.get('/logout', function(req, res){
    req.session.userID = false;
    return res.redirect('/');
})

app.get("/install", function(req, res){
    var result;

    mysqlConnection.query(tableCreateList, function(err, res){
        if (err) throw err;
        mysqlConnection.query(tableCreateUser, function (err){
            if(err) throw err;
            mysqlConnection.query(addForeignKeyToList, function(err){
                if(err) throw err;
            })
        })
    });

    res.redirect('/');
});

app.listen(3000, function(){
    this.hostname = 'dev.kraks';
    console.log("Listening on port 3000");
});
