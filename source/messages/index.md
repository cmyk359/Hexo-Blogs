---
title: 留言板
date: 2025-01-04 20:46:28
keywords: 留言板
comment: true
banner_img: https://cdn.jsdelivr.net/gh/honjun/cdn@1.4/img/banner/comment.jpg
banner_img_height: 65
---

{% raw %}
<div class="toc-container">
    <div class="toc" style="background: none;">
    </div>
</div>
<div class="entry-content">
  <div class="poem-wrap">
    <div class="poem-border poem-left"></div>
    <div class="poem-border poem-right"></div>
    <h2>念两句诗</h2>
    <p id="poem_sentence"></p>
    <p id="poem_info"></p>
  </div>
</div>
<script src="https://sdk.jinrishici.com/v2/browser/jinrishici.js" charset="utf-8"></script>
<script type="text/javascript">
  jinrishici.load(function(result) {
    var sentence = document.querySelector("#poem_sentence")
    var info = document.querySelector("#poem_info")
    sentence.innerHTML = result.data.content
    info.innerHTML = '【' + result.data.origin.dynasty + '】' + result.data.origin.author + '《' + result.data.origin.title + '》'
  });
</script>

{% endraw %}

