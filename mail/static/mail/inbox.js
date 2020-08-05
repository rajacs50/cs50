document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Send email
  document.querySelector('#compose-form').onsubmit = () => {
    const receipents = document.querySelector('#compose-recipients').value
    const subject = document.querySelector('#compose-subject').value
    const contentBody = document.querySelector('#compose-body').value
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: receipents,
        subject: subject,
        body: contentBody
      })
    })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
      });alert('Email Sent');
    load_mailbox('sent');
    return false;
  };

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-read-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Show the sent mailbox with emails
  if (mailbox === 'sent') {
    fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
        // Print emails
        // console.log(emails);
        for (let i = 0; i < emails.length; i++) {
          const element = emails[i];
          let emailList = `<div class='mailbox' data-read=${element.read} onclick="clickEmail(${element.id})"><span class='recip'>${element.recipients.join(',')}</span>&nbsp<span>${element.subject}</span><span class='float-right text-muted'>${element.timestamp}</span></div>`;
          document.querySelector('#emails-view').innerHTML += emailList
        }
      });
  }
  // return false;
  if (mailbox === 'inbox') {
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
        // Print emails
        // console.log(emails);
        for (let i = 0; i < emails.length; i++) {
          const element = emails[i];
          let emailList = `<div class='mailbox' data-read=${element.read} onclick="clickEmail(${element.id})"><span class='recip'>${element.sender}</span>&nbsp<span>${element.subject}</span><span class='float-right text-muted'>${element.timestamp}</span></div>`;
          document.querySelector('#emails-view').innerHTML += emailList
        }
      });
  }
  if (mailbox === 'archive') {
    fetch('/emails/archive')
      .then(response => response.json())
      .then(emails => {
        // Print emails
        // console.log(emails);
        for (let i = 0; i < emails.length; i++) {
          const element = emails[i];
          let emailList = `<div class='mailbox' data-read=${element.read} onclick="clickEmail(${element.id})"><span class='recip'>${element.sender}</span>&nbsp<span>${element.subject}</span><span class='float-right text-muted'>${element.timestamp}</span></div>`;
          document.querySelector('#emails-view').innerHTML += emailList
        }
      });
  }
}


function clickEmail(emailID) {
  // Show the email clicked and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-read-view').style.display = 'block';
  fetch(`/emails/${emailID}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      // console.log(email);

      // click on the email to read
      // once email is clicked, mark it read
      document.querySelector('#email-read-view').innerHTML = `<div><span class='read-view'>From:</span> ${email.recipients}</div><div><span class='read-view'>To:</span> ${email.sender}</div><div><span class='read-view'>Subject:</span> ${email.subject}</div><div><span class='read-view'>Timestamp:</span> ${email.timestamp}</div><div><button type="button" onclick="replyEmail(${emailID})" class="btn btn-outline-primary btn-sm">Reply</button>&nbsp<button type="button" onclick="archiveEmail(${email.archived},${emailID})" data-archv=${email.archived} class="btn btn-outline-primary btn-sm archive">Archive</button></div><hr><div><p>${email.body}</p></div>`;
      const archvd = document.querySelector('.archive')
      if (archvd.dataset.archv === 'true') {
        archvd.innerText = 'Unarchive'
      } else {
        archvd.innerText = 'Archive'
      }
    });
  fetch(`/emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function archiveEmail(archiveStat, emailID) {
  if (archiveStat) {
    fetch(`/emails/${emailID}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    });alert('Email Unarchived');
    load_mailbox('inbox');
  } else {
    fetch(`/emails/${emailID}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    });alert('Email Archived');
    load_mailbox('inbox');
  }
}

function replyEmail(emailID) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-read-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  let sub = /^Re: /

  fetch(`/emails/${emailID}`)
    .then(response => response.json())
    .then(email => {
      document.querySelector('#compose-recipients').value = email.sender
      // console.log(email.subject == sub)
      if (email.subject.match(sub)) {
        document.querySelector('#compose-subject').value = email.subject
        document.querySelector('#compose-body').textContent = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n`
      } else {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`
        document.querySelector('#compose-body').textContent = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n`
      }
    });
  // Send email
  document.querySelector('#compose-form').onsubmit = () => {
    receipents = document.querySelector('#compose-recipients').value
    subject = document.querySelector('#compose-subject').value
    contentBody = document.querySelector('#compose-body').value
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: receipents,
        subject: subject,
        body: contentBody
      })
    })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
      });alert('Email sent');
    load_mailbox('sent');
    return false;
  }
}