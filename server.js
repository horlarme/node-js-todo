const server = require("express");
const ejs = require("ejs");
const app = server();
const mysql = require("mysql");
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

const mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "node-js-todo"
});

const tableCreateList = "CREATE TABLE lists(id int not null auto_increment primary key, title text, description text, status boolean)";
const getTodoListAll = "SELECT id,title,description from lists where status is true";

try{
    mysqlConnection.connect();
}catch(exception){
    console.log("Mysql Error:" + exception);
}

app.set("view engine", "ejs");

app.get("/", function (req, res){
    var todoList;
    mysqlConnection.query(getTodoListAll, function(err, result){
        res.render("index", {todoList: result, userName: "Lawal"});
    });
});

app.post("/new", function(req, res){
    var query = "INSERT INTO lists (title, status) value('" + req.body.todo_title+"',1)"
    mysqlConnection.query(query, function (err, result){
        if(err) throw err;

        res.redirect("/");
    })
});

app.post("/remove/:todoID", function(req, res){
    mysqlConnection.query("update lists set status = 0 where id = " + req.params.todoID, function (err, result){
        if(err) throw err ;

        res.redirect("/");
    })
});

app.get("/install", function(req, res){
    var result;

    mysqlConnection.query(tableCreateList, function(err, res){
        result = err ? err : res;
    });

    res.send(result);
});

app.listen(3000, function(){
    this.hostname = 'dev.kraks';
    console.log("Listening on port 3000");
});
