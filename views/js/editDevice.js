// SELECTORS
const saveButton = jQuery('#save_changes_button')
const goBack = jQuery('#go_back')
const redirectToLogsButton = jQuery('#redirect_to_logs')
const form = $('.ui.form')
const deviceId = $('#deviceForm')[0].attributes['device-id'].value 

// INITIALIZE DROPDOWN 
$(".ui.selection.dropdown").dropdown()

// VALIDATION
$('.ui.form')
    .form({
        fields: {
            codeName: 'empty',
            brand: 'empty',
            model: 'empty',
            location: 'empty',

            osType: 'empty',
            osVersion: 'empty',
            deviceType: 'empty',
        }
    });

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
                console.log(e)
                alert('Something went wrong, check console and contact @juni')
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