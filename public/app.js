// Email signup. Posts to /api/subscribe (src/worker.js), which saves
// the address in the D1 database bound as DB.
(function () {
  var forms = document.querySelectorAll('form.signup');
  var done = document.querySelectorAll('.signup-done');

  function showDone() {
    forms.forEach(function (f) { f.hidden = true; });
    done.forEach(function (d) { d.hidden = false; });
    try { localStorage.setItem('betlab_joined', '1'); } catch (e) { /* storage unavailable */ }
  }

  try { if (localStorage.getItem('betlab_joined') === '1') { showDone(); } } catch (e) { /* ignore */ }

  var MESSAGES = {
    invalid_email: 'That email does not look right. Check it and try again.',
    not_configured: 'Signups are not switched on yet. Please try again soon.',
    fallback: 'Something went wrong. Please try again in a moment.'
  };

  forms.forEach(function (form) {
    var error = form.querySelector('.signup-error');
    var button = form.querySelector('button');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      error.textContent = '';
      button.disabled = true;
      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.elements.email.value,
          company: form.elements.company.value,
          source: form.getAttribute('data-source') || ''
        })
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (res.ok && data.ok) { showDone(); return; }
            error.textContent = MESSAGES[data.error] || MESSAGES.fallback;
            button.disabled = false;
          });
        })
        .catch(function () {
          error.textContent = MESSAGES.fallback;
          button.disabled = false;
        });
    });
  });
})();
