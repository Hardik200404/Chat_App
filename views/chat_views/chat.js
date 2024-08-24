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
        
        const h2_group_name = document.createElement('h2')
        h2_group_name.innerHTML = group_details.group_name
        group_info_container.prepend(h2_group_name)

        // Check if user is admin
        fetch(`http://localhost:3000/check-admin?groupId=${group_details.id}&userId=${localStorage.getItem('token')}`,{
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
                const p_admin = document.createElement('p')
                p_admin.innerHTML = 'You Are The Admin'+ String.fromCodePoint(0x26A1)
                chat_form_container.prepend(p_admin)

                // Show group edit button
                const edt_btn = document.createElement('button')
                edt_btn.innerHTML = `Edit Group` + `<i class="fa-solid fa-pencil"></i>`
                edt_btn.onclick = () => window.location.href = '../user_views/edit-group.html'
                group_info_container.appendChild(edt_btn)
            }
            // Show group info button
            const grp_info_btn = document.createElement('button')
            grp_info_btn.innerHTML = `Group Info` + `<i class="fa-solid fa-circle-info"></i>`
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
    }else{
        const chat_container = document.getElementById('chat-container')
        const form_container = document.getElementById('form-container')
        chat_container.innerHTML = 'Select a group'
        form_container.innerHTML = ''
    }

    document.getElementById('add-grp-btn').addEventListener('click', ()=>{
        window.location.href = '../user_views/add_group.html'
    })
})

function fetch_groups(){
    const userId = localStorage.getItem('token')
    fetch(`http://localhost:3000/get-groups?userId=${userId}`,{
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
    const group_list = document.getElementById('group-list')
    group_list.innerHTML = ''

    if(groups.length>0){
        groups.forEach((group)=>{
            const group_btn = document.createElement('button')
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
        group_list.innerHTML = 'Add A Group'
    }
}

function fetch_messages(){
    const group_details = JSON.parse(localStorage.getItem('group_details'))
    fetch(`http://localhost:3000/get-message?groupId=${group_details.id}&page=${window.current_page}&limit=10`,{
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

    if(messages.length>0){
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
    }else{
        chat_container.innerHTML = 'No Messages, Try Typing Something'
    }
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