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
    window.location.href = url;
})

socket.on('showModal', function (data) {
    try {
        const deviceData = {
            deviceIndex: data.currentTarget.cells[0].innerHTML,
            deviceCurrentlyTakenBy: data.currentTarget.cells[6].innerHTML
        }
    } catch(e) {
        console.log('Error while fetching device data when displaying modal, error:', e)
    }

    
    retakeModal.modal('show')

    retakeModal.on('click', retakeYesBtn, function () {
        // TBD
        // socket.emit('toggleDeviceState', deviceData)
    })

    retakeModal.on('click', retakeNoBtn, function () {
        // TBD
        // socket.emit('toggleDeviceState', deviceData)
    })
})

// Clicking row to emit 'toggle device state'
tBody.on('click', 'tr', (data) => {
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