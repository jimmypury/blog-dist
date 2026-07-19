/**
 * Sets up Justified Gallery.
 */
if (!!$.prototype.justifiedGallery) {
  var options = {
    rowHeight: 140,
    margins: 4,
    lastRow: "justify"
  };
  $(".article-gallery").justifiedGallery(options);
}

$(document).ready(function() {

  /**
   * Smoothly scrolls to headings selected from the desktop table of contents.
   */
  $("#toc a.toc-link").click(function(event) {
    var hash = this.hash;
    var targetId = hash ? decodeURIComponent(hash.slice(1)) : "";
    var target = targetId ? document.getElementById(targetId) : null;

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", hash);
  });
});
