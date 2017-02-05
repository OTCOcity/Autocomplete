;(function ( $, window, document, undefined ) {

    // Default options
    var pluginName = 'autocomplete',
        defaults = {
            url: '',
            data: []
        };

    // Plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }


    // Plugin code
    Plugin.prototype.init = function () {

        var $t = $(this.element),
            t = this,
            $wrapper;

        // Input wrapper
        $t.wrap("<div class='autocomplete'></div>");
        $wrapper = $t.parent();

        // Add result input
        t.input = $('<input type=text class="autocomplete__input" placeholder="' + $t.attr('placeholder') + '">').insertAfter($t).width(parseInt($t.css('width')));

        // Add results container
        t.results = $('<div class="autocomplete__results"></div>').insertAfter($(t.input)).hide().width(parseInt($(t.input).css('width')));

        // Add error container
        t.error = $('<div class="autocomplete__error">Выберите значение из списка</div>').insertAfter($(t.input));

        // Hide original input
        $t.hide();

        // Over scroll block
        $(t.results).on('mousewheel DOMMouseScroll', function(e) {
            var scrollTo = null;
            if(e.type === 'mousewheel') {
                scrollTo = (e.originalEvent.wheelDelta * -1);
            }
            else if(e.type === 'DOMMouseScroll') {
                scrollTo = 40 * e.originalEvent.detail;
            }
            if(scrollTo) {
                e.preventDefault();
                $(this).scrollTop(scrollTo + $(this).scrollTop());
            }
        });

        // Click event on results
        $(t.results).on('click', '.autocomplete__item', function(){

            $(this).parent().children().removeClass('is-active');
            $(this).addClass('is-active');

            $t.val($(this).data('id'));
            $(t.input).val($(this).text());
            $(t.results).hide();
        });

        // Focus event
        t.input.on('focus', function(){

            $wrapper.addClass('is-active');

            $(this).removeClass('autocomplete__has-error');
            $(this).select();
            //if (this.setSelectionRange) { this.focus(); $(this).select() } /* WebKit */
            //else if (this.createTextRange) { var range = this.createTextRange(); range.collapse(true); range.moveEnd('character', this.value.length); range.moveStart('character', 0); range.select(); } /* IE */
            //else if (this.selectionStart) { this.selectionStart = 0; this.selectionEnd = this.value.length; }
            
            $(t.results).addClass('is-active').show();
        });

        // Blur
        $(document).click(function(e){

            if ($(e.target).closest('.autocomplete')[0] !== $(t.element).parent()[0]) {
                $wrapper.removeClass('is-active');
                $(t.results).hide();
                if ($(t.element).val() == '' && $(t.input).val() != '') {
                    $(t.input).addClass('autocomplete__has-error')
                }
            }
        });

        // Get json data form file or data var
        if (this.options.url) {
            $.getJSON(this.options.url, function (data) {
                t.data = data;
            });
        } else if (this.options.data) {
            t.data = this.options.data;
        } else {
            t.data = [];
            console.log('No data');
        }


        // Keyup event
        t.input.on('keyup', function(){
            var val = $.trim($(this).val());

            $(t.results).html('');
            $(t.element).val('');

            // Search results
            if (val.length > 0) {
                var re,
                    hasResults = 0;

                $(t.results).show();

                for (var i = 0; i < t.data.length; i++) {
                        var item = t.data[i];
                        re = new RegExp('^' + val, 'i');
                        if (item.City.search(re) != -1) {
                            if (hasResults++ < 5) {
                                $(t.results).append('<div class="autocomplete__item" data-id="' + item.Id + '">' + item.City + '</div>');
                            }
                        }

                        // Set value to orig input if equal
                        if (item.City == val) {
                            $(t.element).val(item.Id);
                        }

                }
                if (hasResults == 0) {
                    $(t.results).append('<div class="autocomplete__empty">Не найдено</div>');
                }
                if (hasResults > 5) {
                    $(t.results).append('<div class="autocomplete__text">Показано 5 из ' + hasResults + ' элемнетов. Уточните запрос, чтобы увидеть остальные</div>');
                }
            } else {

            }
        });

    };

    // Простой декоратор конструктора, предотвращающий дублирование плагинов
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );