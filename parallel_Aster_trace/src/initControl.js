console.log("initControl");
document.addEventListener('DOMContentLoaded', function () {
    //sidenav
    const nav = document.querySelectorAll('.sidenav');
    var Nav = M.Sidenav.init(nav, {});

    //selector
    var selector = document.querySelectorAll('select');
    var Selector = M.FormSelect.init(selector, {});

    //slider
    var slider = document.getElementById('test-slider');
    noUiSlider.create(slider, {
        start: [6, 12],
        connect: true,
        step: 1,
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
            'min': 0,
            'max': 24
        },
        format: wNumb({
            decimals: 0
        })
    });
    //datePicker
    // var date = document.querySelectorAll('.datepicker');
    // var Date = M.Datepicker.init(date, {
    //     format:'yyyy/mm/dd',
    //     showClearBtn:true,
    //     i18n:{
    //         months:['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    //         monthsShort:['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    //         weekdays:['周日','周一','周二','周三','周四','周五','周六'],
    //         weekdaysShort:['周日','周一','周二','周三','周四','周五','周六'],
    //         weekdaysAbbrev:['日','一','二','三','四','五','六'],
    //         clear:'清除',
    //         done:'完成',
    //         cancel:'取消'
    //     },
    //     container:'body',
    //     // defaultDate:date1,
    //     // setDefaultDate:true
    // });
    // //timePicker
    // var time = document.querySelectorAll('.timepicker');
    // var Time = M.Timepicker.init(time, {
    //     container:'body',
    //     i18n:{
    //         clear:'清除',
    //         done:'完成',
    //         cancel:'取消'
    //     },
    // });
});

let NMF_time_slider = document.getElementById('NMF_time');
noUiSlider.create(NMF_time_slider, {
    start: [5, 20],
    connect: true,
    range: {
        min: 0,
        max: 23
    },
    pips: {
        mode: 'values',
        values: [0, 6, 12, 18, 23],
        density: 4
    }
});
NMF_time_slider.noUiSlider.on('update', function (value, handle) {
    time_nmf[handle] = value[handle];
    Handle_nmf = handle;
});
var TraVis_time_slider = document.getElementById('TraVis_time');
noUiSlider.create(TraVis_time_slider, {
    start: 5,
    range: {
        min: 0,
        max: 23
    },
    pips: {
        mode: 'values',
        values: [0, 6, 12, 18, 23],
        density: 4
    }
});
TraVis_time_slider.noUiSlider.on('update', function (value, handle) {
    time[handle] = value[handle];
    Handle = handle;
});
$("#nmf_control").hide();
$("#chart").hide();
$("#InteractiveView").hide();
$("#parallel").hide();
$("#aster").hide();

$(document).ready(function () {
    drawNMF_graph();
    $("input").change(function () {
        if ($("#checkNMF").is(':checked')) {
            $("#nmf_control").show();
            $("#chart").show();
            $("#chart_card").show();
            localStorage.setItem("switchTraNmf", 1);
        } else {
            $("#nmf_control").hide();
            $("#chart").hide();
            $("#chart_card").hide();
            localStorage.setItem("switchTraNmf", 0);
        }
        if ($("#checkTrafficFlow").is(':checked')) {
            localStorage.setItem("switchTrafficFlow", 1);
            $("#TraVis_control").show();
            $("#parallel").show();
            $("#parallel_card").show();
            $("#aster").show();
            // $("#aster_card").show();
        } else {
            localStorage.setItem("switchTrafficFlow", 0);
            $("#TraVis_control").hide();
            $("#parallel").hide();
            $("#aster").hide();
            $("#parallel_card").hide();
            // $("#aster_card").hide();
        }
        if ($("#checkInterView").is(':checked')) {
            localStorage.setItem("InteractiveView", 1);
            $("#InteractiveView").show();
        } else {
            localStorage.setItem("InteractiveView", 0);
            $("#InteractiveView").hide();
        }
    });
    if ($("#checkNMF").is(':checked')) {
        $("#nmf_control").show();
        $("#chart").show();
        localStorage.setItem("switchTraNmf", 1);
    } else {
        $("#nmf_control").hide();
        $("#chart").hide();
        localStorage.setItem("switchTraNmf", 0);
    }
    if ($("#checkTrafficFlow").is(':checked')) {
        localStorage.setItem("switchTrafficFlow", 1);
        $("#TraVis_control").show();
    } else {
        localStorage.setItem("switchTrafficFlow", 0);
        $("#TraVis_control").hide();
    }
    if ($("#checkInterView").is(':checked')) {
        localStorage.setItem("InteractiveView", 1);
        $("#InteractiveView").show();
    } else {
        localStorage.setItem("InteractiveView", 0);
        $("#InteractiveView").hide();
    }
    // if($("#checkCompare").is(':checked')){
    //     localStorage.setItem("optionOfCompare",1);
    // }
    // else {
    //     localStorage.setItem("optionOfCompare",0);
    // }
});

//control onclick
function c_onclick() {
    console.log("c_onclick");
    let switchTraNmf = localStorage.getItem("switchTraNmf");
    let switchTrafficFlow = localStorage.getItem("switchTrafficFlow")
    if (switchTraNmf == 1) {
        drawNMFmapHourly();
        console.log("drawNMFmapHourly");
    }
    if (switchTrafficFlow == 1) {
        drawGrids();
        console.log("drawGrid");
    }
}

function checkCancel(Obj) {
    $("input[name='group0']").each(function () {
        $(this).prop("checked",false);
    })
   Obj.checked = true;
}
