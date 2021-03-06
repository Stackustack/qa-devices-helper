const axios = require('axios')
const { notifySupport } = require('./slackIntegrationUtils')

const fetchFreshServiceUserId = async (userMail) => {
    const login = userMail.split("@")[0]
    const domains = ["netguru.pl", "netguru.co"]
    const possibleMails = domains.map(domain => login + "@" + domain)
    let freshServiceId = null

    freshServiceId = await checkForIdWithPossibleMails(possibleMails, "requester") || await checkForIdWithPossibleMails(possibleMails, "agent")

    if (freshServiceId) {
        return freshServiceId
    } else {
        notifySupport({
            source: userMail,
            shortMessage: `Fresh Service Id not found`,
            longMessage: "_App was not able to get Fresh Service Id for this User -_ `null` _value returned for all possible emails. Might be that users email is not verified or is not set correctly in theirs Fresh Service account._"
        })
        throw new Error("Couldn't get your Fresh Service ID. #Support team has already been notified about your issue, but you can still reach to them directly :)")
    }
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

const fetchUserId = async (userMail, userType) => {
    let url = null

    if (userType === "requester") {
        url = process.env.FRESH_SERVICE_DOMAIN + '/itil/requesters.json?query=email%20is%20' + userMail
    } else if (userType === "agent") {
        url = process.env.FRESH_SERVICE_DOMAIN + '/agents.json?query=email%20is%20' + userMail
    }

    const response = await callToFreshServiceAPI(url)

    if (response.data[0] && userType === "agent") {
        return response.data[0].agent.user_id
    } else if (response.data[0] && userType === "requester") {
        return response.data[0].user.id
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

module.exports = {
    fetchFreshServiceUserId,
}