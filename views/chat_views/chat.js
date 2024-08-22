document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('message-form')
    form.addEventListener('submit', handle_message_submit)
})

function handle_message_submit(event) {
    event.preventDefault()

    const message = event.target.message.value
    console.log(message)

    //clear the text box
    document.getElementById('message').value = ''
}