document.addEventListener('DOMContentLoaded', ()=>{
    // Get the group name
    const group_name_h6 = document.getElementById('group-name')
    const group_details = JSON.parse(localStorage.getItem('group_details'))
    group_name_h6.innerHTML = 'Group: '+ group_details.group_name

    const search_form = document.getElementById('search-form')
    const search_query = document.getElementById('search-query')
    const user_list = document.getElementById('user-list')
    const members_list = document.getElementById('members-list')

    // Function to search users based on query
    // function search_users(query){
    //     return users.filter(user=>
    //         user.email.includes(query) || user.phone.includes(query)
    //     )
    // }

    // Function to display users in the search results
    // function display_search_results(users){
    //     user_list.innerHTML = '' // Clear previous results
    //     users.forEach(user=>{
    //         const li = document.createElement('li')
    //         li.textContent = `${user.email} (${user.phone})`
            
    //         // Create an "Add" button
    //         const addButton = document.createElement('button')
    //         addButton.textContent = 'Add'
    //         addButton.onclick = () => add_user_to_group(user)
            
    //         li.appendChild(addButton)
    //         user_list.appendChild(li)
    //     })
    // }

    // Function to add a user to the group
    // function add_user_to_group(user){
    //     // Check if the user is already in the group
    //     if (existing_members.find(member => member.id === user.id)){
    //         alert('User is already a member of the group.')
    //         return
    //     }

    //     // Add the user to the existing members list
    //     existing_members.push({ id: user.id, name: user.email }) // Assuming name is derived from email for demonstration
        
    //     // Update the members list display
    //     display_existing_members()
    // }

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
                li.textContent = member.username + ' ( ' +member.phone + ' )'
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
    // search_form.addEventListener('submit', event=>{
    //     event.preventDefault();
    //     const query = search_query.value.trim()
    //     if (query) {
    //         const results = search_users(query)
    //         display_search_results(results)
    //     }
    // })

    // Initial display of existing members
    display_existing_members()
})
