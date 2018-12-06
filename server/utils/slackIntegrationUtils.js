const axios = require('axios')

const notifySupport = (errorData) => {
	axios({
		method: 'post',
		url: process.env.SLACK_WEBHOOK_URI,
		headers: { 'Content-Type': 'application/json' },
		data: createSlackMessage(errorData)
	})
}


const createSlackMessage = (errorData) => {
	return {
		"attachments": [
			{
				"title": ":pepe_scream: New problem related to QA Device Helper :pepe_scream:",
				"fields": [
					{
						"title": "Error",
						"value": errorData.shortMessage,
						"short": true
					},
					{
						"title": "Caused by",
						"value": errorData.source,
						"short": true
					}, {
						"title": "Details",
						"value": errorData.longMessage,
						"short": false
					}
				],
				"color": "#FA224D"
			}
		]
	}
}

module.exports = {
	notifySupport
}