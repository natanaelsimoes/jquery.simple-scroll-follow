/**
 * @file jQuery Plugin: jquery.simpleScrollFollow
 * @version 1.0
 * @author Yuusaku Miyazaki [toumin.m7@gmail.com]
 * @license MIT License
 */
(function($) {

/**
 * @desc プラグインをjQueryのプロトタイプに追加する
 * @global
 * @memberof jQuery
 * @param {Object} [option] オプションを格納した連想配列
 * @param {boolean|undefined} [option.instance=undefined] - プラグインを呼び出すとき、jQueryオブジェクトではなく、インスタンスを返すかどうかの真偽値
 * @param {boolean} [option.enabled=true] - スクロールを有効にするかどうかの真偽値
 * @param {Object} [option.limit_elem=$('body')] - 追尾要素のスクロールの下限の基準となる要素のオブジェクト
 * @return {Object|Array} - jQueryオブジェクト、または、インスタンスを返すオプションが有効な場合はインスタンスの配列
 */
$.fn.simpleScrollFollow = function(option) {
	var arr = [];
	this.each(function() {
		arr.push(new SimpleScrollFollow(this, option));
	});
	return (option != undefined && option.instance != undefined && option.instance) ? $(arr) : this;
};

/**
 * @global
 * @constructor
 * @classdesc 要素ごとに適用される処理を集めたクラス
 * @param {Object} elem - プラグインを適用するHTML要素
 * @param {Object} option - オプションを格納した連想配列
 *
 * @prop {Object} option - オプションを格納した連想配列
 * @prop {Object} follow - 追尾要素の情報を格納した連想配列
 * @prop {Object} follow.elem - 追尾するHTML要素のjQueryオブジェクト
 * @prop {number} follow.offset_top - 追尾要素の元々のオフセット・トップ
 * @prop {number} follow.offset_bottom - 追尾要素の元々のオフセット・ボトム
 * @prop {number} follow.position_top - 追尾要素の元々のポジション・トップ
 */
function SimpleScrollFollow(elem, option) {
	this.setOption(option);
	this.setFollow(elem);
	this._ehScroll();
}

$.extend(SimpleScrollFollow.prototype, /** @lends SimpleScrollFollow.prototype */ {
	/**
	 * @desc スクロールを有効または無効にする
	 * @param {boolean} bool - true: 有効にする、 false: 無効にする
	 */
	setEnabled: function(bool) {
		this.option.enabled = bool;
		if (!this.option.enabled) $(this.follow.elem).css('top', this.follow.position_top);
	},

	/**
	 * @desc 追尾要素の設定をする
	 * @param {Object} elem - プラグインを適用するHTML要素
	 */
	setFollow: function(elem) {
		var follow = {};
		follow.elem = elem;
		follow.offset_top = $(follow.elem).offset().top;
		follow.offset_bottom = this._calcOffsetBottom(follow.elem);

		// topの元の位置を記憶する前に、topの値がautoの場合はゼロに設定する。
		if ($(follow.elem).css('top') == 'auto') $(follow.elem).css('top', 0);
		follow.position_top = Number($(follow.elem).css('top').replace(/px$/, ''));

		this.follow = follow;
	},

	/**
	 * @desc オプションを初期化する
	 * @param {Object} option - オプションを格納した連想配列
	 */
	setOption: function(option) {
		this.option =  $.extend({
			enabled: true,
			limit_elem: $('body'),
		}, option);
	},

	/**
	 * @private
	 * @desc offset_bottomを算出する
	 * @param {Object} elem - 算出する対象のHTML要素
	 * @return {number} - 算出されたoffset_bottom
	 */
	_calcOffsetBottom: function(elem) {
		return $(elem).offset().top +
			$(elem).height() +
			Number($(elem).css('border-top-width').replace(/px$/, '')) +
			Number($(elem).css('border-bottom-width').replace(/px$/, '')) +
			Number($(elem).css('padding-top').replace(/px$/, '')) +
			Number($(elem).css('padding-bottom').replace(/px$/, ''));
	},

	/**
	 * @private
	 * @desc イベントハンドラ: 画面スクロール
	 */
	_ehScroll: function() {
		var self = this;
		$(window).scroll(function() {
			// スクロールが無効の場合はここで中断
			if (!self.option.enabled) return false;

			// 画面の上端、下端を取得
			var win = {
				scroll_top: $(this).scrollTop(),
				scroll_bottom: $(this).scrollTop() + $(this).height()
			};

			// 追尾要素の "現在の" 上端、下端を取得
			var current = {
				offset_top: $(self.follow.elem).offset().top,
				offset_bottom: self._calcOffsetBottom(self.follow.elem)
			};

			// 下限要素の下端を取得
			var limit = {offset_bottom: self._calcOffsetBottom(self.option.limit_elem)};

			// ! positionのtopとoffsetのtopを混同しないように

			if (win.scroll_top > current.offset_top) { // 画面上端が追尾要素の現在の位置より低い場合
				if (limit.offset_bottom > current.offset_bottom) { // 下限要素の現在の下端が追尾要素の下端より低い場合
					// 追尾要素を画面上端に合わせる
					$(self.follow.elem).css('top', win.scroll_top - self.follow.offset_top + self.follow.position_top);
				} else {
					// 追尾要素の下端を下限要素の下端に合わせる
					$(self.follow.elem).css('top', limit.offset_bottom - self.follow.offset_bottom + self.follow.position_top);
				}
			} else {
				if (win.scroll_top > self.follow.offset_top) { // 画面上端が追尾要素の元の位置より低い場合
					// 追尾要素を画面上端に合わせる
					$(self.follow.elem).css('top', win.scroll_top - self.follow.offset_top + self.follow.position_top);
				} else {
					// 追尾要素を元の位置に戻す
					$(self.follow.elem).css('top', self.follow.position_top);
				}
			}
		});
	},
}); // endo of "$.extend"

})( /** namespace */ jQuery);