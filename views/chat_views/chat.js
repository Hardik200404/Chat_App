// Initialize WebSocket connection
const socket = new WebSocket('ws://13.233.233.15:3000')

// Handle WebSocket events
socket.addEventListener('open', ()=>{
    console.log('WebSocket connection established')
})

socket.addEventListener('message', (event)=>{
    // Handle incoming messages
    setTimeout(()=>fetch_messages(), 2000)
})

// Handle WebSocket errors
socket.addEventListener('error', (error)=>{
    console.error('WebSocket Error:', error)
})

// Handle WebSocket close event
socket.addEventListener('close', ()=>{
    console.log('WebSocket connection closed')
})

// Initialize pagination
window.current_page = 1
window.total_pages = 1 // This will be updated once messages are fetched

document.addEventListener('DOMContentLoaded', ()=>{
    fetch_groups()

    const group = localStorage.getItem('group_details')

    if(group){
        // Get group details
        const group_details = JSON.parse(localStorage.getItem('group_details'))
        
        const chat_form_container = document.getElementById('chat-form-container')
        const group_info_container = document.getElementById('group-info-container')
        
        const span_group_name = document.createElement('span')
        span_group_name.id = 'group_name_span'
        span_group_name.style.setProperty('font-size', 'x-large')
        span_group_name.innerHTML = group_details.group_name
        group_info_container.prepend(span_group_name)

        // Check if user is admin
        fetch(`http://13.233.233.15:3000/check-admin?groupId=${group_details.id}&userId=${localStorage.getItem('token')}`,{
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
            if(data.admin){
                // Show user as Admin
                const span_admin = document.createElement('span')
                span_admin.style.setProperty('font-size', 'x-small')
                span_admin.innerHTML = `You Are Admin` + String.fromCodePoint(0x26A1)
                chat_form_container.prepend(span_admin)
            }
            // Show group info button
            const grp_info_btn = document.createElement('button')
            grp_info_btn.id = 'group_info_btn'
            grp_info_btn.style.setProperty('background-color','#9ec6c0')
            grp_info_btn.innerHTML = `Group Info` + `<i class="fa-solid fa-circle-info" style="padding-left: 2px"></i>`
            grp_info_btn.onclick = () => window.location.href = '../user_views/group_info.html'
            group_info_container.appendChild(grp_info_btn)
        }).catch(err=>{
            if(err.status === 500){
                alert("Server Error, Error Code: " + err.status)
            }else{
                alert("An unexpected error occurred")
            }
            console.log(err)
        })

        const form = document.getElementById('message-form')
        form.addEventListener('submit', handle_message_submit)
        fetch_messages()

    }else{
        const chat_container = document.getElementById('chat-container')
        const form_container = document.getElementById('form-container')
        chat_container.innerHTML = 'Select a group'
        form_container.innerHTML = ''
    }
})

function fetch_groups(){
    const userId = localStorage.getItem('token')
    fetch(`http://13.233.233.15:3000/get-groups?userId=${userId}`,{
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
        display_groups(data)
    }).catch(err=>{
        if(err.status === 500){
            alert("Server Error, Error Code: " + err.status)
        }else{
            alert("An unexpected error occurred")
        }
        console.log(err)
    })
}

function display_groups(groups){
    const group_list = document.getElementById('group-container')
    group_list.innerHTML = ''

    const my_groups = document.createElement('span')
    my_groups.innerHTML = 'My Groups'
    my_groups.style.setProperty('color', 'white')
    my_groups.style.setProperty('font-size', 'x-large')
    my_groups.style.setProperty('margin-bottom', '10px')
    group_list.appendChild(my_groups)

    const add_group_btn = document.createElement('button')
    add_group_btn.id = 'add-grp-btn'
    add_group_btn.innerHTML = `New Group  ` + `<i class="fa-solid fa-plus"></i>`
    group_list.appendChild(add_group_btn)

    document.getElementById('add-grp-btn').addEventListener('click', ()=>{
        window.location.href = '../user_views/add_group.html'
    })

    if(groups.length>0){
        groups.forEach((group)=>{
            const group_btn = document.createElement('button')
            group_btn.className = 'group-btns'
            group_btn.style.setProperty('height', '40px')
            group_btn.id = group.id
            group_btn.textContent = group.name
            group_btn.addEventListener('click', function() {
                localStorage.setItem('group_details', JSON.stringify({
                    id: group_btn.id,
                    group_name: group_btn.textContent,
                    group_desc: group.desc,
                    admin: group.admin
                }))
                window.location.reload()
            })
            group_list.appendChild(group_btn) 
        })
    }else{
        alert('Add Or Join A Group')
    }
}

function fetch_messages(){
    const chat_container = document.getElementById('chat-container')
    const group_details = JSON.parse(localStorage.getItem('group_details'))

    fetch(`http://13.233.233.15:3000/get-message?groupId=${group_details.id}&page=${window.current_page}&limit=10`,{
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
        if(data.messages.length > 0){
            display_messages(data.messages.reverse())
            update_buttons()
        }else{
            chat_container.innerHTML = 'No Messages, Try Typing Something'
        }
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

    const prev_btn = document.createElement('button')
    prev_btn.id = 'prev-btn'
    prev_btn.innerHTML = `<i class="fa-solid fa-chevron-up"></i>`
    
    const next_btn = document.createElement('button')
    next_btn.id = 'next-btn'
    next_btn.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`

    const pagination_div = document.createElement('div')
    pagination_div.className = 'pagination'

    pagination_div.appendChild(prev_btn)
    pagination_div.appendChild(next_btn)
    chat_container.appendChild(pagination_div)

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

    //showing day, date and year on top
    const span_date = document.createElement('span')
    span_date.id = 'date'
    const date = messages[0].created_at.slice(0, messages[0].created_at.length - 6)
    span_date.innerHTML = date
    
    chat_container.appendChild(span_date)

    messages.forEach(message=>{
        const time = message.created_at.slice(-5)//extracting only time
        const message_div = document.createElement('div')
        message_div.id = 'message'
        message_div.innerHTML = `
                <span class="username">${message.username}: </span>
                <span class="text">${message.message}</span>
                <span class="timestamp">${time}</span>
            `
        chat_container.appendChild(message_div)
    })
}

function update_buttons() {
    // Enable or disable buttons based on the current page and total pages
    document.getElementById('prev-btn').disabled = window.current_page === window.total_pages
    document.getElementById('next-btn').disabled = window.current_page === 1
}

function handle_message_submit(event){
    event.preventDefault()

    const message = { 
                    message: event.target.message.value, 
                    groupId: JSON.parse(localStorage.getItem('group_details')).id 
                }
    // console.log(message)
    socket.send(JSON.stringify(message))

    fetch('http://13.233.233.15:3000/post-message',{
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
        const input_feild = document.getElementById('input_message')
        input_feild.value = '' // Clear the text box
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