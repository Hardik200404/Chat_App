// Initialize pagination
window.current_page = 1
window.total_pages = 1 // This will be updated once messages are fetched

document.addEventListener('DOMContentLoaded', ()=>{
    const form = document.getElementById('message-form')
    form.addEventListener('submit', handle_message_submit)
    fetch_messages()

    document.getElementById('prev-btn').addEventListener('click', ()=>{
        if (window.current_page < window.total_pages) {
            window.current_page++
            fetch_messages()
        }
    })

    document.getElementById('next-btn').addEventListener('click', ()=>{
        if (window.current_page > 1){
            window.current_page--
            fetch_messages()
        }
    })
})

function fetch_messages(){
    fetch(`http://localhost:3000/get-message?page=${window.current_page}&limit=10`,{
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
        window.total_pages = data.total_pages
        display_messages(data.messages.reverse())
        update_buttons()
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
   
    //showing day, date and year on top
    const h4_date = document.createElement('h4')
    const date = messages[0].created_at.slice(0, messages[0].created_at.length - 6)
    h4_date.innerHTML = date
    
    chat_container.appendChild(h4_date)

    const message_table = document.createElement('table')
    message_table.id = 'messages-table'

    messages.forEach(message=>{
        const time = message.created_at.slice(-5)//extracting only time
        const row = document.createElement('tr')
        row.innerHTML = `
                <td>${message.username + ": "}</td>
                <td>${message.message}</td>
                <td>${time}</td>
            `
        message_table.appendChild(row)
    })
    chat_container.appendChild(message_table)
}

function update_buttons() {
    // Enable or disable buttons based on the current page and total pages
    document.getElementById('prev-btn').disabled = window.current_page === window.total_pages
    document.getElementById('next-btn').disabled = window.current_page === 1
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