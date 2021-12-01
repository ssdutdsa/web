var mode = "exploration";
var codetraceColor = 'white';
actionsWidth = 0;

function highlightLine(lineNumbers) {
    $('#codetrace p').css('background-color', colourTheThird).css('color', codetraceColor);
    if (lineNumbers instanceof Array) {
        for (var i = 0; i < lineNumbers.length; i++)
            if (lineNumbers[i] != 0)
                $('#code' + lineNumbers[i]).css('background-color', 'black').css('color', 'white');
    } else
        $('#code' + lineNumbers).css('background-color', 'black').css('color', 'white');
}
var isPlaying = false;
var cur_slide = null;
var last_click = 0;


function showCodetracePanel() {
    var dropdown = new bootstrap.Dropdown($('#codetrace-toggle'));
    dropdown.show();
}

function hideCodetracePanel() {
    var dropdown = new bootstrap.Dropdown($('#codetrace-toggle'));
    dropdown.hide();
}

function triggerRightPanels()
{    
    showCodetracePanel();
}
function extractQnGraph(graph) {
    var vList = graph.internalAdjList;
    var eList = graph.internalEdgeList;
    for (var key in vList) {
        var temp;
        var v = vList[key];
        temp = v.cxPercentage;
        v.cxPercentage = v.cx;
        v.cx = (temp / 100) * MAIN_SVG_WIDTH;
        temp = v.cyPercentage;
        v.cyPercentage = v.cy;
        v.cy = (temp / 100) * MAIN_SVG_HEIGHT;
    }
    return graph;
}

function closeSlide(slide, callback) {
    if (typeof slide == 'undefined' || slide == null) { if (typeof callback == "function") callback(); return }
    lectureDropdownSelect = $('#electure-dropdown');
    $(".menu-highlighted").removeClass("menu-highlighted");
    $('.electure-dialog#electure-' + slide).fadeOut(100, function() {
        var lectureDropdownSelect = $('#electure-dropdown');
        lectureDropdownSelect.detach();
        lectureDropdownSelect.appendTo('#dropdown-temp-holder');
        if (typeof callback == "function") callback();
    })
}

function canContinue() {
    var this_click = (new Date()).getTime();
    if ((this_click - last_click) < 200) return false;
    last_click = this_click;
    return true;
}


function initUI() {
  }

function end_eLecture() {
    $("#mode-menu a").trigger("click");
    hideOverlay();
    closeSlide(cur_slide);
    mode = 'exploration';
}
$(function() {
    $("#speed-input").slider({ min: 200, max: 2000, value: 1500, change: function(event, ui) { gw.setAnimationDuration(2200 - ui.value); } });
    $("#progress-bar").slider({
        range: "min",
        min: 0,
        value: 0,
        slide: function(event, ui) {
            gw.pause();
            gw.jumpToIteration(ui.value, 0);
        },
        stop: function(event, ui) { if (!isPaused) { setTimeout(function() { gw.play(); }, 500); } }
    });
    initUI();
    $('#mode-button').click(function() { $('#other-modes').toggle(); });
    $('#mode-menu').hover(function() { $('#other-modes').show(); }, function() { $('#other-modes').hide(); });
    $('#mode-menu a').hover(function() { $(this).css("background", surpriseColour); }, function() { $(this).css("background", "black"); });
    $('#other-modes a').click(function() {
        var currentMode = $('#mode-button').attr('title');
        var newMode = $(this).attr('title');
        var tmp = $('#mode-button').html().substring(0, $('#mode-button').html().length - 2);
        $('#mode-button').html($(this).html() + ' &#9663;');
        $(this).html(tmp);
        $('#mode-button').attr('title', newMode);
        $(this).attr('title', currentMode);
        if (newMode == "e-Lecture") {
            showOverlay();
            mode = "e-Lecture";
            if (isPlaying) stop();
            ENTER_LECTURE_MODE();
            if (cur_slide == null) cur_slide = ($('#electure-1').length ? '1' : '99');
            openSlide(cur_slide, function() {
                runSlide(cur_slide);
                pushState(cur_slide);
            });
        } else if (newMode == "exploration") {
            makeOverlayTransparent();
            mode = "exploration";
            $('.electure-dialog').hide();
            hideStatusPanel();
            hideCodetracePanel();
            showActionsPanel();
            pushState();
            ENTER_EXPLORE_MODE();
        }
        $('#other-modes').hide();
    });
    $('#status-hide').click(function() {
        if (isStatusOpen())
            hideStatusPanel();
        else
            showStatusPanel();
    });
    $('#codetrace-hide').click(function() {
        if (isCodetraceOpen())
            hideCodetracePanel();
        else
            showCodetracePanel();
    });
    $('#actions-hide').click(function() {
        if (isActionsOpen())
            hideEntireActionsPanel();
        else
            showActionsPanel();
    });
    $('.electure-dialog .electure-print').click(openPrinterFriendly);
    $('.electure-dialog .electure-end').click(end_eLecture);
    $('.electure-dialog .electure-prev').click(function() { openSlide($(this).attr('data-nextid')); });
    $('.electure-dialog .electure-next').click(function() { openSlide($(this).attr('data-nextid')); });
    $(document).keydown(function(event) {
        if (event.which == 32) {
            if (mode != "e-Lecture") {
                if (isPaused)
                    play();
                else
                    pause();
            }
        } else if (event.which == 33) {
            if (mode == "e-Lecture" && !isPlaying)
                $('#electure-' + cur_slide + ' .electure-prev').click();
            event.preventDefault();
        } else if (event.which == 34) {
            if (mode == "e-Lecture" && !isPlaying)
                $('#electure-' + cur_slide + ' .electure-next').click();
            event.preventDefault();
        } else if (event.which == 37) {
            if (mode != "e-Lecture")
                stepBackward();
        } else if (event.which == 39) {
            if (mode != "e-Lecture")
                stepForward();
        } else if (event.which == 27) {
            if ($("#dark-overlay").css('display') == 'none') {
                stop();
                if (mode == "e-Lecture") {
                    $(".menu-highlighted").removeClass("menu-highlighted");
                    end_eLecture();
                } else { $('#other-modes a').click(); }
            }
        } else if (event.which == 35) {
            if (mode != "e-Lecture")
                stop();
        } else if (event.which == 189) {
            var d = (2200 - gw.getAnimationDuration()) - 100;
            $("#speed-input").slider("value", d > 0 ? d : 0);
        } else if (event.which == 187) {
            var d = (2200 - gw.getAnimationDuration()) + 100;
            $("#speed-input").slider("value", d <= 2000 ? d : 2000);
        }
    });
});
var isPaused = false;

function isAtEnd() { return (gw.getCurrentIteration() == (gw.getTotalIteration() - 1)); }

function pause() {
    if (isPlaying) {
        isPaused = true;
        gw.pause();
        $('#play').show();
        $('#pause').hide();
    }
}

function play() {
    if (isPlaying) {
        isPaused = false;
        $('#pause').show();
        $('#play').hide();
        if (isAtEnd())
            gw.replay();
        else
            gw.play();
    }
}

function stepForward() {
    if (isPlaying) {
        pause();
        gw.forceNext(250);
    }
}

function stepBackward() {
    if (isPlaying) {
        pause();
        gw.forcePrevious(250);
    }
}

function goToBeginning() {
    if (isPlaying) {
        gw.jumpToIteration(0, 0);
        pause();
    }
}

function goToEnd() {
    if (isPlaying) {
        gw.jumpToIteration(gw.getTotalIteration() - 1, 0);
        pause();
    }
}

function stop() {
    try { gw.stop(); } catch (err) {}
    isPaused = false;
    isPlaying = false;
    $('#pause').show();
    $('#play').hide();
}