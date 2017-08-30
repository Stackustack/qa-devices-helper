const expect = require('expect');
const { logServer } = require('./utils.js')

describe('Utils methods', () => {
    it('"logServer" prints correct data', () => {
        const str = 'some string'
        const ts = new Date
        const spy = expect.spyOn(console, 'log')        

        logServer(str)
        spy.restore()        
    
        expect(spy).toHaveBeenCalledWith(`[${ts}]: ${str}`)
    })
})