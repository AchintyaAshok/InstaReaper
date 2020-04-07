const notify = require('./notify.js')
const moment = require('moment')
const axios = require('axios').default
const path = require('path')
const fs = require('fs')
const argv = require('yargs')
	.usage('Usage: $0 [options]. Ensure that your instacart cookies are stored in cookies.txt').options({
		'market-name': {
			description: 'Name of the instacart market. Ex. -m fairway-market',
			required: true,
			alias: 'm',
		},
		'poll-every': {
			description: 'How often it should poll. Recommended: 15 seconds or higher. Ex. -p 15',
			required: false,
			number: true,
			default: 30,
			alias: 'p',
		},
		'email-to': {
			description: 'Email addresses comma-separated. Ex. -e foo@gmail.com,bar@gmail.com',
			required: true,
			array: true,
			alias: 'e'
		},
		'debug-emails': {
			description: 'Email debug mode. This will send emails even if no delivery window was found.',
			boolean: true,
			default: false,
			required: false,
			alias: 'de'
		},
		'debug-notifications': {
			description: 'Notification debug mode. Posts notifications even if no deliverey window was found.',
			boolean: true,
			default: false,
			required: false,
			alias: 'dn'
		}
	})
	.argv

// Cookies used by Instacart for request context.
const cookies = fs.readFileSync(`${path.dirname(__filename)}/cookies.txt`, 'utf-8');

/**
 * Reaps data from instacart and identifies open delivery slots.
 */
const checkInstacart = (httpClient) => {
	return new Promise((resolve, reject) => {
		httpClient.get().then((r) => { 
			if (r.status != 200) {
				console.log('Request FAILED');
				reject('Request Failed!')
			} else {
				// parse the data
				// delivery information:
				const topLevelModules = r.data['container']['modules']
				const deliveryModules = topLevelModules.filter((t) => {
					if (t['tracking_params'] && t['tracking_params']['service_type'] == 'delivery') {
						return true
					} else return false
				})
				if (deliveryModules.length == 0) { 
					console.log('No delivery module found.')
					resolve({success: false, data: {}})
				}
				else {
					let deliveryDetails = deliveryModules[0]['data']['service_options']['tracking_params']['delivery_options']
					//console.log(deliveryDetails)
					let openSlots = deliveryDetails.filter((d) => d['available_ind'])
					if (openSlots.length > 0) {
						console.log('Delivery Options discovered!!')
						console.log(openSlots)
						resolve({success: true, data: openSlots})
					} else {
						console.log('No Delivery Option found :(')
						resolve({success: false, data: {}})
					}
				}
			}
		})
	})
}

/**
 * Gets the next time to run.
 * @param {} now 
 * @param {*} pollInterval 
 */
const nextRun = (now, pollInterval) => {
	let nextRunTime = now + (pollInterval * 1000)
	let newNow = Date.now()
	let nextNowDifference = nextRunTime - newNow
	return waitMillis = Math.max(nextNowDifference, 0)
}

/**
 * Main.
 */
const run = () => {	
	const marketName = argv.m
	const emails = argv.e
	const debugEmails = argv.de
	const debugNotifications = argv.dn
	const pollInterval = argv.p

	// Base URL for the instacart delivery api.
	const instacartBaseURL = `https://www.instacart.com/v3/containers/${marketName}/next_gen/retailer_information/content/delivery`

	const httpClient = axios.create({
		baseURL: instacartBaseURL,
		headers: { 'cookie': cookies }
	})

	let now = Date.now()
	let nowMoment = moment(now)

	console.log(`-- Checking @ [${nowMoment.format('dddd, MMMM Do YYYY, h:mm:ss a')}] --`)

	checkInstacart(httpClient)
		.then((result) => {
			notify.postSystemNotification(result, debugNotifications)
			notify.sendMail(result, emails, debugEmails)
		})
		.catch((e) => {
			console.log(e)
		})
		.finally( () => {
			const nextRunWait = nextRun(now, pollInterval)
			if (nextRunWait == 0) {
				run()
			} else {
				setTimeout(() => { run() }, nextRunWait)
			}
		})
}

console.log(argv)
run()
