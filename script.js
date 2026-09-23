document.getElementById('year').textContent = new Date().getFullYear();

if (new URLSearchParams(window.location.search).get('quote') === 'sent') {
  document.getElementById('quote-sent').hidden = false;
}
