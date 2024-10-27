//-------------------------  Sign Up  section  -----------------------
// alert("You clicked err")
const errorMsg = new URLSearchParams(window.location.search).get('error');
// alert(errorMsg);
      if (errorMsg ==='email') {
        // Display error message and highlight form fields with red border
        alert( "User Already Registered" + " try other email");
        
      }
      else if(errorMsg === 'password'){
        alert("Enter password correnctly")
      }
 
