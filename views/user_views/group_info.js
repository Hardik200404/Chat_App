document.addEventListener('DOMContentLoaded', ()=>{

    const grp_name = document.getElementById('group-name-container')
    const grp_desc = document.getElementById('group-desc-container')
    const members_list = document.getElementById('members-list')

    const group_details = JSON.parse(localStorage.getItem('group_details'))
    const adminId = group_details.admin
    const groupId = group_details.id
    
    const grp_name_p = document.createElement('p')
    grp_name_p.textContent = 'Group : ' + group_details.group_name
    grp_name.appendChild(grp_name_p)
    
    const grp_desc_p = document.createElement('p')
    grp_desc_p.textContent = 'Description : ' + group_details.group_desc
    grp_desc.appendChild(grp_desc_p)

    members_list.innerHTML = '' // Clear previous members
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
})