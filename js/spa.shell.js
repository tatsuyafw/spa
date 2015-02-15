/*
  * spa.shell.js
  * SPAのシェルモジュール
  */

/*global $, spa */
spa.shell = (function () {
  "use strict";

  //----- モジュールスコープ変数開始 -----
  var configMap = {
    anchor_schema_map : {
      chat : { opened : true, closed : true }
    },
    main_html : String()
      + '<div class="spa-shell-head">'
        + '<div class="spa-shell-head-logo"></div>'
        + '<div class="spa-shell-head-acct"></div>'
        + '<div class="spa-shell-head-search"></div>'
      + '</div>'
      + '<div class="spa-shell-main">'
        + '<div class="spa-shell-main-nav"></div>'
        + '<div class="spa-shell-main-content"></div>'
      + '</div>'
      + '<div class="spa-shell-foot"></div>'
      + '<div class="spa-shell-modal"></div>',
  },
      stateMap = {
        anchor_map        : {},
      },
      jqueryMap = {},

      copyAnchorMap    , setJqueryMap,
      changeAnchorPart , onHashchange,
      setChatAnchor    , initModule;
  //----- モジュールスコープ変数終了 ------------

  //-------- ユーティリティメソッド開始 ---------
  // 格納したアンカーマップのコピーを返す。オーバーヘッドを最小にする。
  copyAnchorMap = function() {
    return $.extend( true, {}, stateMap.anchor_map );
  };
  //--------- ユーティリティメソッド終了 --------

  //--------- DOMメソッド開始 -------------------
  // DOMメソッド/setjqueryMap/開始
  setJqueryMap = function() {
    var $container = stateMap.$container;

    jqueryMap = { $container : $container };
  };
  // DOMメソッド/setjqueryMap/終了

  // DOMメソッド/changeAnchorPart/開始
  // 目的: URI アンカー要素部分を変更する
  // 引数:
  //   * arg_map - 変更したい URI アンカー部分を表すマップ
  // 戻り値: boolean
  //   * true - URI のアンカー部分が更新された
  //   * false - URI のアンカー部分が更新できなかった
  // 動作:
  // 現在のアンカーを stateMap.anchor_map に格納する。
  // エンコーディングの説明は uriAnchor を参照。
  // このメソッドは
  //   * copyAnchorMap() を使って子のマップのコピーを作成する。
  //   * arg_map を使ってキーバリューを修正する。
  //   * エンコーディングの独立値と従属値の区別を管理する。
  //   * uriAnchor を使って URI の変更を試みる。
  //   * 成功時には true, 失敗時には false を返す。
  changeAnchorPart = function( arg_map ) {
    var anchor_map_revise = copyAnchorMap(),
        bool_return = true,
        key_name, key_name_dep;

    // アンカーマップへ変更を統合開始
    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty( key_name ) ) {

        // 反復中に従属キーを飛ばす
        if ( key_name.indexOf( '_' ) === 0) { continue KEYVAL; }

        // 独立キー値を更新する
        anchor_map_revise[key_name] = arg_map[key_name];

        // 合致する独立キーを更新する
        key_name_dep = '_' + key_name;
        if ( arg_map[key_name_dep] ) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        }
        else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    // アンカーマップへ変更を統合終了

    // URI の更新開始。成功しなければ元に戻す。
    try {
      $.uriAnchor.setAnchor( anchor_map_revise );
    }
    catch ( error ) {
      // URI を既存の状態に置き換える
      $.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
      bool_return = false;
    }
    // URI の更新終了

    return bool_return;
  };
  // DOMメソッド/changeAnchorPart/終了
  //--------- DOMメソッド終了 -------------------
  

  //--------- イベントハンドラ開始 --------------
  // イベントハンドラ/onHashchange/開始
  // 目的: hashchange イベントを処理する
  // 引数:
  //   * event - jQuery イベントオブジェクト
  // 設定   : なし
  // 戻り値 : false
  // 動作   :
  //   * URI アンカー要素を解析する
  //   * 提示されたアプリケーション状態と現在の状態を比較する。
  //   * 提示された状態が既存の状態と異なり、アンカースキーマで
  //     許可されている場合のみアプリケーションを調整する
  //
  onHashchange = function ( event ) {
    var _s_chat_previous, _s_chat_proposed, s_chat_proposed,
        anchor_map_proposed,
        is_ok = true,
        anchor_map_previous = copyAnchorMap();

    // アンカーの解析を試みる
    try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
    catch ( error ) {
      $.uriAnchor.setAnchor( anchor_map_previous, null, true );
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    // 便利な変数
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    // 変更されている場合のチャットコンポーネントの調整開始
    if ( ! anchor_map_previous
         || _s_chat_previous !== _s_chat_proposed ) {
      s_chat_proposed = anchor_map_proposed.chat;
      switch ( s_chat_proposed ) {
       case 'open' :
        is_ok = spa.chat.setSliderPosition( 'opened' );
        break;
       case 'closed' :
        is_ok = spa.chat.setSliderPosition( 'closed' );
        break;
      default :
        spa.chat.setSliderPosition( 'closed' );
        delete anchor_map_proposed.chat;
        $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }
    // 変更されている場合のチャットコンポーネントの調整終了

    // スライダーの変更が拒否された場合にアンカーを元に戻す処理を開始
    if ( ! is_ok ) {
      if ( anchor_map_previous ) {
        $.uriAnchor.setAnchor( anchor_map_previous, null, true );
        stateMap.anchor_map = anchor_map_previous;
      } else {
        delete anchor_map_proposed.chat;
        $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }
    // スライダーの変更が拒否された場合にアンカーを元に戻す処理を終了

    return false;
  };
  // イベントハンドラ/onHashchange/終了

  //--------- イベントハンドラ終了 --------------


  //--------- コールバック開始 ------------
  // コールバックメソッド/setAnchor/開始
  // 用例: setChatAnchor( 'closed' );
  // 目的: アンカーチャットコンポーネントを変更する。
  // 引数:
  //   * position_type - 「closed」または「opened」
  // 動作:
  //   可能なら URI アンカーパラメータを「chat」を
  //   要求値に変更する。
  // 戻り値:
  //   * true - 要求されたアンカー部分が更新された
  //   * false - 要求されたアンカー部分が更新されなかった
  // 例外発行: なし
  //
  setChatAnchor = function( position_type ) {
    return changeAnchorPart( { chat : position_type } );
  };
  // コールバックメソッド/setAnchor/終了
  //--------- コールバック終了 ------------

  //--------- パブリックメソッド開始 ------------
  // パブリックメソッド/initModule/開始
  // 用例: spa.chat.initModule( $('#app_div_id') );
  // 目的: ユーザに機能を提供するようにチャットに指示する
  // 引数:
  //    * $append_target (例: $('#app_div_id') );
  //    1 つの DOM コンテナを表す jQuery コレクション
  // 動作:
  //    $container に UI シェルを含め、機能モジュールを構成して初期化する。
  //    シェルは URI アンカーや Cookie の管理などのブラウザ全体に及ぶ問題を担当する。
  // 戻り値  : なし
  // 例外発行: なし
  //
  initModule = function( $container ) {
    // HTML をロードし、jQuery コレクションをマッピングする
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    // 我々のスキーマを使うように uriAnchor を設定する
    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });

    // 機能モジュールを構成して初期化する
    spa.chat.configModule({
      set_chat_anchor : setChatAnchor,
      chat_model : spa.model.chat,
      people_model : spa.model.people
    });
    spa.chat.initModule( jqueryMap.$container );

    // URI アンカー変更イベントを処理する。
    // これはすべての機能モジュールを設定して初期化した後に行う。
    // そうしないと、トリガーイベントを処理できる状態になっていない。
    // トリガーイベントはアンカーがロード状態と見なせることを保証するために使う。
    $(window)
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );
  };
  // パブリックメソッド/initModule/終了

  return { initModule : initModule };
  //--------- パブリックメソッド終了 ------------
}());
