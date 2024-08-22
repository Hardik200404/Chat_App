function get_date_time(){
    const dateTimeObject = new Date()

    let date = dateTimeObject.toDateString()

    let time = dateTimeObject.toTimeString()
    time = time.split(":")
    time = time[0]+":"+time[1]

    return date +' '+ time
}

module.exports = get_date_time