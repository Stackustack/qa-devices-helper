const socket = io();

// SELECTORS
const saveButton = jQuery('#select-location-send-button')

// INITIALIZE DROPDOWN 
$('.dropdown').dropdown()

saveButton.on('click', (data) => {
    let location = jQuery('.selected')[0].textContent

    axios.post('/api-v1/set_location', {location})
        .then(res => {
            if (res.status == 200) {
                socket.emit('userLocationUpdate', location)
                window.location.href = '/devices'
            } else {
                alert('Something went wrong ;c Contact @juni plox :)')
            }
        })
        .catch(e => {
            console.log(e)
        })
})