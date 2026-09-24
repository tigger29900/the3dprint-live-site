document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// Quote form (FormSubmit -> sean@the3dprint.live)
const form = document.getElementById('quote-form');
const status = document.getElementById('form-status');
const submitBtn = document.getElementById('quote-submit');
const FALLBACK = 'Please email sean@the3dprint.live or call +1 (914) 222-3475 instead.';

function showStatus(message, isError) {
  status.textContent = message;
  status.classList.toggle('notice-error', Boolean(isError));
  status.hidden = false;
  status.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Send visitors back to whichever domain they're on (apex or www), so the
// redirect after a regular submit is never blocked by the CSP.
form.elements._next.value = `${window.location.origin}/?quote=sent#quote`;

if (new URLSearchParams(window.location.search).get('quote') === 'sent') {
  showStatus("Thanks! Your request was sent. We'll be in touch shortly.");
}

form.addEventListener('submit', async (e) => {
  // File uploads go through FormSubmit's regular endpoint (full page submit).
  const file = form.elements.attachment.files[0];
  if (file) return;

  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    const res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && String(data.success) === 'true') {
      form.reset();
      form.elements._next.value = `${window.location.origin}/?quote=sent#quote`;
      showStatus("Thanks! Your request was sent. We'll be in touch shortly.");
    } else {
      showStatus(`Sorry, your request couldn't be sent${data.message ? `: ${data.message}` : '.'} ${FALLBACK}`, true);
    }
  } catch {
    showStatus(`Sorry, we couldn't reach the form service. ${FALLBACK}`, true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Quote Request';
  }
});
