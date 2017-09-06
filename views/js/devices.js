const socket = io();

// Selectors
const tBody = jQuery('tbody')

// Handling Events from server
socket.on('updateDevicesList', (devices) => {
    clearTable()
    populateTable(devices)
})

socket.on('redirect', function (url) {
    window.location.href = url;
})

// Clicking row to emit 'toggle device state'
tBody.on('click', 'tr', (data) => {
    const deviceData = {
        deviceIndex: data.currentTarget.cells[0].innerHTML,
        deviceCurrentlyTakenBy: data.currentTarget.cells[6].innerHTML 
    }
    console.log(data)

    socket.emit('toggleDeviceState', deviceData)
})

function addDeviceIdToTableRow(tr, deviceIndex) {
    const td = jQuery('<td></td>').text(deviceIndex)
    tr.append(td)
}

function addRestDataToTableRow(tr, device) {
    for (let fieldData in device) {
        td = jQuery('<td></td>').text(device[fieldData])
        tr.append(td)
    }
}

function addAvabilityClassToRow(tr, device) {
    device['status'] === 'Available' ? tr.addClass('positive') : tr.addClass('negative')
}

function clearTable() {
    tBody.html('')
}

function populateTable(devices) {
    for (let deviceIndex in devices) {
        const device = devices[deviceIndex]
        const tr = jQuery('<tr></tr>').attr('id', deviceIndex).addClass('center aligned')

        addDeviceIdToTableRow(tr, deviceIndex)
        addRestDataToTableRow(tr, device)
        addAvabilityClassToRow(tr, device)

        tBody.append(tr)
    }
}