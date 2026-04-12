/* ============================================================
   Profile Database — Master / Detail interaction
   Place this file at: assets/js/profiles.js
   It is loaded at the bottom of profiles/index.html
   ============================================================ */

(function () {
  const items   = document.querySelectorAll('.pdb-item');
  const profiles = document.querySelectorAll('.pdb-profile');
  const search  = document.getElementById('pdb-search');

  /* Switch the active profile when a list item is clicked */
  function activate(id) {
    items.forEach(function (item) {
      item.classList.toggle('active', item.dataset.id === id);
    });
    profiles.forEach(function (profile) {
      profile.classList.toggle('active', profile.id === 'profile-' + id);
    });
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      activate(item.dataset.id);
    });
  });

  /* Search — hides non-matching list items */
  if (search) {
    search.addEventListener('input', function () {
      var query = search.value.toLowerCase().trim();
      items.forEach(function (item) {
        var name = item.querySelector('.pdb-item-name').textContent.toLowerCase();
        var meta = item.querySelector('.pdb-item-meta').textContent.toLowerCase();
        var match = name.includes(query) || meta.includes(query);
        item.classList.toggle('hidden', !match);
      });
    });
  }

  /* Keyboard navigation: up/down arrows move through the list */
  document.addEventListener('keydown', function (e) {
    if (e.target === search) return;
    var visible = Array.from(items).filter(function (i) {
      return !i.classList.contains('hidden');
    });
    var current = visible.findIndex(function (i) {
      return i.classList.contains('active');
    });
    if (e.key === 'ArrowDown' && current < visible.length - 1) {
      activate(visible[current + 1].dataset.id);
    }
    if (e.key === 'ArrowUp' && current > 0) {
      activate(visible[current - 1].dataset.id);
    }
  });

})();
