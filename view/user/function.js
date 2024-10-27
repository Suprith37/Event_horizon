function makeAjaxCall3(ele) {
    // Use the Fetch API to make a GET request
    // alert("You clicked ajax" + ele);

    console.log(ele);

    fetch(`/${ele}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.First_name);
            addProfile(data);
        })
        .catch(error => console.error('Error:', error));
}

function addProfile(data) {

    var parent = document.getElementsByClassName("menu")[0];
    while (parent.firstChild) {
       parent.removeChild(parent.firstChild);
    }

    Object.entries(data).forEach(([key, value]) => {
        let li = document.createElement('li');
        li.className = 'menue_1';
        li.textContent = value;
        li.style.color = "white";
        li.style.fontSize = "1.3rem";
        parent.appendChild(li);
    });
}


function makeAjax(ele){
    // alert("u loged out")

    fetch(`/${ele}`, {
        method:"POST",
        headers: {
            'Content-Type': 'application/json'
        },

    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data=>{
        // console.log(data);
    })
    .catch((err)=>{console.log("Error : "+err)});


}

/// ----------------  Search bar ------------------


function performSearch() {
    // alert("You are searching")
     const searchInput = document.getElementById('search_bar');
    const keyword = searchInput.value.trim();
    // alert("Input : "+ keyword)
  
    // Make a request to the Express.js server
    fetch('/colleges', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json', 
        'Keyword': keyword,
      },
    })
      .then(response => response.json())
      .then(data => {
        displasearchs(data,searchInput,searchResults);
       
      })
      .catch(error => console.error('Error fetching data:', error));
  }


  function displasearchs(colleges ){
    // Display the results
   // var result = Object.values(data);
   // console.log("result: "+ result);
   const searchInput = document.getElementById('search_bar');
   const searchResults = document.getElementById('searchResults');
   let x = 0;

   var other_col = document.getElementsByClassName("other_col")[0];
   other_col.style.display="none";

   // console.log(" C     : "+data.c);

   // console.log("Data: " + JSON.stringify(data));
   
  
   if ( colleges.length> 0) {

    searchResults.innerHTML = '';
  
     
    
     if(searchInput.value.length >0 && searchInput.value !== ' '){
     colleges.forEach(college => {
   
  
     
       // var len = Object.keys(college).length;
    
       x++;
     

       const link = document.createElement('li');
       const xlink = document.createElement('a');

       var college_sp = college.College_name.split(",");
       xlink.href = `/user_events?q=${college_sp[0]}`
       xlink.style.textDecoration = "none";
       link.appendChild(xlink);
       // link.href = '#';  // Add actual link when available
       link.className = "list-group-item"
       link.id = `li-${x}`
       
      xlink.textContent = college.College_name;
      xlink.style.cursor = "pointer";
       
       searchResults.appendChild(link);
       xlink.onclick =function(){ 
         addInputs(searchResults,college_sp[0], searchInput, false);}
    
     });


     var sl = document.createElement('li');
     sl.className = "list-group-item "
       sl.id = `li-${++x}`
       sl.style.cursor = "pointer";
       // sl.textContent = "Other colleges";
     
       const xlink = document.createElement('a');
       // xlink.href = `/user_events?q=Other_COlleges`
       xlink.style.textDecoration = "none";

       xlink.textContent = "Other Colleges";
       xlink.style.cursor = "pointer";

       sl.appendChild(xlink);
       searchResults.appendChild(sl);
       xlink.onclick = function(){
         addInputs( searchResults,"null", searchInput , true);
        }
       
     searchResults.style.display="block";
     // searchResults.style.display = 'block';
   } else {

   searchResults.innerHTML = '';
   const link = document.createElement('li');
   link.className = "list-group-item"
   link.id = `li+1`
   link.textContent = "Enter Full name of of your college"
 // searchResults.style.display = 'none';

 searchResults.appendChild(link);
 setTimeout(()=>{
   searchResults.style.display = 'none';
 },4000);
searchResults.style.display = 'block';


   }
 }
}
  
function performSearch2() {
    // alert("You are searching")
    const searchInput = document.getElementById('inputEmail33');
    const searchResults = document.getElementById('searchResults');
  
    const keyword = searchInput.value.trim();
    // alert("Input : "+ keyword)

  
    // Make a request to the Express.js server
    fetch('/colleges', {
      method: 'Get',
      headers: {
        'Content-Type': 'application/json',
        'Keyword': keyword,
      },
    })
      .then(response => response.json())
      .then(data => {

        console.log("data : "+data[0]);
        var other_col = document.getElementsByClassName("other_col")[0];
        other_col.style.display="none";
        // Display the results
        // var result = Object.values(data);
        // console.log("result: "+ result);
        console.log("Data: " + JSON.stringify(data));
        let x = 0;
    
        if(searchInput.value.length >0){
        if (data.length > 0) {

           
          searchResults.innerHTML = '';
        
            
          
          
         
          data.forEach(college => {
            x++;
            const link = document.createElement('li');
            // const xlink = document.createElement('a');

           
            // xlink.href = `/user_events?q=${college_sp[0]}`
            // xlink.style.textDecoration = "none";
            // link.appendChild(xlink);
            // link.href = '#';  // Add actual link when available
            link.className = "list-group-item"
            link.id = `li-${x}`
            
        //    xlink.textContent = college.College_name;
           link.textContent = college.College_name;
            link.style.cursor = "pointer";
            

            var college_sp = college.College_name.split(",");
            searchResults.appendChild(link);
            link.onclick = function(){
             
              addInputs( searchResults,college_sp[0], searchInput, false);
             }
          
          });
          
         
          var sl = document.createElement('li');
          sl.className = "list-group-item "
            sl.id = `li-${++x}`
            sl.style.cursor = "pointer";
            sl.textContent = "Other colleges";
          

            searchResults.appendChild(sl);
            sl.onclick = function(){
              addInputs( searchResults,"null", searchInput , true);
             }
            
          searchResults.style.display="block";

        }
      }
        
        else {
          searchResults.innerHTML = '';
            const link = document.createElement('li');
            link.className = "list-group-item"
            link.id = `li+1`
            link.textContent = "Type Full name of of your college and press enter"
          // searchResults.style.display = 'none';

          searchResults.appendChild(link);
          setTimeout(()=>{
            searchResults.style.display = 'none';
          },4000);
        searchResults.style.display = 'block';
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }

  function addInputs( searchResults , col, searchInput , bol){
    // alert("You clicked : "+ele);
    
    // var list = document.getElementById(ele);

    // alert(searchInput.value )
    // alert("B: "+bol);
      // alert(list.textContent)
      if(bol === true){

        // document.getElementsByClassName("all_to")[0].classList.add('blur-background');
       
        // alert("You clicked other")
        var other_col = document.getElementsByClassName("other_col")[0];
        other_col.style.display= "block";
        // other_col.classList.add('no-blur');
 

        var o_inp = document.getElementsByClassName("o_inp")[0];
        var o_btn = document.getElementsByClassName("o_btn")[0];
       
        // o_inp.classList.add('no-blur');
        // o_btn.classList.add('no-blur');

        searchResults.style.display = "none";

        o_btn.addEventListener("click", function(){
          add_coll();
          other_col.style.display= "none";
          addInputs(searchResults,o_inp.value,searchInput,false);
        })
      }
      else{
      if(searchInput.value.length <= 0){
        searchInput.value = '';
      }
      else{
    searchInput.value = col; 
      }
    searchResults.style.display = 'none';
    }
  
      }


     
 
 function add_coll(){


  var aw = document.getElementsByClassName("o_inp")[0].value;
  console.log("ADDED: "+aw);
  alert("You clicked : "+ aw);
  fetch('/add_col', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body :JSON.stringify({ col_nam: aw }),
    
  })
    .then(response => response.json())
    .then(data => {
      console.log(data.mat);
    })

 }

var rr=0;

function calculate(id,targetTime){

  var now = new Date();
  const timeDifference = targetTime - now;
  console.log("TD : "+timeDifference);
  if (timeDifference <= 0) {
      document.getElementById('id').textContent = 'Happy New Year!';
  } else {
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000).toString().padStart(2, '0');

      const ct1 = document.getElementById(id);
     
      if(days >0){
        ct1.textContent = `${days} days`;
      }

      else if(days === 0 && hours > 0){
        ct1.textContent = `$${hours} hrs ${minutes}mins`;
      }
      else if(hours === 0 && days === 0 && minutes > 0) {
        ct1.textContent = `${minutes} mins ${seconds} secs`;
      }
      else{
        ct1.textContent = ``;
      }
     
  }
}

  
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  // });


  // document.addEventListener('DOMContentLoaded', function () {
  //   var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  //   var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  //     return new bootstrap.Tooltip(tooltipTriggerEl, {
  //       customClass: 'custom-tooltip', // Add your custom class here
  //       template: '<div class="tooltip custom-tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  //     });
  //   })
  // });