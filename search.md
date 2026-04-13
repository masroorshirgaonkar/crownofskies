---
layout: default
title: Search the Archive
permalink: /search/
---

<div class="cos-search-page">
  <div class="cos-search-header">
    <p>Archive Query Interface</p>
    <h1>Search</h1>
  </div>

  <input
    id="cos-search-input"
    type="text"
    placeholder="Search lore, characters, systems, events…"
    autocomplete="off"
    autofocus
    style="width:100%;padding:12px;font-size:14px;background:#111318;border:1px solid #2a3550;border-radius:4px;color:#d8dce8;margin-bottom:1rem;"
  />

  <div id="cos-results"></div>
  <div id="cos-idle" style="color:#7a8399;font-style:italic;">Begin typing to query the archive.</div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lunr.js/2.3.9/lunr.min.js"></script>
<script>
(function () {
  var searchIndex = null;
  var allDocs = [];
  var input = document.getElementById('cos-search-input');
  var results = document.getElementById('cos-results');
  var idle = document.getElementById('cos-idle');

  fetch('/crownofskies/search.json')
    .then(function(r){ return r.json(); })
    .then(function(data){
      allDocs = data;
      searchIndex = lunr(function(){
        this.ref('url');
        this.field('title', { boost: 10 });
        this.field('content');
        data.forEach(function(doc){ this.add(doc); }, this);
      });
    });

  input.addEventListener('input', function(){
    var query = this.value.trim();
    results.innerHTML = '';
    idle.style.display = query ? 'none' : 'block';
    if (!query || !searchIndex) return;
    var matched = searchIndex.search(query)
      .map(function(r){ return allDocs.find(function(d){ return d.url === r.ref; }); })
      .filter(Boolean);
    if (!matched.length) { results.innerHTML = '<p style="color:#7a8399">No records found.</p>'; return; }
    matched.forEach(function(doc){
      var el = document.createElement('a');
      el.href = doc.url;
      el.style.cssText = 'display:block;padding:12px 0;border-bottom:1px solid #2a3550;color:#d8dce8;text-decoration:none;';
      el.innerHTML = '<strong style="color:#8fd3ff">' + doc.title + '</strong><br><span style="font-size:12px;color:#7a8399">' + (doc.date || '') + '</span>';
      results.appendChild(el);
    });
  });
})();
</script>
