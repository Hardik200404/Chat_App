document.addEventListener('DOMContentLoaded', ()=>{
    const grp_edit_div = document.getElementById('group-edit-container')
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

    // Check if the user is admin
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
            grp_edit_div.prepend(p_admin)

            // Show group edit button for admin
            const edt_btn = document.createElement('button')
            edt_btn.innerHTML = `Edit Group` + `<i class="fa-solid fa-pencil"></i>`
            edt_btn.onclick = () => window.location.href = 'edit-group.html'
            grp_edit_div.appendChild(edt_btn)
            
            // Show group delete button for admin
            const del_btn = document.createElement('button')
            del_btn.innerHTML = `Delete Group` + `<i class="fas fa-trash-alt"></i></i>`
            del_btn.onclick = () => delete_group(group_details.id)
            grp_edit_div.appendChild(del_btn)
        }
    }).catch(err=>{
        if(err.status === 500){
            alert("Server Error, Error Code: " + err.status)
        }else{
            alert("An unexpected error occurred")
        }
        console.log(err)
    })

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

function delete_group(groupId){
    fetch(`http://localhost:3000/delete-group?groupId=${groupId}`,{
        method: 'DELETE'
    }).then(response=>{
        alert('Group Has Been Removed')
        localStorage.removeItem('group_details')
        window.location.href = '../chat_views/chat_space.html'
    }).catch(err=>{
        if(err.status === 500){
            alert("Server Error, Error Code: " + err.status)
        }else{
            alert("An unexpected error occurred")
        }
        console.log(err)
    })
}