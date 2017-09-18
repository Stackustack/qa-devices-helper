const socket = io();

// Selectors
const tBody = jQuery('tbody')
const retakeModal = jQuery('.ui.basic.modal')
const retakeYesBtn = jQuery('#retake_yes_button')
const retakeNoBtn = jQuery('#retake_no_button')

// Handling Events from server
socket.on('updateDevicesList', (devices) => {
    clearTable()
    populateTable(devices)
})

socket.on('redirect', function (url) {
    redirectTo(url)
})

socket.on('retakeDeviceFlow', function ({ deviceIndex, deviceCurrentlyTakenBy }) {
    socket.emit('reserveDevice', deviceIndex)

    retakeModal.modal('show')

    retakeYesBtn.click(function () {
        return socket.emit('retakeDevice', deviceIndex)
    })

    retakeNoBtn.click(function () {
        return socket.emit('retakeCanceled', deviceIndex)
    })
})

socket.on('ongoingRetakeModal', function() {

})

// Clicking row to emit 'toggle device state'
tBody.on('click', 'tr', (data) => {
    const deviceStatus = data.currentTarget.cells[5].innerHTML

    // HANDLE SITUATION WHEN DEVICE IS BEING RETAKEN
    if (deviceStatus === 'Ongoing RETAKE') { return }

    const deviceData = {
        deviceIndex: data.currentTarget.cells[0].innerHTML,
        deviceCurrentlyTakenBy: data.currentTarget.cells[6].innerHTML
    }

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
    if (device.status === 'Available')      { return tr.addClass('positive') }
    if (device.status === 'Taken')          { return tr.addClass('negative') }
    if (device.status === 'Ongoing RETAKE') { return tr.addClass('warning') }

    return console.log('Error: Innapropiate status text')
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

        if (device.status === 'Ongoing RETAKE') {
          tr.addClass('disabled')
        }

        tBody.append(tr)
    }
}

function redirectTo(url) {
    window.location.href = url;
}
