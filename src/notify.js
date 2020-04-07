const sendmail = require('sendmail')()
const NotificationCenter = require('node-notifier').NotificationCenter;
const text = require('textbelt');

const notifier = new NotificationCenter({
	withFallback: false,
	customPath: undefined
});

/**
 * Posts a notification to OSX
 * @param {} instaDetails 
 */
const postNotification = (instaDetails, debug=false) => {
	let requestSucceeded = instaDetails.success
	let sendNotification = (debug || requestSucceeded)
	let baseMessage = "Hello! InstaReaper reporting.\n"
	
	if (requestSucceeded) {
		baseMessage += 'Delivery timelsot found! Hurry & Book!'
	} else {
		baseMessage += 'No timeslot was discovered :('
	}

	if (sendNotification) {
		console.log('=> Posting Notification.')
		notifier.notify({
			title: 'InstaReaper',
			message: baseMessage,
			sound: true
		});
	} else {
		console.log('=> Not posting notification.')
	}
}

const sendText = (instaDetails, phoneNumber) => {
	text.send(phoneNumber, 'A sample text message!', 'us', (err) => {
		console.log(err)
	});
}

/**
 * Sends an email to the prescribed contacts.
 * @param {} instaDetails 
 */
const sendMail = (instaDetails, emails, debug=false) => {
	let requestSucceeded = instaDetails.success
	const formattedEmails = emails.join(', ')
	if (debug || requestSucceeded) {
		console.log(`=> Sending email to ${emails}`)
		let deliveryData = instaDetails.data
		sendmail({
			from: 'test-insta@laconik.io',
			to: formattedEmails,
			subject: '[InstaReaper] Instacart Delivery Availability',
			html: `<h1>InstaReaper Details</h1><hr/><h4>Delivery Windows Discovered? ${requestSucceeded}</h4><p>${JSON.stringify(deliveryData)}</p>`,
		  }, (err, reply) => {
			console.log(err && err.stack);
			console.dir(reply);
		});
	} else {
		console.log('=> Skipping email.')
	}
}

module.exports = {
    postSystemNotification: postNotification,
	sendMail: sendMail,
	sendText: sendText
}
