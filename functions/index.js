const { google } = require('googleapis');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const cors = require('cors');

const eventsApi = express();
eventsApi.use(cors({ origin: true }));

var key = require('./service_account.json');
const SCOPES = 'https://www.googleapis.com/auth/calendar';

var auth = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  SCOPES,

);


const calendarId = 'primary'
const calendar = google.calendar({ version: "v3", auth: auth });


  eventsApi.get('/', (req, res) => {
    
     calendar.events.list({
      calendarId: calendarId,
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, respon) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = respon.data.items;
      console.log('events : ' + events)
      const bEvent = respon.data;
      if (events.length) {
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          console.log(`${start} - ${event.summary}`);
          // console.log(JSON.stringify(event, null, 2))
          // console.log(JSON.stringify(bEvent, null, 2))
        });
      } else {
        console.log('No upcoming events found.');
      }
    });
    res.send('listOfCalendar')
  });

  eventsApi.post('/', (req, res) => {
    var event = {
      'summary': 'ทดสอบการใช้ google api เชิญเพื่อนด้วย',
      'location': 'Bonmek Co.,Ltd., ตำบล คอหงส์ อำเภอหาดใหญ่ สงขลา 90110 ประเทศไทย',
      'description': 'A chance to hear more about Google\'s developer products.',
      'start': {
        'dateTime': '2020-03-06T12:30:00',
        'timeZone': 'Asia/Bangkok'
      },
      'end': {
        'dateTime': '2020-03-06T13:30:00',
        'timeZone': 'Asia/Bangkok'
      },
      'attendees':[
        { 'email': '5910110423@psu.ac.th' }
      ]
    };
      calendar.events.insert({
      auth: auth,
      calendarId: 'primary',
      resource: event,
    }, function(err, event) {
      if (err) {
        console.log('There was an error contacting the Calendar service: ' + err);
        return;
      }
      console.log('Event created: %s', event.htmlLink);
    });


    res.send(event)
  });

exports.calendarEvents = functions.https.onRequest(eventsApi);