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

socket.on('retakeDeviceFlow', function (deviceId) {

    retakeModal.modal('setting', 'closable', false)
               .modal('show')

    retakeYesBtn.click(function () {
        return socket.emit('retakeDevice', deviceId)
    })

    retakeNoBtn.click(function () {
        return socket.emit('retakeCanceled', deviceId)
    })

    hideModalAndUnblockDeviceAfterTimeout(socket, deviceId)
})

// Clicking row to emit 'toggle device state'
tBody.on('click', 'tr', (data) => {

    // REFACTOR NEEDED
    // WTF? deviceStatus doesn't return status but some HTML code...
    // this might be 'data.currentTarget.cells[5].textContent' to work (it came during debuging)
    const deviceStatus = data.currentTarget.cells[5].innerHTML

    // HANDLE SITUATION WHEN DEVICE IS BEING RETAKEN AND ITS NOT POSSIBLE TO TAKE IT RIGHT NOW
    if (deviceStatus === 'RETAKE') { return }

    // REFACTOR NEEDED
    // why not just 'deviceCodeName = data.currentTarget.cells[6].textContent'
    // and emit just that?
    const deviceData = {
        deviceIndex: data.currentTarget.cells[0].textContent,
        // deviceCurrentlyTakenBy: data.currentTarget.cells[6].textContent
    }

    socket.emit('toggleDeviceState', deviceData.deviceIndex)
})

function addDeviceDataToTableRow(tr, device) {
    const dataTypes = ['codeName', 'brand', 'model', 'osVersion', 'notes', 'status', 'currentOwner']

    for (dataType of dataTypes) {
      const td = jQuery('<td></td>')

      if (dataType === 'status') {
          setupDeviceStatusCell(td, device)
      } else if (dataType === 'currentOwner') {
          setupDeviceTakenByCell(td, device)
      } else {
          setupOtherTableCell(td, device[dataType])
      }

      tr.append(td)
    }
}

function addAvabilityClassToRow(tr, device) {
    if (device.status === 'Available')      { return tr.addClass('positive') }
    if (device.status === 'Taken')          { return tr.addClass('negative') }
    if (device.status === 'RETAKE')         { return tr.addClass('warning') }

    return console.log('Error: Innapropiate status text')
}

function clearTable() {
    tBody.html('')
}

function populateTable(devices) {
    for (let device of devices) {
      const tr = jQuery('<tr></tr>').attr('id', device.codeName).addClass('center aligned')

      addDeviceDataToTableRow(tr, device)
      console.log(device)
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
    if (deviceStatus === 'RETAKE')          { label.addClass('yellow') }
    if (deviceStatus === 'Available')       { label.addClass('green') }
}

function addCorrectIconToLabel(label, deviceStatus) {
  const handIcon      = jQuery('<i class="hand paper icon"></i>')
  const exchangeIcon  = jQuery('<i class="exchange icon"></i>')
  const spinnerIcon   = jQuery('<i class="asterisk loading icon"></i>')

  if (deviceStatus === 'Available')       { return label.append(handIcon) }
  if (deviceStatus === 'Taken')           { return label.append(exchangeIcon) }
  if (deviceStatus === 'RETAKE')          { return label.append(spinnerIcon) }
}

function setupDeviceStatusCell(tableCell, device) {
  const status = device.status
  const span = jQuery(`<span>${status}</span>`)
  const label = jQuery('<div></div>').addClass('ui label')

  addCorrectIconToLabel(label, status)

  label.append(span)

  addColorToLabel(label, status)

  tableCell.append(label)
}

function setupDeviceTakenByCell(tableCell, device) {
  const deviceStatus = device.status

  if (deviceStatus === 'Taken' || deviceStatus === 'RETAKE') {
      const label = jQuery('<div></div>').addClass('ui image label basic orange')
      const img = jQuery('<img></img>').addClass('ui avatar image').attr('src', device.currentOwner.picture)

      label.append(img).append(device.currentOwner.name)

      tableCell.append(label)
  }
}

function setupOtherTableCell(tableCell, fieldData) {
  tableCell.text(fieldData)
}

function hideModalAndUnblockDeviceAfterTimeout(socket, deviceId) {
    setTimeout(function () {
        retakeModal.modal('hide')
        socket.emit('retakeCanceled', deviceId)
    }, 10000)
}
