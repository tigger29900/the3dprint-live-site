const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
if (nav) nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// Quote form (FormSubmit -> sean@the3dprint.live); only on pages that have it.
const form = document.getElementById('quote-form');
if (form) initQuoteForm();

function initQuoteForm() {
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
  form.elements._next.value = `${window.location.origin}/thank-you`;

  // Service pages link here with ?type=... to pre-select the project type.
  const presetType = new URLSearchParams(window.location.search).get('type');
  if (presetType && [...form.elements.project_type.options].some((o) => o.value === presetType)) {
    form.elements.project_type.value = presetType;
  }

  const ALLOWED_FILE = /\.(stl|3mf|obj|step|stp|pdf|jpe?g|png|webp|heic|gif)$/i;
  const MAX_FILE_BYTES = 100 * 1024 * 1024;

  // Upload attachments to Vercel Blob (via /api/upload) and return their download links.
  async function uploadFiles(files) {
    const { upload } = await import('/vendor/vercel-blob-client.js');
    const links = [];
    for (const [i, file] of files.entries()) {
      const safeName = file.name.replace(/[^\w.-]+/g, '-');
      // Give up if the upload stalls (no progress for 30s) instead of retrying for minutes.
      const controller = new AbortController();
      let stallTimer = setTimeout(() => controller.abort(), 30000);
      let lastPercent = -1;
      try {
        const blob = await upload(`quotes/${safeName}`, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          contentType: 'application/octet-stream',
          multipart: file.size > 20 * 1024 * 1024,
          abortSignal: controller.signal,
          onUploadProgress: ({ percentage }) => {
            if (percentage > lastPercent) {
              lastPercent = percentage;
              clearTimeout(stallTimer);
              stallTimer = setTimeout(() => controller.abort(), 30000);
            }
            submitBtn.textContent = `Uploading file ${i + 1} of ${files.length}… ${Math.round(percentage)}%`;
          },
        });
        links.push(`${file.name}: ${blob.url}`);
      } finally {
        clearTimeout(stallTimer);
      }
    }
    return links;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const files = [...form.elements.attachment.files];
    const badFile = files.find((f) => !ALLOWED_FILE.test(f.name) || f.size > MAX_FILE_BYTES);
    if (badFile) {
      showStatus(`"${badFile.name}" can't be uploaded. Files must be STL, 3MF, STEP, OBJ, an image or PDF, and under 100 MB.`, true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const data = new FormData(form);
      data.delete('attachment');
      if (files.length) {
        try {
          data.set('files', (await uploadFiles(files)).join('\n'));
        } catch (err) {
          console.error('File upload failed:', err);
          const reason = err && err.name === 'AbortError' ? 'upload timed out' : (err && err.message) || 'unknown error';
          showStatus(`Sorry, your file couldn't be uploaded (${reason}). ${FALLBACK}`, true);
          return;
        }
        submitBtn.textContent = 'Sending…';
      }

      const res = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && String(result.success) === 'true') {
        // Conversion page: counted as a page view in Web Analytics.
        window.location.assign('/thank-you');
        return;
      } else {
        showStatus(`Sorry, your request couldn't be sent${result.message ? `: ${result.message}` : '.'} ${FALLBACK}`, true);
      }
    } catch {
      showStatus(`Sorry, we couldn't reach the form service. ${FALLBACK}`, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Quote Request';
    }
  });
}
