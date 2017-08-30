const expect = require('expect');
const { Devices } = require('./devices.js')

describe('Devices', () => {
    let devices = [];

    beforeEach(() => {
        devices = new Devices()
    })

    describe('#all', () => {
        it('should always return array of all devices', () => {
            expect(devices.all()).toBe(devices.devicesList)
        })
    })

    describe('#find(deviceIndex)', () => {
        it('should return correct device if index was found', () => {
            const device = devices.find('T3')

            expect(device).toEqual({
                brand: 'Samsung',
                model: 'Galaxy S3 Neo',
                androidVersion: '4.4.2',
                additionalNotes: 'qa+s3@netguru.pl',
                status: 'Available',
                takenBy: ''
            })
        })

        it('should return Error if deviceIndex was not found', () => {
            const getDevice = () => {
                devices.find('invalid index')
            }

            expect(getDevice).toThrow(/Could not find device/)
        })
    })

    describe('#toggleAvailability(deviceIndex)', () => {
        it('should correctly toggle device state', () => {

            devices.toggleAvailability('T3')
            expect(devices.find('T3').status).toBe('Taken')

            devices.toggleAvailability('T3')
            expect(devices.find('T3').status).toBe('Available')
        })

        it('should return Error if deviceIndex was not found', () => {
            const toggleDevice = () => {
                devices.toggleAvailability('invalid index')
            }

            expect(toggleDevice).toThrow(/Could not find device/)
        })
    })
})