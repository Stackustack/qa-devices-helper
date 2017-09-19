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
    if (deviceStatus === 'RETAKE') { return }

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
        const td = jQuery('<td></td>')

        if (fieldData === 'status') {
            const deviceStatus  = device[fieldData]

            const handIcon      = jQuery('<i class="hand paper icon"></i>')
            const exchangeIcon  = jQuery('<i class="exchange icon"></i>')
            const spinnerIcon   = jQuery('<i class="asterisk loading icon"></i>')

            const span = jQuery(`<span>${deviceStatus}</span>`)
            const label = jQuery('<div></div>').addClass('ui label')

            if (device.status === 'Available')       { label.append(handIcon) }
            if (device.status === 'Taken')           { label.append(exchangeIcon) }
            if (device.status === 'RETAKE')          { label.append(spinnerIcon) }

            label.append(span)

            addColorToLabel(label, deviceStatus)

            td.append(label)
        } else if (fieldData === 'takenBy') {
            if (device.status === 'Taken' || device.status === 'RETAKE') {
                td.text('')

                const label = jQuery('<div></div>').addClass('ui image label basic orange')
                const img = jQuery('<img></img>').addClass('ui avatar image').attr('src', device.takenBy.currentUserPicture)

                label.append(img).append(device.takenBy.currentUser)

                td.append(label)
            }
        } else {
          td.text(device[fieldData])
        }

        tr.append(td)
    }
}

function addAvabilityClassToRow(tr, device) {
    if (device.status === 'Available')      { return tr.addClass('positive') }
    if (device.status === 'Taken')          { return tr.addClass('negative') }
    if (device.status === 'RETAKE') { return tr.addClass('warning') }

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
        disableRowIfOngoingRetake(tr, device.status)

        tBody.append(tr)
    }
}

function disableRowIfOngoingRetake(tableRow, deviceStatus) {
    if (deviceStatus === 'RETAKE') {
      tableRow.addClass('disabled')
    }
}

function redirectTo(url) {
    window.location.href = url;
}

function addColorToLabel(label, deviceStatus) {
    if (deviceStatus === 'Taken')           { label.addClass('orange') }
    if (deviceStatus === 'RETAKE')  { label.addClass('yellow') }
    if (deviceStatus === 'Available')       { label.addClass('green') }
}
