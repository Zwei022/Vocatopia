function taipeiDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

function taipeiDateSeed(date = new Date()) {
  return Number(taipeiDateString(date).replace(/-/g, ''));
}

module.exports = { taipeiDateString, taipeiDateSeed };
