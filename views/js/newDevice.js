// SELECTORS
const addBtn = jQuery('#add_button')
const goBack = jQuery('#go_back')
const form = $('.ui.form')

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

addBtn.on('click', (data) => {
    if (formValid()) {
        let deviceData = fetchFormValues()

        axios.post('/api-v1/devices', [deviceData])
            .then(res => {        
                alert('Device added')        
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

function formValid() {
    return form.form('is valid')
}

function fetchFormValues() {
    return form.form('get values')
}