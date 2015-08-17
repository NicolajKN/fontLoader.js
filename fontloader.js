
/*
 * Font loader interface for FontFaceObserver
 * Based on FilamentGroups source code in https://github.com/filamentgroup/font-loading/blob/master/font-events.html
 *
 */

(function( d, w ){
    'use strict';

    var fontLoader = {

        bodyClass: 'fonts-loaded',

        cookieName: 'fontsLoaded',

        observers: [],

        // http://lea.verou.me/2009/12/reading-cookies-the-regular-expression-way/
        readCookie: function() {
            var name = this.cookieName;

            var regex = new RegExp('(?:^|;)\\s?' + name + '=(.*?)(?:;|$)','i'),
                match = d.cookie.match(regex);

            return match && unescape(match[1]); // thanks James!
        },

        setCookie: function() {
            var date = new Date(),
                value = 'true';
    		date.setTime( date.getTime() + ( 1*24*60*60*1000 ) );
    		var expires = '; expires=' + date.toGMTString();
            d.cookie = this.cookieName+'='+value+expires+'; path=/';
        },

        addFont: function ( name, attrs ) {
            var observer = new w.FontFaceObserver( name, attrs );
            this.observers.push( observer );
        },

        load: function () {
            if ( d.getElementsByTagName( 'html' )[ 0 ].className.indexOf( this.bodyClass ) != -1 ) {
                return;
            }

            var promises = [],
                that = this;

            for ( var i = 0; i < this.observers.length; i++ ) {
                var observer =  this.observers[ i ];

                promises.push( observer.check() );
            }

            this.resolveAll( promises ).then(function(){
                that.showFonts();
            });

        },

        // Very simple callback function for promises
        resolveAll: function( promiseArr ) {

            var resolver = {

                num: promiseArr.length,

                cb: function(){},

                resolveOne: function() {
                    this.num--;

                    if ( this.num <= 0 ) {
                        this.resolve();
                    }
                },

                resolve: function() {
                    this.cb();
                },

                then: function( cb )Â {
                    this.cb = cb;
                }

            };

            for (var i = 0; i < promiseArr.length; i++) {
                promiseArr[ i ].then(function () {
                    resolver.resolveOne();
                });
            }

            return resolver;

        },

        showFonts: function () {
            d.getElementsByTagName( 'html' )[ 0 ].className += ' ' + this.bodyClass;

            this.setCookie();
        }

    };

    // Read the cookie and bypass the slow checks
    if ( fontLoader.readCookie() === 'true' ) {
        fontLoader.showFonts();
    }

    w.fontLoader = fontLoader;

})( document, window );
