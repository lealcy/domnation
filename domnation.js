function Domnation(mapElement)
{
	var domnation = {};

	var DEFAULT_MAP =
        "..3.....3..\n" +
        "...0...0...\n" +
        "..1111111..\n" +
        ".11.111.11.\n" +
        "11111111111\n" +
        "1.1111111.1\n" +
        "B.0.....0.G\n" +
        "...22.22...";

    var INVALID = -1;
	var VACANT = 0;
	var BROWN_ARMY = 1;
	var GREEN_ARMY = 2;
	var BLOCKED = 99;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var KEY_LEFT = 37;
    var KEY_CACHE_TIMEOUT = 200;
	
    var source = null;
	var currentPlayer = null;
	var customMap = null;
    var keys = [];
    var lastPos = {
        BROWN_ARMY:  null,
        GREEN_ARMY: null
    };

	function getPos(i, j)
	{
		return $(mapElement).children(".pos[data-i=" + i + "][data-j=" + j + "]");
	}

	function isAdjacent(source, dest) {
		var s = $(source).data();
		var d = $(dest).data();
		for (var i = s.i - 1; i <= s.i + 1; i++) {
			for (var j = s.j - 1; j <= s.j + 1; j++) {
				if (d.i === i && d.j === j) {
					return true;
				}
			}
		}
		return false;
	}

	function createBlock(column, row, owner, army, bonus)
	{
		return '<div class="pos" id="b_' + column + '_' + row + 
			'" data-owner="' + owner + '" data-army="' + army + '" data-i="' + column + 
			'" data-j="' + row + '" data-inc="' + bonus + 
			'"><span class="armies"></span></div>';
	}

	function setUp()
	{
		var map = customMap ? customMap : DEFAULT_MAP;
		var mapHtml = "";
		var column = 1;
		var row = 1;
		for (var i = 0, j = map.length; i < j; i++) {
			switch (map[i]) {
                case "B": case "b":
                    mapHtml += createBlock(column, row, BROWN_ARMY, 3, 1);
                    break;
                case "G": case "g":
                    mapHtml += createBlock(column, row, GREEN_ARMY, 3, 1);
                    break;
                case "0": case "1": case "2": case "3":
                    mapHtml += createBlock(column, row, VACANT, 0, map[i]);
                    break;
                case ".":
                    mapHtml += createBlock(column, row, BLOCKED, 0, 0);
                    break;
                case "\n":
                    mapHtml += "<br />";
                    row++;
                    column = 0;
                    break;
			}
			column++;
		}
		
		$(mapElement).html(mapHtml);
		currentPlayer = BROWN_ARMY;
		
		$(mapElement + " > .pos > .armies").html("&nbsp;").css({
			"color": "Black",
			"font-weight": "bold",
			"font-family": "monospace",
			"text-align": "right",
			"vertical-align": "top",
			"background-color": "transparent"
		});
        
        
        $(document).keydown(function(e) {
            console.log(e.which);
            if (source && [KEY_UP, KEY_RIGHT, KEY_DOWN, KEY_LEFT].indexOf(e.which) !== -1) {
                e.preventDefault();
                keys.push(e.which);
            } else {
                keys.length = 0;
            }
        });
        
        function processKey()
        { 
            if (keys.length) {
                var vertical = 0;
                var horizontal = 0;
                var sourceData = $(source).data();
                var key = keys.shift();
                while (key) {
                    switch (key) {
                        case KEY_UP: vertical = -1; break;
                        case KEY_RIGHT: horizontal = 1; break;
                        case KEY_DOWN: vertical = 1; break;
                        case KEY_LEFT: horizontal = -1; break;
                    }
                    key = keys.shift();
                }
                var $target = getPos(sourceData.i + horizontal, sourceData.j + vertical);
                if ($target) {
                    $target.click();
                }
            }
            setTimeout(processKey, KEY_CACHE_TIMEOUT);
        }
        setTimeout(processKey, KEY_CACHE_TIMEOUT);
		
		refresh();
	}

	function refresh()
	{
		var hasBrownArmy = false;
		var hasGreenArmy = false;

		$(mapElement).children(".pos").css({
			"display": "inline-block",
			"text-align": "right",
			"vertical-align": "top",
			"border": "1px solid transparent",
			"width": "32px",
			"height": "32",
			"margin": "0px",
			"padding": "0px"
		});
		
		$(mapElement).children(".pos").each(function() {
			var $this = $(this);
			var data = $this.data();
			//console.log("-- refresh on: " + data.i + ", " + data.j + ", owner = " + data.owner + " --");
			if (data.owner !== BLOCKED && !data.army) {
				data.owner = VACANT;
			}
			
			switch (data.owner) {
                case BLOCKED:
                    $this.css("background", "url(blocked.png)");
                    break;
                case VACANT:
                    $this.css("background", "url(vacant.png)");
                    data.army = 0;
                    break;
                case BROWN_ARMY:
                    $this.css("background", "url(brown.gif)");
                    hasBrownArmy = true;
                    break;
                case GREEN_ARMY:
                    $this.css("background", "url(green.gif)");
                    hasGreenArmy = true;
                    break;
			}

			if (data.army > 1) {
				$this.children(".armies").html(data.army).css("background-color", "#5BA426");
			} else {
				$this.children(".armies").html("&nbsp;").css("background-color", "transparent");
			}
		});
		
		if (source) {
			var sdata = $(source).data();
			if (sdata.army > 1) {
				for (var i = sdata.i - 1, j = sdata.i + 1; i <= j; i++) {
					for (var m = sdata.j - 1, n = sdata.j + 1; m <= n; m++) {
						var $adjacent = getPos(i, m);
                        var owner = $adjacent.data() ? $adjacent.data().owner : INVALID;
                        if (owner === VACANT || owner === currentPlayer) {
							$adjacent.css("border", "1px solid yellow");
						} else if (owner !== INVALID && owner !== BLOCKED) {
							$adjacent.css("border", "1px solid red");
                        }
					}
				}
			}
			$(source).css("border", "1px solid " + (currentPlayer === BROWN_ARMY ? "brown" : "green"));
		}
		
		if (!hasBrownArmy && !hasGreenArmy) {
			alert("Draw game!");
			setUp();
		} else if (!hasBrownArmy) {
			alert("Green Army wins!");
			setUp();
		} else if (!hasGreenArmy) {
			alert("Brown Army wins!");
			setUp();
		}
	}

	$(mapElement).on("click", ".pos", function() {
		var s = $(source).data();
		var d = $(this).data();
		console.log("-- click on: " + d.i + ", " + d.j + ", owner = " + d.owner + " --");
		if (source) {
			console.log("source is " + s.i + ", " + s.j + " --");
			if (source === this) {
				source = null;
			} else if (isAdjacent(source, this)) {
				console.log("destination is adjacent");
				if (d.owner === currentPlayer) {
					console.log("destination (adjacent) belongs to the current player");
					d.army += s.army - 1;
					s.army = 1;
					source = this;
				} else if (d.owner === BLOCKED) {
					// do nothing
				} else if (d.owner === VACANT) {
					console.log("destination is vacant");
					if (s.army > 1) {
						console.log("moving army");
						d.owner = currentPlayer;
						d.army = s.army - 1;
						s.army = 1;
						source = this;
					} else {
						console.log("not enough army to move");
						source = null;
					}
				} else {
					console.log("destinastion is enemy territory");
					// Attack
					if (d.army === s.army) {
						console.log("armies are equivalent");
						d.army = s.army = 0;
						source = null;
					} else if (d.army < s.army) {
						console.log("source army is greater");
						d.army = Math.floor(s.army - (d.army / 2)) - 1;
						s.army = 1;
						d.owner = s.owner;
						source = this;
					} else {
						console.log("destination army is greater");
						d.army = Math.floor(d.army - (s.army / 2));
						s.army = 0;
						source = null;
					}
				}
			} else if (d.owner === currentPlayer) {
				console.log("destination (not adjacent) belongs to the current player");
				source = this;
			} else {
				console.log("destination is not adjacent");
				source = null;
			}
		} else if (d.owner === currentPlayer) {
			console.log("new source");
			source = this;
		}
		refresh();
	});

	domnation.endTurn = function() {
		if (currentPlayer === GREEN_ARMY) {
			$(mapElement).children(".pos").each(function() {
				var data = $(this).data();
				if (data.owner === BROWN_ARMY || data.owner === GREEN_ARMY) {
					data.army += data.inc;
				}
			});
		}
        
        lastPos[currentPlayer] = source;
		currentPlayer = currentPlayer === BROWN_ARMY ? GREEN_ARMY : BROWN_ARMY;
        
        var pos = lastPos[currentPlayer];
        source = pos && $(pos).data().owner === currentPlayer ? pos : null;
        
		refresh();
	};
	
	domnation.getMap = function(){
		return customMap ? customMap : DEFAULT_MAP;
	};
	
	domnation.setCustomMap = function(map) {
		customMap = map;
		setUp();
	};
	
	domnation.getCurrentPlayerName = function() {
		return currentPlayer === BROWN_ARMY ? "Brown Army" : "Green Army";
	};
	
	setUp();
	
	return domnation;
}