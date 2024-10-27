import express from "express";
import bodyparser from "body-parser";
import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';
import crypto from 'crypto';
import session from 'express-session';
import cron from 'node-cron';
// import fetch from 'node-fetch';
import xlsx from 'xlsx';

import { dirname } from "path";
import { fileURLToPath } from "url";
import { createConnection } from 'mysql';
import dotenv  from "dotenv";


import path from 'path'; 

var __dirname = dirname(fileURLToPath(import.meta.url));


dotenv.config();




const app = express();

const port = process.env.PORT || 3000;
// const hostname = "0.0.0";




app.use(express.static("public"));
app.use(express.static("images"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static("views/user"));

// sid.signature                        signature=session secret
app.use(session({
  secret: 'thismyfirsteverwesite',
  cookie: {
    sameSite:'strict'
  }

}));



// app.use(store_user);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



//  ------------------  Node Mailer  ---------------------
const gmailEmail = process.env.YOUR_EMAIL;
const appPassword = process.env.YOUR_PASSKEY;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Set to true if using port 465 (secure)
    auth: {
        user: gmailEmail,
        pass: appPassword,
}
});


//-------------------------------------------

var con = createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database:"event_horizon",
  });

  // --------------  Multer  -----------------
  const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      // Use path.join to ensure correct path construction across different operating systems
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  });
  const upload = multer({ storage: storage });
  // app.use(upload.single("event_image"));
//   ------------  variable  ------------
let current_user = false;
let current_user_id = -1;


// ---------------------- ^^^^^^^^^^ ----------------------------


// ---------------------- Deleting events all the time  -----------------


const excelPath = `F:\\Practice_Project\\Event_horizon\\EH2-3\\Excel_files\\excelfirst.xlsx`;

cron.schedule('* * * * *',()=>{

  // let c_n1= req.session.user.username;
  // let c2 = req.session.user.user_id;
  // console.log(c_n1+" "+c2);

 

// var sql = `  Select First_name, Email from Sign_up where Sign_up.Id  In (Select User_id from event_registration where  End_date <= CURDATE() and End_time < CURTIME());`;

// con.query(sql, (err,result)=>{
//   if(err) console.log(err);

//   for(var i = 0; i< result.length;i++){

   

//     var htmlContent =`<div><h1>Congragulation ^-^</h1><br></br>
//   <h5>Congragulation ${result[i].First_name}on successfully cmompleting an event .<br></br>
//   Hope You Had Maximum Audience</h5>
// </div>`

//   const RegmailOptions = {
//     from: gmailEmail,  // sender address
//     to:  result[i].Email,  // list of receivers
//     subject: 'Successful Copletion Of Event',  // Subject line
//     // text: 'Hello world? jbhvjv',  // plain text body
//     // html: `<div class="main_mail"><h1>Successfull registered </h1><br>
//     //       <p> Thanq you for Registering <strong> ${result.Event_name} <strong> <p>
//     // <div>`

//     html: htmlContent,
//     attachments: [
//       {
//         filename: 'excelfirst.xlsx',
//         path: excelPath,
//       },
//     ],
  
//   }


//   transporter.sendMail(RegmailOptions, (error, info) => {
//     if (error) {
//         return console.error('Error:', error);
//     }
//     console.log('Message sent:', info.response);
//     console.log("Event completed successfully");
// })

//   }

// })



var sql23 = `
SELECT  r.Id as Id, et.Id as E_id, et.Event_name as Event_name , r.Email as Email from event_registration et join Sign_up r on et.User_id = r.Id 
Where  et.End_date < CURDATE() OR ( et.End_date = CURDATE() AND et.End_time < CURTIME()) ;`


  con.query(sql23 , ( err, result)=>{
    if(err) console.log(err);
    console.log("rt : " + result);

    // for(let i = 0 ; i<rt.length;i++){

    if(result !== undefined && result.length > 0 ){
    result.forEach(event=>{
      const sq56= `

        SELECT 
        er.event_name AS Event_name,
        su.First_name AS First_name,
        su.college_name AS College_name,
        et.tokens AS Event_id,
        er.image_path
     
        FROM 
          event_tokens et
        JOIN  
          Sign_up su ON et.User_id = su.Id  
        JOIN  
          event_registration er ON et.Event_id = er.Id
        WHERE 
          er.Id LIKE '${event.E_id}'
      `;

      con.query(sq56 , (err,resu)=>{
        if(err) console.log(err);

        console.log(`******************\n REsu : ${resu}`)
        if(resu.length>0){
          console.log(`Host excel : email: ${event.Email} : name : ${event.Event_name}`)
          const workbook = xlsx.utils.book_new();
          const worksheet = xlsx.utils.json_to_sheet(resu);
          xlsx.utils.book_append_sheet(workbook, worksheet, `Event1`);
         
          xlsx.writeFile(workbook, excelPath);

          const RegmailOptions = {
            from: gmailEmail,  // sender address
            to:  event.Email,  // list of receivers
            subject: `Successful Copletion Of Event ${resu[0].Event_name}`,  // Subject line
            // text: 'Hello world? jbhvjv',  // plain text body
            // html: `<div class="main_mail"><h1>Successfull registered </h1><br>
            //       <p> Thanq you for Registering <strong> ${result.Event_name} <strong> <p>
            // <div>`
            attachments: [
              {
                filename: 'excelfirst.xlsx',
                path: excelPath,
              },

            ],
          
          }

          transporter.sendMail(RegmailOptions, (error, info) => {
            if (error) {
                return console.error('Error:', error);
            }
            console.log('Message sent:', info.response);
            console.log("Event completed successfully");
        })
        }



      })
    })
  

  
  var sq =`
  DELETE FROM Registration_table 
  WHERE Event_id IN (
    SELECT Id 
    FROM event_registration 
    WHERE End_date < CURDATE() OR (End_date = CURDATE() AND End_time < CURTIME())
  )
  `;
   var sql = `DELETE FROM event_registration 
   WHERE End_date < CURDATE() OR (End_date = CURDATE() AND End_time < CURTIME())`;
  
   var sq3 = `
   DELETE FROM event_tokens 
   WHERE Event_id IN (
     SELECT Id 
     FROM event_registration 
     WHERE End_date < CURDATE() OR (End_date = CURDATE() AND End_time < CURTIME())
   )`;
   con.query(sq,(err,result)=>{
    if(err) console.log(err);
    console.log("Result 1 : "+result);
    console.log("DEleted Registration_table")
    // }

   })
   
   con.query(sq3,(err,result)=>{
    if(err) console.log(err);
    console.log("Result 2 : "+result);
    console.log("DEleted tokens")
    // }

   })

   con.query(sql,(err,result)=>{
    if(err) console.log(err);
    console.log("Result 3 : "+result);
    console.log("DEleted events");

    // else{
      // req.session.user.username= c_n1;
      // req.session.user.user_id = c2;
    // console.log("Succefully deleted events : Event table");
    // }
   })

  }

  })
    
 


  })



//  -----------------  ALL gets  ---------------
app.get("/",(req,res)=>{


    res.redirect("/home");
})


app.get("/home",(req,res)=>{
  
  res.render("home.ejs");
  
})






app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})

app.get("/host",(req,res)=>{
    res.render("user/host.ejs");
})


// -----------------------       Sign up     --------------------------


app.post("/signup",(req,res)=>{
  console.log(req.body);
  var fname = req.body.first_name;
  var lname = req.body.last_name;
  var email = req.body.email;
  var ph = req.body.ph;
  var pass = req.body.pass_inp;
  var cpass = req.body.cpass_inp
  var col_name = req.body.college;

  var cnt='';

  var sq = `select Email from Sign_up where Email Like "${email}"`;
  con.query(sq,(err,result)=>{
    if(err) console.log(err);

    // console.log(result);
    if(result.length>1 ){
      cnt='email';
      res.redirect(`/signup?error=${cnt}`);
      
    }
    else{
      if(pass === cpass){
  

        con.connect((error)=>{
          if(error) console.log(error);
      
        var sql = `Insert Into Sign_up (First_name,Last_name,Phone_number,Email,Password,Confirm_password,College_name) Values (?,?,?,?,?,?,?)`;
    
        con.query(sql,[fname,lname,ph,email,pass,cpass,col_name], (err,result)=>{
          if(err) console.log(err);
          console.log("Success : "+result.insertId);
          current_user_id = result.insertId;
          console.log("password: \n"+result);
          console.log("password: \n"+req.body);
          // res.render("login");
          res.redirect("/login");
    
        })
        
      });
    }

      else{
        // alert("Eneter password correctly")
        cnt='password'
      //  res.render("home.ejs");
      res.redirect("/signup?error=password");
      
      };
        // -----
    }

    // ----
   
  })



});





//  ------------------------  Login  --------------------------
var curr_user_name = '';


app.get("/login",(req,res)=>{
  if(req.session.authorized){
    console.log("session user : "+ req.session.user.username);
    res.redirect(`/user?data=${req.session.user.username}`);
  }
  else{
    res.render("login.ejs");
  }
})

app.post("/login",(req,res)=>{



    console.log("This is login page");
  var email= req.body.lemail;
  var pass = req.body.lpass;

console.log(req.body);
  console.log("req : "+email+" "+pass);

  // con.connect((err)=>{
  //   if(err) console.log(err);

    var sql = `select Id, Email,First_name  , Password from Sign_up where Email Like "${email}" && Password Like "${pass}" Limit 1`;

    con.query(sql,(err,result)=>{
      if(err) console.log(err);
      
      if(result.length <=0){
        console.log("Register first");
        res.redirect("/signup");
      }

     else if(result.length >0){

      // for(var i = 0 ; i<result.length ;i++){
     if(result[0].Email === email && result[0].Password === pass){

      current_user_id = result[0].Id;
      curr_user_name = result[0].First_name;

      var user12 = {
        user_id : result[0].Id,
        username : result[0].First_name,
        user_email : result[0].Email ,

      }
      req.session.user = user12;
      console.log("User Id Log : "+req.session.user.user_id);
      req.session.authorized = true;
    }
  
// -------------------  Login db table  -------------------------

      var sq = `Insert Ignore Into Login_table (User_id) Values (${current_user_id})`

      con.query(sq,(err,result)=>{
        if(err) console.log(err);
        console.log("Successfully Inserted");
      })

// -------------------  ^^^^^^||||||^^^^^^  --------------------------


      // req.session.saveUninitialized = true;
    
        console.log("Successful login "+current_user_id+" name: "+result[0].First_name);
        current_user= true;
        console.log("User  id : "+req.session.user.user_id);


      console.log(current_user," ",current_user_id);
        // res.render("user",{user_name : result[i].Username});
        // res.redirect("/user");
        var Name = result[0].First_name.substring(0,1)+ result[0].First_name.substring(1,result[0].First_name.length).toLowerCase();
        console.log(Name);
        res.redirect(`/user?data=${Name}`);
        
      }

    
   else{
        console.log("Failed login");
        res.redirect("/login");
      }
    })

  })

  
  

  //  -----------------  User  ------------------
  app.get('/original-route', (req, res) => {
    res.redirect('/redirected-route?data=someValue');
  });
  
  // Redirected route
  app.get('/redirected-route', (req, res) => {
    const data = req.query.data;
    res.send(`Received data: ${data}`);
  });


  app.get("/user",(req,res)=>{

    let data= req.query.data;
    console.log("data : "+data);
    res.render("./user/user.ejs",{user_name: data});
  })
  






  //  -----------------  Registration  ------------------

  app.get("/host_reg",(req,res)=>{

  res.render("user/host_reg.ejs");
  })

  app.post("/host_reg",upload.single("event_image"),(req,res)=>{

console.log("This is an Host registration page")
    console.log(req.body);
    console.log(req.file);
  
    var title = req.body.title;
    var type = req.body.type;
    var sd = req.body.start_date;
    var  ed = req.body.end_date;
    var  st = req.body.start_time;
    var  et = req.body.end_time;
    var abt = req.body.about_event;
    var ph  = req.body.phone;
    var location = req.body.location;
    var guest = req.body.guest_names;
    const img_p = req.file.path.replace(/\\/g, '/');
    var clg_name1 = req.body.Clg_name 

    

  
   
  // console.log(req.body+" "+current_user_id);
   
  
    var sql = `Insert Into event_registration(Event_name , Event_type , Start_date , End_date , Start_time , End_time ,College_name, Location, Phone_number, About_event , User_id, image_path, Guest_names) Values (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    var arr=[title,type,sd,ed,st,et,clg_name1,location,ph,abt,current_user_id,img_p, guest];
    console.log("ans : \n");
    for(var i = 0 ; i<arr.length;i++){
  
      console.log(arr[i]);
    }
  
  
    con.query(sql,arr,(err,result)=>{
      if(err) console.log(err);
  
      // var ids = result.insertId;
      console.log("Successful : "+current_user_id);
      
      // res.render("guest");
      // res.redirect("/user");
  
    });

    var sql = `select First_name  from Sign_up where Id = ${req.session.user.user_id}`
    con.query(sql,(err,result)=>{
      if(err) res.redirect("/login");
      var Name = result[0].First_name.substring(0,1)+ result[0].First_name.substring(1,result[0].First_name.length).toLowerCase();
      console.log(Name);
      res.redirect(`/user?data=${Name}`);


    })
  
    
  })
  
  

//---------------------------  Seacrh bar   ----------------------------------------

app.get('/colleges', async (req, res) => {``
const keyword = req.header('Keyword').toLowerCase();

console.log("Index : "+keyword)

var sql = `select DISTINCT(College_name) from Colleges_table where LOWER(College_name) Like "%${keyword}%"`;
  
con.query(sql,(err,result)=>{


  if(err) console.log(err);
console.log("I2 :" +JSON.stringify(result))
// console.log(" REs : "+result);

  res.json(result);


})


 
});


// -----------------  add col ---------------

app.post("/add_col", (req,res)=>{

  console.log(`WHAT : ${req.body.col_nam}`)
  var sql = `Insert INTO colleges_table(college_name) VALUES(${req.body.col_nam})`

  con.query(sql,(err,result)=>{
    console.log("SUccessfully Added college : "+req.body.col_nam);
    res.json({mat :"Added"})
  })

})

//---------------------------  User Events  ----------------------------------------

app.get("/user_events",(req,res)=>{
  console.log(req.query);
  console.log(req.body);

  //------------------------  ALL events --------------------------

  if("All" in req.query){
   
  

 

    
  if(req.query.term === 'Live'){
    var sql = ` 
    SELECT Id, Event_name, Event_type, HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year , HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path,
     'Live' AS event_status , (Select Count(*) from Registration_table r where r.Event_id = er.Id)  As total FROM event_registration er 
WHERE Start_date <= CURDATE() AND (Start_date < CURDATE() OR (Start_date = CURDATE() AND Start_time <= CURTIME())) AND End_date >= CURDATE() AND (End_date > CURDATE() OR (End_date = CURDATE() AND End_time >= CURTIME())) 
   `;
    con.query(sql,(err,result)=>{
      if(err) console.log(err);
    console.log(result);
    
  res.render("user/user_events.ejs", {cards : result,user_name : curr_user_name, check:'false'});
  });
  }

  else if(req.query.term === 'Up_comming'){
    var sql = `
SELECT e.Id, Event_name, Event_type,HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year , HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path
,(select count(*) from Registration_table rr where rr.Event_id = e.Id ) as total ,'Upcoming' AS event_status , 'Registered' as stat FROM event_registration e where  e.Id In ( Select r.Event_id from Registration_table r where r.User_id = ${req.session.user.user_id}) AND (e.Start_date > CURDATE() OR (e.Start_date = CURDATE() AND ( e.Start_time > CURTIME()))) Group by e.Id
UNION 
SELECT e.Id, Event_name, Event_type,HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year, HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path
,(select count(*) from Registration_table rr where rr.Event_id = e.Id ) as total  ,'Upcoming' AS event_status , 'Un-Registered' as stat FROM event_registration e  
where  e.Id Not In ( Select r.Event_id from Registration_table r where r.User_id = ${req.session.user.user_id}) AND ( e.Start_date > CURDATE() OR (e.Start_date = CURDATE() AND ( e.Start_time > CURTIME()))) Group by e.Id
   
`
    con.query(sql,(err,result)=>{
      if(err) console.log(err);
    console.log("Up : \n"+result);
    
  res.render("user/user_events.ejs", {cards : result,user_name : curr_user_name, check:'false'});
  });

}



else if(req.query.term === 'Registered'){
  var sql = `
  SELECT e.Id as Id ,Event_name, Event_type , HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year, Hour(Start_time) as hour, MINUTE(Start_time) as min ,Day(Start_date) as day,MONTHNAME(Start_date) m_name , College_name, About_event, image_path,rr.total as total, 'Registered' AS event_status from event_registration e join Registration_table r On e.id = r.Event_id 
Join (SELECT
  Event_id,count(*) as total
FROM
  Registration_table
GROUP BY
  Event_id
) rr ON e.Id = rr.Event_id 
where r.User_id = ${req.session.user.user_id}
  
Group by e.Id;
  `;
  con.query(sql,(err,result)=>{
    if(err) console.log(err);
  console.log(result);
  
res.render("user/user_events.ejs", {cards : result,user_name : curr_user_name,color:"white",bg:"green", check:'true'});
});
}



else{
  console.log(`User id : ${req.session.user.user_id}`)
  var sql = `
  
WITH RegisteredEvents AS (
  SELECT e.Id as Id, Event_name, Event_type, HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year, HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path
  , (Select Count(*) from Registration_table r where r.Event_id = e.Id ) As total  FROM event_registration e
  JOIN Registration_table r ON e.Id = r.Event_id 
where (e.Start_date > CURDATE() OR (Start_date = CURDATE() AND e.Start_time > CURTIME())) AND r.User_id = ${req.session.user.user_id} Group by e.Id

),
LiveEvents AS (
 SELECT er.Id as Id, Event_name, Event_type, HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year , HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path,
   'Live' AS event_status , (Select Count(*) from Registration_table r where r.Event_id = er.Id) As total FROM event_registration er 
WHERE Start_date <= CURDATE() AND (Start_date < CURDATE() OR (Start_date = CURDATE() AND Start_time <= CURTIME())) AND End_date >= CURDATE() AND (End_date > CURDATE() OR (End_date = CURDATE() AND End_time >= CURTIME())) 

),
UpcomingEvents AS (

  SELECT e.Id as Id, Event_name, Event_type, HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name, Year(End_Date) as E_year, HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path,
  (Select Count(*) from Registration_table r where r.Event_id = e.Id  ) As total FROM event_registration e
WHERE e.Id NOT IN (
    SELECT r.Event_id FROM Registration_table r
    WHERE r.User_id = ${req.session.user.user_id}) AND (e.Start_date > CURDATE() OR (e.Start_date = CURDATE() AND e.Start_time > CURTIME())) Group by e.Id
  
  )
SELECT Id, Event_name, Event_type, E_hour,  E_min,  E_day,  E_m_name, E_year ,hour, min, day, m_name, College_name, About_event, image_path, 'Registered' AS event_status, total , 'Registered' as stat
FROM RegisteredEvents

UNION

SELECT Id, Event_name, Event_type,  E_hour,  E_min,  E_day,  E_m_name, E_year , hour, min, day, m_name, College_name, About_event, image_path, 'Live' AS event_status, total , 'Registered' as stat
FROM LiveEvents

UNION

SELECT Id, Event_name, Event_type, E_hour, E_min, E_day,  E_m_name, E_year , hour, min, day, m_name, College_name, About_event, image_path, 'Upcoming' AS event_status, total ,  'Un-Registered' as stat
FROM UpcomingEvents

ORDER BY day, hour, min;

 `;
 //  LEFT JOIN Registration_table r ON e.id = r.Event_id
//     WHERE r.Event_id IS NULL AND Start_date > CURDATE()
  con.query(sql,(err,result)=>{

    if(err) console.log(err);
  console.log(result);
  // card_d.push(result);
  
  
   
  res.render("user/user_events.ejs", {cards : result,user_name : curr_user_name, check:true ,color:"white",bg:"green"});
  });
  }
}

// --------------------------------  search events  ---------------------------------

  else if( "q" in req.query){
   
    

    if(req.query.term === 'Live'){
    //   var sql = `SELECT Id , Event_name, Event_type , Hour(Start_time) as hour, MINUTE(Start_time) as min ,Day(Start_date) as day,MONTHNAME(Start_date) m_name , College_name, About_event, image_path from event_registration  where College_name Like "%${req.query.q}%" " AND Start_date = CURDATE()`;
    //   con.query(sql,(err,result)=>{
    //     if(err) console.log(err);
    //   console.log(result);
      
    // res.render("user/user_events.ejs", {cards : result,user_name : curr_user_name,set_btn : true});
    // });

    // var sql = `SELECT Id , Event_name, Event_type , Hour(Start_time) as hour, MINUTE(Start_time) as min ,Day(Start_date) as day,MONTHNAME(Start_date) m_name ,
    //  College_name, About_event, image_path ,Count(*) as total, 'Live' AS event_status from event_registration  
    //  where  Start_date <= CURDATE() And End_date >= CURDATE() AND Start_time <= CURTIME() AND End_time >= CURTIME() And  College_name Like "%${req.query.q}%" "
    //  Group by Id;`;

    var sql = ` 
    SELECT Id, Event_name, Event_type, HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year , HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path,
    'Live' AS event_status , (Select Count(*) from Registration_table r where r.Event_id = er.Id)  As total FROM event_registration er 
WHERE Start_date <= CURDATE() AND (Start_date < CURDATE() OR (Start_date = CURDATE() AND Start_time <= CURTIME())) AND End_date >= CURDATE() AND (End_date > CURDATE() OR (End_date = CURDATE() AND End_time >= CURTIME())) AND College_name Like "%${req.query.q}%" ;
  
    `
    con.query(sql,(err,result)=>{
      if(err) console.log(err);
    console.log(result);
    
  res.render("user/user_events.ejs", {cards : result,user_name : curr_user_name, check:'false'});
  });


    }
    else if(req.query.term=== 'Up_comming'){
    //   var sql = `SELECT Id ,Event_name, Event_type , Hour(Start_time) as hour, MINUTE(Start_time) as min ,Day(Start_date) as day,MONTHNAME(Start_date) m_name , College_name, About_event, image_path from event_registration  where College_name Like "%${req.query.q}%" " AND Start_date > CURDATE()`;
    //   con.query(sql,(err,result)=>{
    //     if(err) console.log(err);
    //   console.log(result);
      
    // res.render("user/user_events.ejs", {cards : result user_id : current_user_id,});
    // });
    
    // var sql = `
    // SELECT e.Id, Event_name, Event_type, HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path
    // ,Count(*) as total,'Upcoming' AS event_status FROM event_registration e 
    // where e.Id Not In ( Select r.Event_id from Registration_table r where r.User_id = ${current_user_id}) AND e.Start_date > CURDATE() AND College_name Like "%${req.query.q}%" " 
    // Group by e.Id;`;

    var sql = `
    SELECT e.Id, Event_name, Event_type, HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year , HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path
    ,(select count(*) from Registration_table rr where rr.Event_id = e.Id ) as total ,'Upcoming' AS event_status , 'Registered' as stat FROM event_registration e where  e.Id In ( Select r.Event_id from Registration_table r where r.User_id = ${req.session.user.user_id}) AND (e.Start_date > CURDATE() OR (e.Start_date = CURDATE() AND ( e.Start_time > CURTIME()))) AND College_name Like "%${req.query.q}%"  Group by e.Id
    UNION 
    
    SELECT e.Id, Event_name, Event_type, HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year , HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path
    ,(select count(*) from Registration_table rr where rr.Event_id = e.Id ) as total,'Upcoming' AS event_status , 'Un-Registered' as stat FROM event_registration e where  e.Id Not In ( Select r.Event_id from Registration_table r where r.User_id = ${req.session.user.user_id}) AND ( e.Start_date > CURDATE() OR (e.Start_date = CURDATE() AND ( e.Start_time > CURTIME()))) AND College_name Like "%${req.query.q}%"  Group by e.Id`
      
    con.query(sql,(err,result)=>{
      if(err) console.log(err);
    console.log(result);
    
  res.render("user/user_events.ejs", {cards : result,user_name : curr_user_name, check:'false'});
  });
}
 
  else if(req.query.term === 'Registered'){

  var sql = `SELECT e.Id as Id ,Event_name, Event_type , HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year , Hour(Start_time) as hour, MINUTE(Start_time) as min ,Day(Start_date) as day,MONTHNAME(Start_date) m_name , College_name, About_event, image_path,
  (select count(*) from Registration_table rr where rr.Event_id = e.Id ) as total, 'Registered' AS event_status from event_registration e join Registration_table r On e.id = r.Event_id where r.User_id = ${req.session.user.user_id} AND College_name Like "%${req.query.q}%" 
  Group by e.Id;`;
  con.query(sql,(err,result)=>{
    if(err) console.log(err);
  console.log(result);
  
res.render("user/user_events.ejs", {cards : result,user_name : curr_user_name,color:"white",bg:"green", check:'true'});
});
    }


 else{
  //   var sql = `SELECT Id,  Event_name, Event_type , Hour(Start_time) as hour, MINUTE(Start_time) as min ,Day(Start_date) as day,MONTHNAME(Start_date) m_name , College_name, About_event, image_path from event_registration  where College_name Like "%${req.query.q}%" "`;
  //   con.query(sql,(err,result)=>{
  //     if(err) console.log(err);
  //   console.log(result);
    
  // res.render("user/user_events.ejs", {cards : result}user_id : current_user_id,);
  // });

  var sql = `

  WITH RegisteredEvents AS (
    SELECT e.Id, Event_name, Event_type,HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year , HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path
    ,(select count(*) from Registration_table rr where rr.Event_id = e.Id ) as total  FROM event_registration e
    JOIN Registration_table r ON e.Id = r.Event_id where r.User_id = ${req.session.user.user_id} AND e.Start_date > CURDATE() OR (Start_date = CURDATE() AND e.Start_time > CURTIME()) AND College_name Like "%${req.query.q}%"  Group by e.Id
),
LiveEvents AS (
  SELECT e.Id, Event_name, Event_type, HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year , HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path, (select count(*) from Registration_table rr where rr.Event_id = e.Id ) 
   as total FROM event_registration e
  WHERE Start_date <= CURDATE() AND (Start_date < CURDATE() OR (Start_date = CURDATE() AND Start_time <= CURTIME()))
    AND End_date >= CURDATE() AND (End_date > CURDATE() OR (End_date = CURDATE() AND End_time >= CURTIME())) AND College_name Like "%${req.query.q}%"  Group by Id
 
  
),
UpcomingEvents AS (
  SELECT e.Id, Event_name, Event_type, HOUR(End_time) as E_hour, MINUTE(End_time) as E_min, DAY(End_date) as E_day, MONTHNAME(End_date) as E_m_name,Year(End_Date) as E_year , HOUR(Start_time) as hour, MINUTE(Start_time) as min, DAY(Start_date) as day, MONTHNAME(Start_date) as m_name, College_name, About_event, image_path
  ,(select count(*) from Registration_table rr where rr.Event_id = e.Id ) as total  FROM event_registration e where  e.Id Not In ( Select r.Event_id from Registration_table r where r.User_id = ${req.session.user.user_id}) AND ( e.Start_date > CURDATE() OR (e.Start_date = CURDATE() AND ( e.Start_time > CURTIME()))) AND College_name Like "%${req.query.q}%"  Group by e.Id
    

)
SELECT Id, Event_name, Event_type, E_hour,  E_min,  E_day,  E_m_name, E_year , hour, min, day, m_name, College_name, About_event, image_path, 'Registered' AS event_status, total , 'Registered' as stat
FROM RegisteredEvents

UNION

SELECT Id, Event_name, Event_type, E_hour,  E_min,  E_day,  E_m_name, E_year ,  hour, min, day, m_name, College_name, About_event, image_path, 'Live' AS event_status, total , 'Registered' as stat
FROM LiveEvents

UNION

SELECT Id, Event_name, Event_type, E_hour,  E_min,  E_day,  E_m_name, E_year ,  hour, min, day, m_name, College_name, About_event, image_path, 'Upcoming' AS event_status, total ,  'Un-Registered' as stat
FROM UpcomingEvents

ORDER BY day, hour, min;
 `;

  con.query(sql,(err,result)=>{

    if(err) console.log(err);
  console.log(result);
  // card_d.push(result);
  
  
 
  res.render("user/user_events.ejs", {cards : result,user_name : curr_user_name, check:true ,color:"white",bg:"green"});
  });



  }
}

});

// --------------------  Register  ---------------------

app.post("/Reg",(req,res)=>{
  const token = crypto.randomBytes(32).toString('hex');
  const event_id = req.body.event_id;
  const url = req.body.url;

  console.log("reg:-\n");
    console.log(event_id);
    console.log(url);
    console.log(token);

    // const htmlFilePath = 'index.html';
// var htmlContent = fs.readFileSync(htmlFilePath, 'utf8');




var sq13 = `Insert into Registration_table(Event_id,User_id) Values (?,?);`;

con.query(sq13,[event_id, current_user_id],(err,result)=>{
  if(err) console.log(err);
  console.log("Successfully inserrted Event In Registration");
})


  //---------------  mailing section  ---------------------

  var sql12 = `select id ,Event_name , image_path from event_registration where id =  ${event_id}`;
  con.query(sql12 , (err,result)=>{
    console.log(result);
    console.log("Event_name : "+ result[0].Event_name);
    console.log(token);
    console.log(req.session.user);
    console.log("Email: "+req.session.user.user_email);

    

  
    
    var sq12 = `Insert into event_tokens(User_id , Event_id, tokens) Values (?,?,?);`;

        con.query(sq12,[req.session.user.user_id,result[0].id, token.substring(0,8)],(err,result)=>{
          if(err) console.log(err);
          console.log("Successfully inserted tokens");
        })

  var htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
      <link rel="stylesheet" href="st.css" />
  </head>
  <body>
      <div class="main">
     
          <div class="card" style="width: 20rem; border-color:black">
              <img src=${result[0].image_path}class="card-img-top" alt="...">
              <div class="card-body">
                <strong class="card-text">Event : ${result[0].Event_name}</strong>
                <strong class="card-title">Id   : ${token.substring(0,8)}</strong><br>
               
                
              </div>
            </div>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
  </body>
  </html>`

 

  // fs.writeFileSync('index.html', htmlContent);


 
    const RegmailOptions = {
      from: gmailEmail,  // sender address
      to:  req.session.user.user_email,  // list of receivers
      subject: 'Successful registration',  // Subject line
      // text: 'Hello world? jbhvjv',  // plain text body
      // html: `<div class="main_mail"><h1>Successfull registered </h1><br>
      //       <p> Thanq you for Registering <strong> ${result.Event_name} <strong> <p>
      // <div>`

      html: htmlContent,
    
    }

    transporter.sendMail(RegmailOptions, (error, info) => {
      if (error) {
          return console.error('Error:', error);
      }
      console.log('Message sent:', info.response);

      var sql = `Insert Into Registration_table(Event_id, User_id) Values(?,?)`;
    con.query(sql,[event_id,req.session.user.user_id],(err,result)=>{
      if(err) console.log(err);

      console.log("successfullY Registered : "+event_id+" "+req.session.user.user_id);

    })
    res.send({ m: event_id + " is Registered" });
  });
  
  //      Object.entries(placeholders).forEach(([placeholder, value]) => {
  //     htmlContent = htmlContent.replace( value, new RegExp(placeholder, 'g'));
  // });

  });



  //----------------------------------------------------------

 

    
})

// -------------------  Profile  ------------------------------------------

app.get('/Profile_btn',(req,res)=>{

  var sql = `select CONCAT(SUBSTRING(First_name,1,1),Lower(SUBSTRING(First_name, 2,LENGTH(First_name))) ," ", Last_name), College_name, Email ,Phone_number , CONCAT((select Count(*) from Registration_table Where User_Id =${req.session.user.user_id} Group By User_Id )," Registered Events") from Sign_up where Id = ${req.session.user.user_id} `
  con.query(sql,(err,result)=>{
    if(err) console.log(err);
console.log(result[0]);
    res.json(result[0]);
  })
})

// ----------------------  LOgout  ----------------------------------
app.post("/logout",(req,res)=>{
  
  var sql = `DELETE FROM Login_table where User_id = ${req.session.user.user_id}`;
  con.query(sql,(err,result)=>{
    if(err) console.log(err);
    console.log("Successfully deleted user: "+req.session.user.user_id)
    current_user_id=-1;
    curr_user_name=" ";
    current_user=false;
    req.session.destroy();
    // res.json("Successfully deleted")
    res.redirect("/home");
  })
})


app.listen(port,(err)=>{
  if(err) console.log(err);

  console.log(`App starting at http://localhost:${port}/`);
});


