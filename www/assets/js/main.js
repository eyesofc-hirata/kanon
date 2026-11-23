/*
 * Kanon リリースLP
 * 設定値は assets/js/config.js を編集してください（このファイルは編集不要）。
 */
(function () {
  "use strict";

  var cfg = window.RELEASE || {};
  var isLive = cfg.status === "live";

  /* ---------- 配信開始日 ---------- */
  function applyReleaseDate() {
    var date = cfg.releaseDate || "";
    document.querySelectorAll('[data-bind="releaseDate"]').forEach(function (el) {
      el.textContent = date;
    });
  }

  /* ---------- ストアボタン（配信中） ---------- */
  function applyStores() {
    var stores = cfg.stores || {};
    document.querySelectorAll("a[data-store]").forEach(function (a) {
      var url = stores[a.getAttribute("data-store")];
      if (url) {
        a.href = url;
        return;
      }
      // 配信中でもURL未設定のストアは押せない表示にする
      var item = document.createElement("div");
      item.className = "store store--disabled";
      item.setAttribute("aria-disabled", "true");
      item.innerHTML = a.innerHTML;
      var go = item.querySelector(".store__go");
      if (go) {
        go.className = "store__badge";
        go.textContent = "近日配信";
      }
      a.replaceWith(item);
    });
  }

  /* ---------- 動画 ---------- */
  function youtubeId(src) {
    var m = String(src).match(
      /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/
    );
    return m ? m[1] : null;
  }

  function createPlayer(conf, title) {
    var ytId = youtubeId(conf.src);
    if (ytId) {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + ytId + "?rel=0&playsinline=1";
      iframe.title = title || "動画";
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      return iframe;
    }
    var video = document.createElement("video");
    video.src = conf.src;
    // 自動再生はしない。最初はコントロールを隠し、中央の再生ボタン（動画全体）をタップで音声付き再生。
    // 再生後はブラウザ標準のコントロールで操作する。
    video.controls = false;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.preload = conf.poster ? "none" : "metadata";
    if (conf.poster) video.poster = conf.poster;
    if (title) video.setAttribute("aria-label", title);

    var start = document.createElement("button");
    start.type = "button";
    start.className = "video-start";
    start.setAttribute("aria-label", (title || "動画") + "を再生");
    start.innerHTML =
      '<span class="play-btn play-btn--start" aria-hidden="true">' +
      '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>';
    start.addEventListener("click", function () {
      video.controls = true;
      start.remove();
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* 再生できなくても標準コントロールから操作できる */ });
      video.focus();
    });

    // 同時に複数の音が鳴らないよう、ほかの動画は一時停止する
    video.addEventListener("play", function () {
      document.querySelectorAll(".video-frame video").forEach(function (v) {
        if (v !== video && !v.paused) v.pause();
      });
    });

    var frag = document.createDocumentFragment();
    frag.appendChild(video);
    frag.appendChild(start);
    return frag;
  }

  function applyVideos() {
    var videos = cfg.videos || {};
    document.querySelectorAll("[data-video]").forEach(function (frame) {
      var conf = videos[frame.getAttribute("data-video")];
      if (!conf || !conf.src) return;
      if (conf.showFrom === "live" && !isLive) return;

      frame.appendChild(createPlayer(conf, frame.getAttribute("data-video-title")));
      frame.classList.add("is-ready");
      // 非表示にしてあるセクション（30秒リリックビデオなど）は、動画が入ったら表示する
      var hiddenSection = frame.closest("section[hidden]");
      if (hiddenSection) hiddenSection.hidden = false;
      var scope = frame.closest("[data-video-scope]");
      if (scope) scope.classList.add("has-video");
    });
  }

  /* ---------- ハンバーガーメニュー ---------- */
  function setupMenu() {
    var root = document.documentElement;
    var btn = document.querySelector(".menu-btn");
    var menu = document.getElementById("site-menu");
    if (!btn || !menu) return;

    // 表示されていないセクションへのリンクは隠す（30秒リリックビデオ公開前など）
    menu.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var target = document.getElementById(a.getAttribute("href").slice(1));
      var li = a.closest("li");
      if (li) li.hidden = !target || !!target.closest("[hidden]");
    });

    function visibleLinks() {
      return [].slice.call(menu.querySelectorAll("li:not([hidden]) a"));
    }
    function isOpen() {
      return menu.classList.contains("is-open");
    }
    function open() {
      menu.classList.add("is-open");
      root.classList.add("menu-open");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "メニューを閉じる");
      var first = visibleLinks()[0];
      if (first) first.focus({ preventScroll: true });
    }
    function close(returnFocus) {
      menu.classList.remove("is-open");
      root.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "メニューを開く");
      if (returnFocus) btn.focus({ preventScroll: true });
    }

    btn.addEventListener("click", function () {
      if (isOpen()) close(true);
      else open();
    });

    // リンクを押したら閉じてからスクロール／背景（余白）を押したら閉じる
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) close(false);
      else if (!e.target.closest(".site-menu__list")) close(true);
    });

    document.addEventListener("keydown", function (e) {
      if (!isOpen()) return;
      if (e.key === "Escape") {
        close(true);
        return;
      }
      if (e.key !== "Tab") return;
      // メニュー内（ボタン＋リンク）でフォーカスを循環させる
      var items = [btn].concat(visibleLinks());
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && (i === -1 || i === items.length - 1)) {
        e.preventDefault();
        items[0].focus();
      }
    });
  }

  /* ---------- GA4 ---------- */
  function setupAnalytics() {
    if (!cfg.ga4Id) return;

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4Id);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.ga4Id);

    // data-ga-event="イベント名" と data-ga-xxx="値"（→ パラメータ xxx）を送信
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-ga-event]");
      if (!el) return;
      var params = {};
      Object.keys(el.dataset).forEach(function (key) {
        if (key.indexOf("ga") !== 0 || key === "gaEvent") return;
        var name = key.slice(2);
        params[name.charAt(0).toLowerCase() + name.slice(1)] = el.dataset[key];
      });
      if (el.href && el.target === "_blank") params.link_url = el.href;
      window.gtag("event", el.dataset.gaEvent, params);
    });
  }

  function init() {
    applyReleaseDate();
    if (isLive) applyStores();
    applyVideos();
    setupMenu(); // 動画の有無でセクションの表示が決まったあとに実行
    setupAnalytics();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
