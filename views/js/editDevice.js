// SELECTORS
const saveButton = jQuery('#save_changes_button')
const goBack = jQuery('#go_back')
const redirectToLogsButton = jQuery('#redirect_to_logs')

// INITIALIZE DROPDOWN 
$(".ui.selection.dropdown").dropdown()

saveButton.on('click', (data) => {
    const codeName      = jQuery('#codeName')[0].value
    const brand         = jQuery('#brand')[0].value
    const model         = jQuery('#model')[0].value
    const deviceType    = jQuery('#deviceTypeSelected')[0].textContent
    const osType        = jQuery('#osTypeSelected')[0].textContent
    const osVersion     = jQuery('#osVersion')[0].value
    const notes         = jQuery('#notes')[0].value

    const deviceData = [{
        codeName,
        brand,
        model,
        deviceType,
        osType,
        osVersion, 
        notes,
    }]

    const deviceDataJson = JSON.stringify(deviceData)

    const XHR = new XMLHttpRequest()

    XHR.addEventListener('load', function(event) {
        alert('Device has been successfully updated :)');
    })

    XHR.addEventListener('error', function(event) {
      alert('Oups! Something went wrong.');
    })

    XHR.open('POST', 'https://qa-devices-helper.herokuapp.com/api-v1/devices');
    XHR.setRequestHeader('Content-Type', 'application/json');
    XHR.send(deviceDataJson, (req, res) => {
        console.log(res)
    })

    window.location.href = '/devices';
    
})

goBack.on('click', () => {
    window.location.href = '/devices'; 
})

redirectToLogsButton.on('click', () => {
    window.location.href +=  '/log'
})

