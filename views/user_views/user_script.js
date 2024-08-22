function handle_register(event){
    event.preventDefault()

    let user_details={
        username: event.target.username.value,
        email: event.target.email.value,
        phone: event.target.phone.value,
        password: event.target.password.value
    }
    
    // console.log(user_details)

    fetch('http://localhost:3000/user/register',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_details)
    }).then(response=>{
        console.log(response)
        if(response.status == 403){
            let dynamic_div = document.getElementById('dynamic')
            dynamic_div.innerHTML = "Error: User Already Exists, Error Code: " + response.status
        }else if(response.status == 201){
            window.location.href = "login.html"
        }
    }).catch(err=>{
        console.log(err)
    })
}

function handle_login(event){
    event.preventDefault()

    let user_details={
        email: event.target.email.value,
        password: event.target.password.value
    }

    // console.log(user_details)

    let dynamic_div = document.getElementById('dynamic')

    fetch('http://localhost:3000/user/login',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_details)
    }).then(response=>{
        // Check if response status is successful
        if(response.ok){
            return response.json() // Parse JSON response
        }else{
            // Handle different response statuses
            return response.json().then(error=>{
                throw { status: response.status, ...error } // Throw an error with status code and message
            })
        }
    }).then(data=>{
        // Handle successful login
        dynamic_div.innerHTML = "Logged In Successfully"
        localStorage.setItem("token", data.token)
    }).catch(err=>{
        // Handle errors from previous block
        if (err.status === 401){
            dynamic_div.innerHTML = "Wrong Password, Error Code: " + err.status
        }else if(err.status === 404){
            dynamic_div.innerHTML = "User Not Found, Error Code: " + err.status
        }else if(err.status === 500){
            dynamic_div.innerHTML = "Server Error, Error Code: " + err.status
        }else{
            dynamic_div.innerHTML = "An unexpected error occurred"
        }
        console.error(err)
    })
}