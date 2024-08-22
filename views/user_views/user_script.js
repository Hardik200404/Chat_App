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

    console.log(user_details)
}