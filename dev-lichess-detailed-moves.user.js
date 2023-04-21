// ==UserScript==
// @name            Lichess - Detailed Moves
// @license         GPL-3.0-only 
// @namespace       https://github.com/sealldeveloper/lichess-better-moves
// @contributionURL https://github.com/sealldeveloper/lichess-better-moves
// @version         0.6
// @description     Show brillant, excellent, great and book moves on lichess.org as chess.com does, an updated version of Thomas Sihapanya's version.
// @author          Seall.DEV & Thomas Sihapnya
// @require         https://greasyfork.org/scripts/47911-font-awesome-all-js/code/Font-awesome%20AllJs.js?version=275337
// @include         /^https\:\/\/lichess\.org\/[a-zA-Z0-9]{8,}/
// @grant           none
// @inject-into     content
// ==/UserScript==
// ==OpenUserJS==
// @author          sealldeveloper
// ==/OpenUserJS==

(function() {
    'use strict';
    const GOOD_MOVE_THRESOLD = 0.6;
    const EXCELLENT_MOVE_THRESOLD = 1;
    const BRILLANT_MOVE_THRESOLD = 2;
    const CHECKMATE_IN_X_MOVES_VALUE = 100;

    let goodMoves = {
        white : {
            'book' : {
                indexes: [],
                count: 0
            },
            'good' : {
                indexes: [],
                count: 0
            },
            'excellent': {
                indexes: [],
                count: 0
            },
            'brillant': {
                indexes: [],
                count: 0
            },
        },
        black : {
            'book' : {
                indexes: [],
                count: 0
            },
            'good' : {
                indexes: [],
                count: 0
            },
            'excellent': {
                indexes: [],
                count: 0
            },
            'brillant': {
                indexes: [],
                count: 0
            },
        }
    }


    /**
     * Wait for the page to load all its elements before running the script
     */
    window.addEventListener('load', function() {

        /**
         * Create click event since .click on elements doesn't work quite well in Chrome
         */
        let clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent('mousedown', true, true);

        /**
         * Moves explorer must be opened to detect book moves. If not, user is prompted to run an analysis and reload the page.
         */
        const formAnalysis = document.getElementsByClassName('future-game-analysis')[0];

        if (typeof(formAnalysis) !== 'undefined') {
            alert('Lichess Detailed Moves: Please run an analysis and reload the page when finished. You will then be prompted to accept cross-origin resource : you can safely allow it (it will fetch data for an opening API) !');
        }

        /**
         * Check if users is in analysis page and analysis has been run
         */
        if (document.getElementsByClassName('analyse__tools').length > 0
            && document.getElementsByClassName('future-game-analysis').length === 0
            && document.getElementsByClassName('computer-analysis active').length > 0) {

            const ecoCodesApiUrl = 'https://github.com/sealldeveloper/lichess-detailed-moves/raw/main/data/eco.json';

            /**
             * Loads ECO codes API
             * https://github.com/sealldeveloper/lichess-detailed-moves/raw/main/data/eco.json
             */
            function loadEcoCodesApi() {
                new XMLHttpRequest({
                    method: "GET",
                    url:ecoCodesApiUrl,
                    onload: function(response) {
                        lichessGoodMoves(JSON.parse(response.responseText));
                    },
                    onerror: function(err) {
                        alert('Lichess Detailed Moves: The script cannot be launched (maybe you have forbid the access to a cross-origin resource ?) - Refresh the page if you want to start again.');
                    }
                });
            }

            function loadMoves(ecoCodes) {
                let domMoves = document.getElementsByTagName('move');
                let moves = [];
                let previousEval = {
                    value: '+0.0',
                    symbol: '+',
                    absVal: '0.0'
                };
                var moveCounter = 0;
                Object.values(domMoves).forEach(domMove => {
                    if (!domMove.classList.contains('empty')) {
                        if ("undefined" !== typeof(domMove.childNodes)) {

                            domMove.childNodes.forEach(node => {

                                if ('SAN' === node.tagName) {
                                    /**
                                     * Handle opening
                                     */
                                    moves.push(node.innerHTML);
                                    

                                    let currentColor = checkColor(moves.length-1);
                                    let currentPgn = createPgnMoves(moves);
                                    let foundOpening = ecoCodes.find(eco => eco.moves.toLowerCase().trim() == currentPgn.toLowerCase().trim());

                                    if (typeof(foundOpening) !== 'undefined') {
                                        handleOpeningMove(node, foundOpening, currentColor, moveCounter);
                                    }

                                    /**
                                     * Handle evaluation
                                     */
                                 	if (!node.innerHTML.endsWith('#')){
                                      let currentEval = {
                                          textValue: domMove.getElementsByTagName('eval')[0].innerHTML,
                                          symbol: domMove.getElementsByTagName('eval')[0].innerHTML.charAt(0)
                                      }

                                      if (currentEval.symbol == '#') {
                                          currentEval.value = currentColor == 'white' ? - CHECKMATE_IN_X_MOVES_VALUE : CHECKMATE_IN_X_MOVES_VALUE;
                                      }
                                      else {
                                          currentEval = {
                                              textValue: currentEval.textValue,
                                              symbol: currentEval.symbol,
                                              value: (currentEval.symbol == '+') ? parseFloat(currentEval.textValue.substring(1)) : 0 - parseFloat(currentEval.textValue.substring(1))
                                          }
                                      }

                                      let delta = currentEval.value - previousEval.value;

                                      let moveText = node.innerHTML;
                                      
                                      if ("white" === currentColor) {
                                          if (delta >= GOOD_MOVE_THRESOLD && delta < EXCELLENT_MOVE_THRESOLD) {
                                              node.innerHTML = '<span style="color: #b2f196;">'+
                                                                      moveText+'!?'+
                                                              '</span>';

                                              goodMoves.white.good.count++;
                                              goodMoves.white.good.indexes.push(moveCounter);
                                          }
                                          if (delta >= EXCELLENT_MOVE_THRESOLD && delta < BRILLANT_MOVE_THRESOLD) {
                                              node.innerHTML = '<span style="color: #96bc4b;">'+
                                                                      moveText+'!'+
                                                              '</span>';

                                              goodMoves.white.excellent.count++;
                                              goodMoves.white.excellent.indexes.push(moveCounter);
                                          }
                                          if (delta >= BRILLANT_MOVE_THRESOLD) {
                                              node.innerHTML = '<span style="color: #1baca6;">'+
                                                                      moveText+'!!'+
                                                              '</span>';

                                              goodMoves.white.brillant.count++;
                                              goodMoves.white.brillant.indexes.push(moveCounter);
                                          }
                                      }

                                      if ("black" === currentColor) {
                                          if (delta <= -GOOD_MOVE_THRESOLD && delta > -EXCELLENT_MOVE_THRESOLD) {
                                              node.innerHTML = '<span style="color: #b2f196;">'+
                                                                      moveText+'!?'+
                                                              '</span>';

                                              goodMoves.black.good.count++;
                                              goodMoves.black.good.indexes.push(moveCounter);
                                          }
                                          if (delta <= -EXCELLENT_MOVE_THRESOLD && delta > -BRILLANT_MOVE_THRESOLD) {
                                              node.innerHTML = '<span style="color: #96bc4b;">'+
                                                                      moveText+'!'+
                                                              '</span>';

                                              goodMoves.black.excellent.count++;
                                              goodMoves.black.excellent.indexes.push(moveCounter);
                                          }
                                          if (delta <= -BRILLANT_MOVE_THRESOLD) {
                                              node.innerHTML = '<span style="color: #1baca6;">'+
                                                                      moveText+'!!'+
                                                              '</span>';

                                              goodMoves.black.brillant.count++;
                                              goodMoves.black.brillant.indexes.push(moveCounter);
                                          }
                                      }

                                      previousEval = currentEval;
                                      
                                    }
                                    moveCounter++

                                }
                            })
                        }
                    }
                });

                return moves;
            }

            function handleOpeningMove(node, opening, currentColor, moveCounter) {
                const moveText = node.innerHTML;

                node.innerHTML = '<span style="color:#a88865;">'+
                                        moveText+
                                        ' <i class="fas fa-book" style="font-size:0.7em"></i>'+
                                '</span>'+
                                '<pre style="font-size:0.7em;width:0;resize:both;overflow:auto">'+opening.name+'</pre>';

                node.parentElement.title = opening.name;

                goodMoves[currentColor].book.count++;
                goodMoves[currentColor].book.indexes.push(moveCounter);
            }

            function checkColor(index) {
                if (0 === index%2) {
                    return "white";
                }
                if (0 !== index%2) {
                    return "black";
                }
            }

            function createPgnMoves(moves) {

                let pgn = '';

                moves.forEach((move, index) => {
                    if ("white" === checkColor(index)) {
                        pgn += (index/2+1) + '. ' + move;
                    }
                    if ("black" === checkColor(index)) {
                        pgn += ' ' + move + ' ';
                    }
                });

                return pgn;
            }

            function showDataInTable() {

                const whiteTable = document.getElementsByClassName('advice-summary__side')[0];
                const blackTable = document.getElementsByClassName('advice-summary__side')[1];

              	function dataPoint(colour,symbol,data,text,table,coloured) {
                    var first = true;
                    table.childNodes.forEach(node => {
                        if (node.innerHTML.includes('inaccuracies') && first === true) {
                            const before=node;
                            const div = document.createElement('div');
                            div.setAttribute('data-symbol', symbol);
                            div.setAttribute('data-color', colour);
                            if (data !== 0){
                                div.style='color: '+coloured;
                            }
                            div.classList.add('symbol','advice-summary__error');
                            const strong = document.createElement('strong');
                            strong.innerHTML = data;
                            div.append(strong);
                            div.innerHTML = div.innerHTML+text;
                            table.insertBefore(div,before);
                            first = false;
                        }
                    })
                }

                function graphDataPoint(data,colour) {
                    const analysisTable = document.getElementsByClassName('highcharts-markers')[0];
                    var nodeCounter = 0
                    analysisTable.childNodes.forEach(node => {
                        data.forEach(async index => {
                            if (nodeCounter === index) {
                                const points = document.getElementsByClassName('highcharts-markers')[0]
                                console.log(unsafeWindow.eval(`console.log(window.Highcharts)`))
                                const point = unsafeWindow.window.Highcharts.charts[0].series[0].data[nodeCounter];
                                const path = document.createElement('path');
                                path.setAttribute('fill', colour+'ff')
                                path.setAttribute('d', `M ${Math.floor(point.plotX)} ${point.plotY-4} C ${Math.floor(point.plotX+5)}.328 ${point.plotY+4} ${Math.floor(plotX)} ${point.plotY+4} C ${Math.floor(point.plotX-6)}.672 ${point.plotY+4} ${Math.floor(point.plotX-6)}.672 ${point.plotY-4} ${Math.floor(plotX)} ${point.plotY-4} Z`);
                                path.setAttribute('stroke', colour+'ff')
                                path.setAttribute('stroke-width', '1px')
                                points.push(path)
                            }
                        })
                        nodeCounter++
                    })
                }

                // White
              	dataPoint('white','!!',goodMoves.white.brillant.count,' brilliancies',whiteTable,'#1baca6');   
              	dataPoint('white','!',goodMoves.white.excellent.count,' excellencies',whiteTable,'#96bc4b');
              	dataPoint('white','!?',goodMoves.white.good.count,' greats',whiteTable,'#b2f196');
              	dataPoint('white','Book',goodMoves.white.book.count,' book',whiteTable,'#a88865');
			
                // Black
                dataPoint('black','!!',goodMoves.black.brillant.count,' brilliancies',blackTable,'#1baca6');
              	dataPoint('black','!',goodMoves.black.excellent.count,' excellencies',blackTable,'#96bc4b');
              	dataPoint('black','!?',goodMoves.black.good.count,' greats',blackTable,'#b2f196');
              	dataPoint('black','Book',goodMoves.black.book.count,' book',blackTable,'#a88865');
              	
                graphDataPoint(goodMoves.white.book.indexes,'#a88865')
                
            }

            function lichessGoodMoves(ecoCodes) {

                console.log('Lichess Detailed Moves: Successfully started!');

                loadMoves(ecoCodes);
                showDataInTable();
            }

            // Start the app !
            loadEcoCodesApi();

        } // check if users is in analysis page
    }, false); // addEventListener('load', callback)
})(); // Immediately-Invoked Function Expression (function() {})())
