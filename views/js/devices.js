const socket = io();

// Selectors
const tBody = jQuery('tbody')

// Handling Events from server
socket.on('updateDevicesList', (devices) => {
    tBody.html('')

    for (let deviceIndex in devices) {
        let tr = jQuery('<tr></tr>').attr('id', deviceIndex)

        let td = jQuery('<td></td>').text(deviceIndex)
        tr.append(td)
        
        for (let fieldData in devices[deviceIndex]) {
            td = jQuery('<td></td>').text(devices[deviceIndex][fieldData])
            tr.append(td)
        }
        tBody.append(tr)
    }
})

// Clicking row to emit 'toggle device state'
tBody.on('click', 'tr', (data) => {
    const deviceIndex = data.currentTarget.cells[0].innerHTML
    
    socket.emit('toggleDeviceState', deviceIndex)
})