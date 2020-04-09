const sendmail = require('sendmail')()
var sendmailer = require('nodemailer');

const NotificationCenter = require('node-notifier').NotificationCenter;

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

const {exec} = require('child_process');

/**
 * Sends an Text to the prescribed contacts in the file called send_text.sh.
 * @param {} instaDetails 
*/
const sendMail = (instaDetails, emails, debug=false) => {
	let requestSucceeded = instaDetails.success
	if (debug || requestSucceeded) {

	        console.log('=> Sending Text.')

	         let deliveryData = instaDetails.data

	         console.log('=> Yah! Delivery Slot Found.')
                 exec('./send_text.sh');
	    

	} else {
		console.log('=> Skipping Text No Delivery Slot Found.')
	}
}



module.exports = {
    postSystemNotification: postNotification,
    sendMail: sendMail
}
