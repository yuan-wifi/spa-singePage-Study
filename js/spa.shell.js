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
            anchor_schema_map: {
                chat: { open: true, closed: true }
            },
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
            anchor_map: {},
            is_chat_retracted: true
        },
        // jquery变量集合
        jqueryMap = {},

        copyAnchorMap, setJqueryMap, toggleChat,
        changeAnchorPart, onHashchange,
        onClickChat, initModule;
        // ----- END MODULE SCOPE VARIABLES -----
        // -------- BEGIN UTILITY METHODS -------
        // Returns copy of stored anchor map; minimizes overhead
        copyAnchorMap = function () {
            // 使用jquery的extend()方法复制对象
            return $.extend( true, {}, stateMap.anchor_map );
        };
        // --------- END UTILITY METHODS --------
        // --------- BEGIN DOM METHODS ----------
        // Begin DOM method /setJqueryMap/
        // 创建jquery集合缓存到jqueryMap中
        setJqueryMap = function () {
            var $container = stateMap.$container;
            jqueryMap = { 
                $container: $container,
                $chat: $container.find( '.spa-shell-chat' ) 
            };
        };
        // End DOM method /setJqueryMap/

        // Begin DOM methods /changeAnchorPart/
        // Purpose: Changes part of the URI anchor component
        // Arguments:
        //     * arg_map - The map describing what part of the URIanchor we want changed
        // Returns: boolean
        //     * true - the Anchor portion of the URI was update
        //     * false - the Anchor portion of the URI could not be updated
        // Action:
        //     The current anchor rep stored in stateMap.anchor_map.
        //     See uriAnchor for a discussion of encoding.
        //     This method
        //         * Creates a copy of this map using copyAnchorMap().
        //         * Modifies the key-values using arg_map and dependent values in the encoidng.
        //         * Attempts to change the URI using uriAnchor.
        //         * Returns true on success, and false on failure.
        //
        changeAnchorPart = function ( arg_map ) {
            var anchor_map_revise = copyAnchorMap(),
                bool_return = true,
                key_name, key_name_dep;

            // Begin merge changes into anchor map
            KEYVAL:
            for ( key_name in arg_map ) {
                if ( arg_map.hasOwnProperty( key_name ) ) {
                    // skip dependent keys during iteration
                    if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

                    // update independent key value
                    anchor_map_revise[key_name] = arg_map[key_name];

                    // update matching dependent key
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
            // End merge changes into anchor map

            // Begin attempt to update URI; revert if not successful
            try {
                $.uriAnchor.setAnchor( anchor_map_revise );
            }
            catch ( error ) {
                // replace URI with exsiting state
                $.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
                bool_return = false;
            }
            // End attempt to update URI

            return bool_return;
        }
        // End DOM method /changeAnchorPart/


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
        // Begin Event handler /onHashchange/
        // Purpose: Handles the hashchange event
        // Arguments:
        //     * event - jQuery event object.
        // Settings: none
        // Returns: false
        // Action: 
        //     * Parses the URI anchor component
        //     * Compares proposed application state with current
        //     * Adjust the application only where proposed state
        //       differs from existing
        //
        onHashchange = function ( event ) {
            var 
                anchor_map_previous = copyAnchorMap(),
                anchor_map_proposed,
                _s_chat_previous, _s_chat_proposed,
                s_chat_proposed;
            
            // attempt to parse anchor
            try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
            catch ( error ) {
                $.uriAnchor.setAnchor( anchor_map_previous, null, true );
                return false;
            }
            stateMap.anchor_map = anchor_map_proposed;

            // convenience vars
            _s_chat_previous = anchor_map_previous._s_chat;
            _s_chat_proposed = anchor_map_proposed._s_chat;

            // Begin adjust chat component if changed
            if ( !anchor_map_previous || _s_chat_previous !== _s_chat_proposed ) {
                s_chat_proposed = anchor_map_proposed.chat;
                switch ( s_chat_proposed ) {
                    case 'open':
                        toggleChat( true );
                    break;
                    case 'closed':
                        toggleChat( false );
                    break;
                    default:
                        toggleChat( false );
                        delete anchor_map_proposed.chat;
                        $.uriAnchor.setAnchor( anchor_map_proposed, null, true ); 
                }
            }
            // End adjust chat component if changed
            return false;
        };
        // End Event handler /onHashchange/

        // Begin Event handler /onClickChat/
        onClickChat = function () {
            changeAnchorPart({
                chat: ( stateMap.is_chat_retracted ? 'open' : 'closed' )
            });
            return false;
        };
        // End Event handler /onClickChat/

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

            // configure uriAnchor to use our schema
            $.uriAnchor.configModule({
                schema_map: configMap.anchor_schema_map
            });

            // Handle URI anchor change events.
            // This is done /after/ all feature modules are configured
            // andinitialized, otherwise they will not be ready to handle
            // the trigger event, which is used to ensure the anchor
            // is considered on-load
            //
            $(window)
                .bind( 'hashchange', onHashchange )
                .trigger( 'hashchange' );
        };
        // End PUBLIC method /initModule/

        return { initModule: initModule };
        // --------- END PUBLIC METHODS ---------
}());