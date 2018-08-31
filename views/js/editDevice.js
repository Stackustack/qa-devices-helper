// SELECTORS
const saveButton = jQuery('#save_changes_button')
const goBack = jQuery('#go_back')
const redirectToLogsButton = jQuery('#redirect_to_logs')
const form = $('.ui.form')
const deviceId = $('#deviceForm')[0].attributes['device-id'].value 

// INITIALIZE DROPDOWN 
$(".ui.selection.dropdown").dropdown()

saveButton.on('click', (data) => {
    if (formValid()) {
        let deviceData = fetchFormValues()

        data = {
            deviceData: {
                ...deviceData,
                deviceId: deviceId
            },
            actionType: 'edit'
        }

        axios.post('/api-v1/devices', [data])
            .then(res => {
                alert('Device edited')
                window.location.href = '/devices';
            })
            .catch(e => {
                alert('Something went terribly wrong xD Please contact @juni')
            })
    }
})

goBack.on('click', () => {
    window.location.href = '/devices';
})

redirectToLogsButton.on('click', () => {
    window.location.href += '/log'
})

function fetchFormValues() {
    return form.form('get values')
}

function formValid() {
    return form.form('is valid')
}