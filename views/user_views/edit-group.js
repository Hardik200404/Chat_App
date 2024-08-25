document.addEventListener('DOMContentLoaded', ()=>{
    // Get the group name
    const group_details = JSON.parse(localStorage.getItem('group_details'))
    const adminId = group_details.admin
    
    const edit_group_form = document.getElementById('edit-group-form')
    const search_form = document.getElementById('search-form')
    const search_query = document.getElementById('search-query')
    const user_list = document.getElementById('user-list')
    const members_list = document.getElementById('members-list')
    
    // Initial display of existing members
    display_existing_members()
    
    // Function to search users based on query
    function search_user(query, type){
        let query_text
        if(type=='phone'){
            query_text = `phone=${query}`
        }else{
            query_text = `email=${query}`
        }

        fetch(`http://localhost:3000/get-user?${query_text}`,{
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
        }).then(user=>{
            // console.log(user)
            display_search_results(user)
        }).catch(err=>{
            if(err.status === 500){
                alert("Server Error, Error Code: " + err.status)
            }else{
                alert("An unexpected error occurred")
            }
            console.log(err)
        })
    }

    // Function to display users in the search results
    function display_search_results(user){
        user_list.innerHTML = '' // Clear previous results
        
        const li = document.createElement('li')
        li.textContent = `${user.username} - ${user.email} - ${user.phone}`
        
        // Create an "Add" button
        const add_btn = document.createElement('button')
        add_btn.textContent = 'Add'
        add_btn.onclick = () => add_user_to_group(user)
        
        li.appendChild(add_btn)
        user_list.appendChild(li)
    }

    // Function to add a user to the group
    function add_user_to_group(user){
        user = { 
            groupId: JSON.parse(localStorage.getItem('group_details')).id,
            userId: user.id 
        }

        fetch('http://localhost:3000/add-user',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)
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
            user_list.innerHTML = '' // Clear result
            // Show updated members list
            display_existing_members()
        }).catch(err=>{
            if(err.status === 500){
                alert("Server Error, Error Code: " + err.status)
            }else if(err.status === 403){
                alert("User Already A Member, Error Code: " + err.status)
            }else{
                alert("An unexpected error occurred")
            }
            console.log(err)
        })
    }

    // Function to display existing members
    function display_existing_members(){
        members_list.innerHTML = '' // Clear previous members
        const groupId = group_details.id
        fetch(`http://localhost:3000/get-members?groupId=${groupId}`,{
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
        }).then(existing_members=>{
            // console.log(data)
            existing_members.forEach(member=>{
                const li = document.createElement('li')
                
                if(member.id == adminId){
                    li.textContent = member.username + ' ( ' +member.phone + ' ) ' + String.fromCodePoint(0x1F451)
                }else{
                    li.textContent = member.username + ' ( ' +member.phone + ' )'
                    
                    const del_btn = document.createElement('button')
                    del_btn.innerHTML = `<i class="fa-solid fa-xmark"></i>`
                    del_btn.onclick = () => remove_user(member.id)
                    li.appendChild(del_btn)
                }
                members_list.appendChild(li)
            })
        }).catch(err=>{
            if(err.status === 500){
                alert("Server Error, Error Code: " + err.status)
            }else{
                alert("An unexpected error occurred")
            }
            console.log(err)
        })
    }

    // Handle search form submission
    search_form.addEventListener('submit', event=>{
        event.preventDefault()
        const query = search_query.value.trim()
        if(query){
            const type = query_type(query)
            if(type=='unknown'){
                alert('Please Enter Either Email Or Phone')
                return
            }
            search_query.value = ''// Clear search bar
            const results = search_user(query, type)
            // console.log(results)
        }
    })


    function remove_user(userId){
        fetch(`http://localhost:3000/remove-user?groupId=${group_details.id}&userId=${userId}`,{
            method: 'DELETE'
        }).then(response=>{
            alert('User Has Been Removed From Group')
            window.location.reload()
        }).catch(err=>{
            if(err.status === 500){
                alert("Server Error, Error Code: " + err.status)
            }else{
                alert("An unexpected error occurred")
            }
            console.log(err)
        })
    }
    
    // Function to check if the query is an email or phone number
    function query_type(query) {
        const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const phone_regex = /^\+?[1-9]\d{1,14}$/ // Basic international phone number validation

        if(email_regex.test(query)){
            return 'email'
        }else if(phone_regex.test(query)){
            return 'phone'
        }else{
            return 'unknown'
        }
    }

    // Fill the input feilds with existing values
    const group_name_input = document.getElementById('group-name-input')
    group_name_input.value = group_details.group_name
    const group_desc_input = document.getElementById('group-desc-input')
    group_desc_input.value = group_details.group_desc

    edit_group_form.addEventListener('submit', event=>{
        event.preventDefault()

        const data_to_insert = {
            group_name: group_name_input.value,
            group_desc: group_desc_input.value
        }
        
        fetch(`http://localhost:3000/update-group?groupId=${group_details.id}`,{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data_to_insert)
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
            alert('Group Updated')
            localStorage.setItem('group_details', JSON.stringify({
                id: group_details.id,
                group_name: data_to_insert.group_name,
                group_desc: data_to_insert.group_desc,
                admin: group_details.admin
            }))
            window.location.reload()
        }).catch(err=>{
            if(err.status === 500){
                alert("Server Error, Error Code: " + err.status)
            }else{
                alert("An unexpected error occurred")
            }
            console.log(err)
        })
    })
})