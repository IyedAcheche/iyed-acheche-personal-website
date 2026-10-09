(function () {
  // Keyboard shortcuts: S story, W work, C contact, R resume, H home
  var map = { s: 'story.html', w: 'work.html', c: 'contact.html', h: 'index.html' };
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var k = (e.key || '').toLowerCase();
    if (k === 'r') {
      var a = document.querySelector('a[data-key="r"]');
      if (a) { e.preventDefault(); a.click(); }
    } else if (map[k]) {
      e.preventDefault();
      window.location.href = map[k];
    }
  });

  // Copy email button
  var btn = document.querySelector('[data-copy]');
  if (btn) {
    var status = document.querySelector('.status');
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function (msg) { if (status) { status.textContent = msg; setTimeout(function () { status.textContent = ''; }, 2500); } };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done('Copied ' + text); }, function () { done('Press and hold to copy: ' + text); });
      } else {
        done('Select and copy: ' + text);
      }
    });
  }
})();
