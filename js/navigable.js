/**
 * Created by Anykey on 07.01.2016.
 *
 * Navigable.js allows you to create a structure controlled both by arrow keys and mouse.
 * VERSION 0.1
 */

$(function () {
    Navigable.init($('.navigable'));
});

var Navigable = (function () {

    var active_row = 0;
    var active_col = 0;

    var activeClassName = 'active';

    // if vertical need to change arrow bindings;
    var vertical = false;


    /**
     *  Navigable menu is abstraction of Navigable DOM
     * */
    var NavigableMenu = (function () {

        var menu = null;

        var isTable;
        var isDivBased;
        var isVertical;


        function init($navigable) {

            isTable = $navigable.is('table');
            isDivBased = $navigable.is('div');
            isVertical = $navigable.attr('data-vertical') == 'true';

            if (isTable)
                menu = new Table($navigable);
            else if (isVertical)
                menu = new DivBasedVertical($navigable);
            else if (isDivBased)
                menu = new DivBased($navigable);
        }

        function activate(row, col) {
            menu.activate(row, col);
        }

        var Table = function ($table) {
            var self = this;
            this.table = {};

            this.init = function () {
                var rows = $table.find('tr');
                self.table.rows_num = rows.length;

                $.each(rows, function (index, row) {
                    //save references for cells
                    var cells = $(row).find('td');
                    row.cells = cells;
                    row.cells_num = cells.length;

                    //save references for rows
                    self.table[index] = row;

                    $.each(cells, function (cell_num, cell) {
                        var $cell = $(cell);
                        $cell.data('row', index);
                        $cell.data('col', cell_num);
                    });

                });
            };

            this.activate = function (row, col) {

                if (row >= self.table.rows_num) {
                    row = 0;
                }
                else if (row < 0) {
                    row = self.table.rows_num - 1;
                }

                if (col >= self.table[row].cells_num) {
                    col = 0;
                }
                else if (col < 0) {
                    col = self.table[row].cells_num - 1;
                }
                Navigable.setActiveCell(row, col);

                console.log(row + ' : ' + col);

                var $cell = $(self.table[row].cells[col]);
                $cell.addClass('active');
            };
            self.init();
        };

        var DivBased = function ($div) {
            var self = this;
            this.divs = {};
            this.cols_per_row = $div.attr('data-items_in_row') || 4;


            this.init = function ($div) {
                var $items = $div.find('.navigable-item');
                this.divs.items = [];
                this.divs.items_count = $items.length;

                $.each($items, function (index, item) {
                    var $item = $(item);

                    self.divs.items[index] = $item;

                    $item.data('col', index);
                    $item.data('row', 0);
                });
            };

            this.activate = function (row, col) {
                col += self.cols_per_row * row;

                col = checkBounds(col);
                row = 0;

                var $item = this.divs.items[col];
                console.log(row + ':' + col);
                console.log($item);

                $item.addClass(activeClassName);
            };

            function checkBounds(col) {
                var max = self.divs.items_count - 1;
                var min = 0;

                if (col == max + 1) {
                    col = 0;
                }
                else if (col == min - 1) {
                    col = max;
                }
                else if (col > max) {
                    col = col % self.cols_per_row;
                }
                else if (col < min) {
                    var offset = Math.abs(col) % self.cols_per_row;
                    col = max - (offset) + 1;

                    //custom case
                    if (col == max + 1) {
                        col = max - self.cols_per_row + 1;
                    }
                }

                Navigable.setActiveCell(0, col);
                return col;
            }

            self.init($div);
        };

        var DivBasedVertical = function ($div) {
            var self = this;
            this.divs = {};
            this.cols_per_row = $div.attr('data-items_in_row') || 4;


            this.init = function ($div) {
                var $items = $div.find('.navigable-item');
                this.divs.items = [];
                this.divs.items_count = $items.length;

                Navigable.setVertical(true);


                $.each($items, function (index, item) {
                    var $item = $(item);

                    self.divs.items[index] = $item;

                    $item.data('col', index);
                    $item.data('row', 0);
                });
            };

            this.activate = function (row, col) {
                col += row * this.cols_per_row;

                col = checkBounds(col);
                row = 0;

                var $item = this.divs.items[col];
                console.log(row + ':' + col);
                console.log($item);

                $item.addClass(activeClassName);
            };

            function checkBounds(col) {
                var max = self.divs.items_count - 1;
                var min = 0;

                if (col == max + 1) {
                    col = 0;
                }
                else if (col == min - 1) {
                    col = max;
                }
                else if (col > max) {
                    col = col % self.cols_per_row;
                }
                else if (col < min) {
                    var offset = Math.abs(col) % self.cols_per_row;
                    col = max - (offset) + 1;

                    //custom case
                    if (col == max + 1) {
                        col = max - self.cols_per_row + 1;
                    }
                }

                Navigable.setActiveCell(0, col);
                return col;
            }

            self.init($div);
        };

        return {
            init: init,
            activate: activate
        }
    })();

    function init($navigable) {

        NavigableMenu.init($navigable);
        bindHoverLogic($navigable);

        refresh();
    }

    function left() {
        if (vertical) active_row--;
        else active_col--;
        refresh();
    }

    function up() {
        if (vertical) active_col--;
        else active_row--;
        refresh();
    }

    function right() {
        if (vertical) active_row++;
        else active_col++;
        refresh();
    }

    function down() {
        if (vertical) active_col++;
        else active_row++;
        refresh();
    }

    function enter() {
        $('.navigable-item.' + activeClassName).click();
    }

    function refresh() {
        deactivateCurrentElement();
        activate(active_row, active_col);
    }

    function activate(row, col) {
        NavigableMenu.activate(row, col);
        bindActiveClick();
    }

    function deactivateCurrentElement() {
        $('.' + activeClassName).removeClass(activeClassName);
    }

    //Bind keyboard events
    $(document).on('keydown', function (e) {
        switch (e.which) {
            case 37: // left
                left();
                break;

            case 38: // up
                up();
                break;

            case 39: // right
                right();
                break;

            case 40: // down
                down();
                break;

            case 13: //enter
                enter();
                break;

            default:
                return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });


    //Bind click events
    function bindActiveClick() {
        var $active = $('.' + activeClassName);

        //Delete all previous handlers
        clearHandlers($active);

        $active.on('click', function () {
            var row = $(this).data('row');
            var cell = $(this).data('col');

            console.log('click ' + row + ' : ' + cell);

            doSomething($(this));
        });
    }

    //bind hover (for mouse manipulation)
    function bindHoverLogic($navigable) {
        $navigable.find('.navigable-item').hover(
            function () { //mouse in
                var row = $(this).data('row');
                var cell = $(this).data('col');

                Navigable.setActiveCell(row, cell);
                refresh();
            },
            function () { //mouse out
                refresh();
            });
    }

    function setActiveCell(row, col) {
        active_row = row;
        active_col = col;
    }

    function setVertical(bool) {
        vertical = bool;
    }

    return {
        init: init,
        setActiveCell: setActiveCell,
        setVertical: setVertical
    }

})();

function doSomething($el) {

    var $links = $el.find('a');
    var $buttons = $el.find('button');

    if ($links.length == 1) {
        var href = $links.attr('href');
        if (href) {
            location.assign(href);
        }
        else {
            clearHandlers($el);
            $links.click();
        }
    }
    else if ($buttons.length == 1) {
        clearHandlers($el);
        $buttons.click();
    }
    else {
        $el.animate(
            {
                'font-size': '2em'
            }, 500,
            function () { //on animation end
                $el.animate({
                    'font-size': '1em'
                }, 500)
            });
    }


}

function clearHandlers($element) {
    $element.off('click');
}


