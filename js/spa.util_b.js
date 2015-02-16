/*
 * spa.util_b.js
 * JavaScript ブラウザユーティリティ
 *
 * Michael S. Mikowsk がコンパイル
 * これは Web からひらめきを得て 1998 年から作成・更新を続けているルーチン。
 * MIT ライセンス
 */

/*global $, spa, getComputedStyle */
spa.fake = (function() {
  "use strict";
  //---------------- モジュールスコープ変数開始 --------------
  var configMap = {
    regex_encode_html : /[&"&><]/g,
    regex_encode_noamp : /["'><]/g,
    html_encode_map : {
      '&' : '&#38',
      '"' : '&#34',
      "'" : '&#39',
      '>' : '&#62',
      '<' : '&#60',
    }
  },
      decodeHtml, encodeHtml, getEmSize;
  configMap.encode_noamp_map = $.extend(
    {}, configMap.html_encode_map
  );
  delete configMap.encode_noamp_map['&'];
  //---------------- モジュールスコープ変数終了 --------------

  //------------------- パブリックメソッド開始 ------------------
  // decodeHtml 開始
  // HTML エンティティをブラウザに適した方法でデコードする
  // http://stackoverflow.com/questions/1912501/\
  //   unescape-html-entities-in-javascript を参照
  //
  decodeHtml = function( str ) {
    return $('<div/>').html(str || '').text();
  };
  // decodeHtml 終了

  // encodeHtml 開始
  // これは html エンティティのための単一パスエンコーダであり、
  // 任意の数の文字に対応する
  //
  encodeHtml = function( input_arg_str, exclude_amp ) {
    var input_str = String( input_arg_str ),
        regex, lookup_map
    ;
    if ( exclude_amp ) {
      lookup_map = configMap.encode_noamp_map;
      regex = configMap.regex_encode_noamp;
    }
    else {
      lookup_map = configMap.html_encode_map;
      regex = configMap.regex_encode_html;
    }
    return input_str.replace(
      regex,
      function( match, name ) {
        return lookup_map[ match ] || '';
      }
    );
  };
  // encodeHtml 終了

  // getEmSize 開始
  getEmSize = function( elem ) {
    return Number(
      getComputedStyle( elem, '' ).fontSize.match( /\d*\.?\d*/ )[0]
    );
  };
  // getEmSize 終了

  // メソッドのエクスポート
  return {
    decodeHtml : decodeHtml,
    encodeHtml : encodeHtml,
    getEmSize : getEmSize
  };
  //------------------- パブリックメソッド開始 ------------------
}());
