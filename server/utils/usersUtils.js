const axios = require('axios')

// NEW 
const fetchFreshServiceUserId = async (userMail) => {
    const login = userMail.split("@")[0]
    const domains = ["netguru.pl", "netguru.co"]
    const possibleMails = domains.map(domain => login + "@" + domain)
    let freshServiceId = null

    freshServiceId = await checkForIdWithPossibleMails(possibleMails, "requester") || checkForIdWithPossibleMails(possibleMails, "agent")

    if (freshServiceId) {
        return freshServiceId
    } else {
        throw new Error("Couldn't fetch FreshService UserID (using both Requester and Agent endpoints) - might be that FreshService API is down, please try in a while and contact @juni")
    }
}

const fetchUserId = async (userMail, userType) => {
    let url = null

    if (userType === "requester") {
        url = process.env.FRESH_SERVICE_DOMAIN + '/itil/requesters.json?query=email%20is%20' + userMail
    } else if (userType === "agent") {
        url = process.env.FRESH_SERVICE_DOMAIN + '/agents.json?query=email%20is%20' + userMail
    }

    const response = await callToFreshServiceAPI(url)

    if (response.data[0]) {
        return response.data[0].user.id || response.data[0].agent.user_id
    } else {
        return null
    }
}

const callToFreshServiceAPI = async (url) => {
    const response = await axios({
        method: 'get',
        url,
        auth: {
            username: process.env.FRESH_SERVICE_ADMIN_TOKEN,
            password: 'X'
        }
    }).then(res => {
        return res
    }).catch(e => {
        console.log(e)
    })

    return response
}

const checkForIdWithPossibleMails = async (possibleMails, userType) => {
    let id = null

    for (let mail of possibleMails) {
        id = await fetchUserId(mail, userType)

        if (id) {
            break
        }
    }
    
    return id
}

module.exports = {
    fetchFreshServiceUserId,
}