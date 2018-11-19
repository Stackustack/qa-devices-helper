const axios = require('axios')

const fetchFreshServiceUserId = async (userMail) => {
    let id = await fetchRequesterUserId(userMail)
    
    if (id) {
        return id
    } else {
        return await fetchAgentUserId(userMail)
    }
}

const fetchRequesterUserId = async (userMail) => {
    const url = process.env.FRESH_SERVICE_DOMAIN + '/itil/requesters.json?query=email%20is%20' + userMail
    const response = await fetchToFreshServiceAPI(url)
    if (response.data[0]) {
        return response.data[0].user.id 
    } else {
        return false
    }
}

const fetchAgentUserId = async (userMail) => {
    const url = process.env.FRESH_SERVICE_DOMAIN + '/agents.json?query=email%20is%20' + userMail
    const response = await fetchToFreshServiceAPI(url)

    if (response.data[0]) {
        return response.data[0].agent.user_id
    } else {
        throw new Error("Couldn't fetch FreshService UserID (using both Requester and Agent endpoints) - might be that FreshService API is down, please try in a while and contact @juni")
    }
}

const fetchToFreshServiceAPI = async (url) => {
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