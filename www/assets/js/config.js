/*
 * ============================================================
 *  Kanon リリースLP 設定ファイル
 *  ここの値を書き換えるだけで、ページ全体の表示が切り替わります。
 * ============================================================
 */
window.RELEASE = {
  /*
   * 配信状態
   *   "teaser" … ティザー期（近日配信）※公開時はこちら
   *   "live"   … 配信中
   */
  status: "teaser",

  /*
   * 配信開始日（表示用の文字列。例 "2026.12.20"）
   * 空のときは「未定」扱いになります。
   */
  releaseDate: "",

  /*
   * 各ストアのURL（配信中のときにボタンのリンク先になります）
   * 配信中でもURLが空のストアは押せない表示のままになります。
   */
  stores: {
    spotify: "",
    appleMusic: "",
    lineMusic: "",
    youtubeMusic: "",
  },

  /*
   * 動画
   *   src      … mp4 のパス（例 "assets/video/lyric-30s.mp4"）
   *              または YouTube のURL（watch / youtu.be / shorts いずれも可）
   *   poster   … mp4 のときのポスター画像（例 "assets/images/lyric-30s-poster.jpg"）
   *   showFrom … "teaser" = src が入っていれば今すぐ表示
   *              "live"   = 配信中になってから表示
   *
   *   src が空、または showFrom の条件を満たさないときは、プレースホルダーを表示します。
   *   ※ 1分版（フル）を足すときは、ここに lyricFull を追加し、
   *     index.html の 30秒リリックビデオ枠をコピーして data-video="lyricFull" にしてください。
   */
  videos: {
    // 30秒リリックビデオ：完成までは src を空にしておくと、セクションごと非表示になります。
    //   完成したら src（と poster）を入れると、配信状態に関係なくすぐ表示されます。
    lyric30s:     { src: "", poster: "", showFrom: "teaser" },
    natsukaze15s: { src: "assets/video/natsukaze-15s.mp4",    poster: "assets/images/natsukaze-15s-poster.jpg",    showFrom: "teaser" },
    mirai15s:     { src: "assets/video/mirai-letter-15s.mp4", poster: "assets/images/mirai-letter-15s-poster.jpg", showFrom: "teaser" },
  },

  /*
   * GA4 の測定ID（例 "G-XXXXXXXXXX"）。空なら計測タグは読み込みません。
   * 計測するイベント：
   *   store_click  … ストアボタン（store: ストア名）
   *   listen_click … 「この曲を聴く」（track: 曲名）
   *   sns_click    … SNSカード（sns: サービス名）
   */
  ga4Id: "",
};

/*
 * 状態をHTMLに反映（CSSで表示を切り替えるため、ページ描画前に実行）。
 * ここは編集不要です。
 */
(function (cfg, root) {
  root.setAttribute("data-status", cfg.status === "live" ? "live" : "teaser");
  if (cfg.releaseDate) root.setAttribute("data-has-date", "");
})(window.RELEASE, document.documentElement);
