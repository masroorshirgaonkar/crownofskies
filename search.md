---
layout: default
title: Search the Archive
permalink: /search/
---

<div class="cos-search-page">
  <div class="cos-search-header">
    <p class="cos-search-eyebrow">Archive Query Interface</p>
    <h1 class="cos-search-title">Search</h1>
  </div>

  <div class="cos-search-bar-wrap">
    <svg class="cos-search-ico" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input
      id="cos-search-input"
      class="cos-search-input"
      type="text"
      placeholder="Search lore, characters, systems, events…"
      autocomplete="off"
      autofocus
    />
  </div>

  <div class="cos-filter-tags">
    <span class="cos-filter-label">Filter:</span>
    <button class="cos-tag active" data-filter="all">All</button>
    <button class="cos-tag" data-filter="lore">Lore</button>
    <button class="cos-tag" data-filter="magic">Magic</button>
    <button class="cos-tag" data-filter="profiles">Profiles</button>
    <button class="cos-tag" data-filter="news">News</button>
    <button class="cos-tag" data-filter="tech">Tech</button>
    <button class="cos-tag" data-filter="files">Files</button>
  </div>

  <div id="cos-results-meta" class="cos-results-meta" style="display:none;"></div>
  <div id="cos-results" class="cos-results-list"></div>
  <div id="cos-empty" class="cos-empty" style="display:none;">
    <span class="cos-empty-icon">◌</span>
    <p>No records found.</p>
    <p class="cos-empty-sub">Try different search terms or clear the filter.</p>
  </div>
  <div id="cos-idle" class="cos-idle">
    <p>Begin typing to query the archive.</p>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lunr.js/2.3.9/lunr.min.js"></script>

<script>
(function () {
  var searchIndex = null;
  var allDocs = [];
  var activeFilter = 'all';
  var currentQuery = '';

  var input   = document.getElementById('cos-search-input');
  var results = document.getElementById('cos-results');
  var meta    = document.getElementById('cos-results-meta');
  var empty   = document.getElementById('cos-empty');
  var idle    = document.getElementById('cos-idle');
  var tags    = document.querySelectorAll('.cos-tag');

  fetch('{{ "/search.json" | prepend: site.baseurl }}')
    .then(function(r){ return r.json(); })
    .then(function(data){
      allDocs = data;
      searchIndex = lunr(function(){
        this.ref('url');
        this.field('title', { boost: 10 });
        this.field('category', { boost: 5 });
        this.field('content');
        data.forEach(function(doc){ this.add(doc); }, this);
      });
    });

  tags.forEach(function(tag){
    tag.addEventListener('click', function(){
      tags.forEach(function(t){ t.classList.remove('active'); });
      tag.classList.add('active');
      activeFilter = tag.dataset.filter;
      render(currentQuery);
    });
  });

  input.addEventListener('input', function(){
    currentQuery = this.value.trim();
    render(currentQuery);
  });

  function render(query) {
    results.innerHTML = '';
    meta.style.display = 'none';
    empty.style.display = 'none';
    idle.style.display = 'none';

    if (!query) {
      idle.style.display = 'block';
      return;
    }
    if (!searchIndex) {
      results.innerHTML = '<p class="cos-loading">Loading index…</p>';
      return;
    }

    var lunrResults;
    try {
      lunrResults = searchIndex.search(query + ' ' + query + '*');
    } catch(e) {
      lunrResults = [];
    }

    var matched = lunrResults
      .map(function(r){ return allDocs.find(function(d){ return d.url === r.ref; }); })
      .filter(function(d){ return d; })
      .filter(function(d){
        if (activeFilter === 'all') return true;
        return d.category.toLowerCase() === activeFilter ||
               d.url.toLowerCase().indexOf(activeFilter) !== -1;
      });

    if (!matched.length) {
      empty.style.display = 'block';
      return;
    }

    meta.style.display = 'block';
    meta.textContent = matched.length + ' record' + (matched.length !== 1 ? 's' : '') + ' found';

    matched.forEach(function(doc){
      var el = document.createElement('a');
      el.href = doc.url;
      el.className = 'cos-result-card';

      var snippet = doc.content
        ? highlight(doc.content.substring(0, 160) + '…', query)
        : '';

      el.innerHTML =
        '<span class="cos-result-cat">' + escHtml(doc.category) + '</span>' +
        '<span class="cos-result-title">' + highlight(escHtml(doc.title), query) + '</span>' +
        (doc.date ? '<span class="cos-result-date">' + escHtml(doc.date) + '</span>' : '') +
        (snippet ? '<span class="cos-result-snippet">' + snippet + '</span>' : '');

      results.appendChild(el);
    });
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function highlight(text, query) {
    var words = query.split(/\s+/).filter(Boolean);
    words.forEach(function(w){
      var re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi');
      text = text.replace(re, '<mark>$1</mark>');
    });
    return text;
  }
})();
</script>
