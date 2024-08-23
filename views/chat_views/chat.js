document.addEventListener('DOMContentLoaded', ()=>{
    const form = document.getElementById('message-form')
    form.addEventListener('submit', handle_message_submit)
    fetch_messages()

    // Getting new messages every 5 sec
    // setInterval(fetch_messages, 5000)
})

function fetch_messages(){
    fetch('http://localhost:3000/get-message',{
        method: 'GET'
    }).then(response=>{
        if(response.ok){
            return response.json()
        }else{
            // Handle different response statuses
            return response.json().then(error=>{
                throw { status: response.status, ...error } // Throw an error with status code and message
            })
        }
    }).then(data=>{
        // console.log(data)
        display_messages(data)
    }).catch(err=>{
        if(err.status === 500){
            alert("Server Error, Error Code: " + err.status)
        }else{
            alert("An unexpected error occurred")
        }
        console.log(err)
    })
}

function display_messages(messages){
    const chat_container = document.getElementById('chat-container')
    chat_container.innerHTML = '' // Clear existing messages

    messages.forEach(message=>{
        const message_element = document.createElement('div')
        message_element.textContent = message.username + ": " + message.message + " (" + message.created_at +")"
        chat_container.appendChild(message_element)
    })
}

function handle_message_submit(event){
    event.preventDefault()

    const message = { message: event.target.message.value }
    //console.log(message)

    fetch('http://localhost:3000/post-message',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(message)
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
        // console.log(data)
        fetch_messages()
    }).catch(err=>{
        if(err.status === 500){
            alert("Server Error, Error Code: " + err.status)
        }else{
            alert("An unexpected error occurred")
        }
        console.log(err)
    })

    //clear the text box
    document.getElementById('message').value = ''
}