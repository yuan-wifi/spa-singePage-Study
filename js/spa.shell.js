/*
 * spa.shell.js
 * Shell module for spa
*/
/*jslint        browser: true,   continue: true,
  devel: true,  indent: 4,       maxerr: 50,
  newcap: true, nomen: true,     plusplus: true,
  regexp: true, sloppy: true,    vars: false,
  white: true 
*/
/*global $, spa */
spa.shell = (function () {
    // ----- BEGIN MODULE SCOPE VARIABLES -----
    // 配置模块参数，定义变量
    var
        configMap = {
            main_html: String()
                +'<div class="spa-shell-head">'
                    +'<div class="spa-shell-head-logo"></div>'
                    +'<div class="spa-shell-head-acct"></div>'
                    +'<div class="spa-shell-head-search"></div>'
                +'</div>'
                +'<div class="spa-shell-main">'
                    +'<div class="spa-shell-main-nav"></div>'
                    +'<div class="spa-shell-main-content"></div>'
                +'</div>'
                +'<div class="spa-shell-foot"></div>'
                +'<div class="spa-shell-chat"></div>'
                +'<div class="spa-shell-modal"></div>',
            chat_extend_time: 1000,
            chat_retract_time: 300,
            chat_extend_height: 450,
            chat_retract_height: 15,
            chat_extended_title: '点击缩小',
            chat_retracted_title: '点击放大'
        },
        // 状态集合
        stateMap = { 
            $container: null,
            is_chat_retracted: true
        },
        // jquery变量集合
        jqueryMap = {},

        setJqueryMap, toggleChat, onClickChat, initModule;
        // ----- END MODULE SCOPE VARIABLES -----
        // -------- BEGIN UTILITY METHODS -------
        // --------- END UTILITY METHODS --------
        // --------- BEGIN DOM METHODS ----------
        // Begin Dom method /setJqueryMap/
        // 创建jquery集合缓存到jqueryMap中
        setJqueryMap = function () {
            var $container = stateMap.$container;
            jqueryMap = { 
                $container: $container,
                $chat: $container.find( '.spa-shell-chat' ) 
            };
        };
        // End DOM method /setJqueryMap/

        // Begin DOM method /toggleChat/
        // toggleChat API文档
        // Purpose: Extends or retracts chat slider
        // Arguments:
        //     * do_extend - if true, extends slider; if false retracts
        //     * callback - optional function to execute at end of animation
        // Settings:
        //     * chat_extend_time, chat_retract_time
        //     * chat_extend_height, chat_retract_height
        // Returns: boolean
        //     * true - slider animation activated
        //     * false  -slider animation not activated
        // State： sets stateMap.is_chat_retracted
        //     * true - slider is retracted
        //     * false - slider is extended
        toggleChat = function ( do_Extend, callback ) {
            var 
                px_chat_ht = jqueryMap.$chat.height(),
                is_open = px_chat_ht === configMap.chat_extend_height,
                is_closed = px_chat_ht === configMap.chat_retract_height,
                is_sliding = ! is_open && !is_closed;
            // avoid race condition
            if ( is_sliding ) { return false; }

            // Begin extend chat slider
            if ( do_Extend ) {
                jqueryMap.$chat.animate(
                    { height: configMap.chat_extend_height },
                    configMap.chat_extend_time,
                    function () {
                        jqueryMap.$chat.attr(
                            'title', configMap.chat_extended_title
                        );
                        stateMap.is_chat_retracted = false;
                        if ( callback ) { callback( jqueryMap.$chat ); }
                    }
                );
                return true;
            }
            // End extend chat slider

            // Begin retract chat slider
            jqueryMap.$chat.animate(
                { height: configMap.chat_retract_height },
                configMap.chat_retract_time,
                function () {
                    jqueryMap.$chat.attr(
                        'title', configMap.chat_retracted_title
                    );
                    stateMap.is_chat_retracted = true;
                    if ( callback ) { callback( jqueryMap.$chat ); }
                }
            );
            return true;
            // End retract chat slider
        };
        // End DOM method /toggleChat/
        // -----------END DOM METHODS -----------
        // ----------BEGIN EVENT HANDLERS--------
        onClickChat = function () {
            toggleChat( stateMap.is_chat_retracted );
            return false;
        };
        // -----------END EVENT HANDERS ---------
        // ---------BEGIN PUBLIC METHODS --------
        // Begin public method /initModule/
        initModule = function ( $container ) {
            // load HTML and map jQuery collections
            stateMap.$container = $container;
            $container.html( configMap.main_html );
            setJqueryMap();

            // initialize chat slider and bind click handler
            stateMap.is_chat_retracted = true;
            jqueryMap.$chat
                .attr( 'title', configMap.chat_extended_title )
                .click( onClickChat );

            // text toggle
            /* 
                setTimeout( function () {toggleChat(true); }, 3000 );
                setTimeout( function () {toggleChat(false); }, 8000 );
            */
        };
        // End PUBLIC method /initModule/

        return { initModule: initModule };
        // --------- END PUBLIC METHODS ---------
}());