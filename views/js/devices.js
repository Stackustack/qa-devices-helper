const socket = io();

// Selectors
const tBody = jQuery('tbody')
const retakeModal = jQuery('.ui.basic.modal')
const retakeYesBtn = jQuery('#retake_yes_button')
const retakeNoBtn = jQuery('#retake_no_button')
const topMenu = jQuery('#top_menu')

// User data
let user

// Timer
let timeoutForRetake

// Handling Events from server
socket.on('sendUserData', (userData) => {
  user = userData
})

socket.on('updateDevicesList', (devices) => {
    const activeSystemTab = jQuery('#os_submenu .active').attr("active-tab")
    let activeParamTab  = undefined

    if (activeSystemTab === 'ios' || activeSystemTab === 'android') {
      activeParamTab = jQuery('#params_submenu .active')[0].innerText
    }

    clearTable()
    populateTable(devices, activeSystemTab, activeParamTab)
})

socket.on('redirect', function (url) {
    redirectTo(url)
})

socket.on('retakeDeviceFlow', function (deviceId) {

   retakeModal.modal({
                'closable': false,
                onDeny: () => {
                  socket.emit('retakeCanceled', deviceId)
                  clearTimeout(timeoutForRetake)
                },
                onApprove: () => {
                  socket.emit('retakeDevice', deviceId)
                  clearTimeout(timeoutForRetake)
                }
              })
              .modal('show')

    hideModalAndUnblockDeviceAfterTimeout(socket, deviceId)
})

// Clicking row to emit 'toggle device state'
tBody.on('click', 'tr', (data) => {
    const deviceStatus = data.currentTarget.cells[5].textContent

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

// Handling changing Android / Apple / BrowserStack
topMenu.on('click', '#os_submenu a.item', (data => {
  const targetSystem = data.currentTarget.innerText

  // active correct tab and deactive others
  handleTabActivationAndDeactivation(data)

  // show/hide additional tabs (with OS versions) based on choosen system (ios/android) and activate default value (fe 'ALL')
  handleSecondTabRendering(targetSystem)

  // populate choosen system devices (for example browser stack)
  socket.emit('refreshDevicesList')
}))

// Handling changing Android / Apple / BrowserStack
topMenu.on('click', '#params_submenu a.item', (data => {
  handleParamsTabActivationAndDeactivation(data)

  // populate table with devices with correct system (for example KitKat)
  socket.emit('refreshDevicesList')
}))

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

function clearTable() {
    tBody.html('')
}

function populateTable(devices, activeSystemTab, activeParamTab) {
    // Tablets
    if (activeSystemTab === 'tablet') {
      return devices.filter(device => {
        device.deviceType === 'tablet' ? addRowWithDevice(device) : false
      })
    }

    // BrowserStack
    if (activeSystemTab === 'browserstack') {
      return devices.filter(device => {
        device.osType === 'browserstack' ? addRowWithDevice(device) : false
      })
    }

    // all Android devices
    if (activeSystemTab === 'android' && activeParamTab === 'ALL') {
      return devices.filter(device => {
        device.osType === 'android' && device.deviceType !== 'tablet' ? addRowWithDevice(device) : false
      })
    }

    // Android filtered by version
    if (activeSystemTab === 'android') {
      const androidDevices = devices.filter(device => {
        return device.osType === 'android'
      })

      return androidDevices.filter(device => {
        const regexOsShortAndroid = /\d\.\d/
        const shortOsVersion = device.osVersion.match(regexOsShortAndroid)[0]

        activeParamTab.indexOf(shortOsVersion) !== -1 ? addRowWithDevice(device) : false
      })
    }

    // all iOS devices
    if (activeSystemTab === 'ios' && activeParamTab === 'ALL') {
      return devices.filter(device => {
        device.osType === 'ios' && device.deviceType !== 'tablet' ? addRowWithDevice(device) : false
      })
    }

    // iOS filtered by version
    if (activeSystemTab === 'ios') {
      const iosDevices = devices.filter(device => {
        return device.osType === 'ios'
      })

      return iosDevices.filter(device => {
        const regexOsShortiOS = /\d+/
        const shortOsVersion = device.osVersion.match(regexOsShortiOS)[0]

        activeParamTab.indexOf(shortOsVersion) !== -1 ? addRowWithDevice(device) : false
      })
    }

    // My devices tab
    if (activeSystemTab === 'my_devices') {
      return devices.filter(device => {
        if (deviceBelongsToCurrentUser(device,user)) {
          addRowWithDevice(device)
        }
      })
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
    timeoutForRetake = setTimeout(function () {
        retakeModal.modal('hide')
        socket.emit('retakeCanceled', deviceId)
    }, 10000)
}

function handleTabActivationAndDeactivation(data) {
  const tab = data.currentTarget

  $('#os_submenu .active').removeClass('active')
  $(tab).addClass('active')
}

function handleParamsTabActivationAndDeactivation(data) {
  const tabElement    = data.currentTarget

  $('#params_submenu .active').removeClass('active')
  $(tabElement).addClass('active')
}

function addRowWithDevice(device) {
  const tr = jQuery('<tr></tr>').attr('id', device.codeName).addClass('center aligned')

  addDeviceDataToTableRow(tr, device)
  tBody.append(tr)
}

function handleSecondTabRendering(targetSystem) {
  if (targetSystem === 'iOS') {
    $('#params_submenu_android').css('display', 'none')
    $('#params_submenu_ios').css('display', 'unset')
    $('#params_submenu .active').removeClass('active')
    $('#params_submenu_ios div a:first-of-type').addClass('active')
  }

  if (targetSystem === 'Android') {
    $('#params_submenu_android').css('display', 'unset')
    $('#params_submenu_ios').css('display', 'none')
    $('#params_submenu .active').removeClass('active')
    $('#params_submenu_android div a:first-of-type').addClass('active')
  }

  if (targetSystem === 'Tablets') {
    dontDisplaySecondTab()
  }

  if (targetSystem === 'BrowserStack') {
    dontDisplaySecondTab()
  }

  if (targetSystem === 'My devices') {
    dontDisplaySecondTab()
  }
}

function deviceBelongsToCurrentUser(device, user) {
  if (device.status == 'Taken' && device.currentOwner._id === user._id) {
    return true
  } else {
    return false
  }
}

function dontDisplaySecondTab() {
  $('#params_submenu_android').css('display', 'none')
  $('#params_submenu_ios').css('display', 'none')
  $('#params_submenu .active').removeClass('active')
}
