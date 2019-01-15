document.addEventListener('DOMContentLoaded', function() {
    //sidenav
    const nav = document.querySelectorAll('.sidenav');
    var Nav = M.Sidenav.init(nav, {
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
    start: [5,20],
    connect:true,
    range: {
        min: 0,
        max: 23
    },
    pips: {
        mode: 'values',
        values: [0,6,12,18,23],
        density: 4
    }
});
NMF_time_slider.noUiSlider.on('update',function (value,handle) {
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
        values: [0,6,12,18,23],
        density: 4
    }
});
TraVis_time_slider.noUiSlider.on('update',function (value,handle) {
   time[handle] = value[handle];
   Handle = handle;
});
$("#nmf_control").hide();
$("#chart").hide();
$(document).ready(function () {
    drawNMF_graph();
    $("input").change(function() {
        if($("#checkNMF").is(':checked')) {
            $("#nmf_control").show();
            $("#TraVis_control").hide();
            $("#chart").show();
            localStorage.setItem("switchTraNmf",1);
        }
        else if($("#checkTrafficFlow").is(':checked')){
            localStorage.setItem("switchTraNmf",0);
            $("#TraVis_control").show();
            $("#nmf_control").hide();
            $("#chart").hide();
        }
    });
    if($("#checkNMF").is(':checked')){
        localStorage.setItem("switchTraNmf",1);
    }
    else if($("#checkTrafficFlow").is(':checked')){
        localStorage.setItem("switchTraNmf",0);
    }
    if($("#checkCompare").is(':checked')){
        localStorage.setItem("optionOfCompare",1);
    }
    else {
        localStorage.setItem("optionOfCompare",0);
    }
});

//control onclick
function c_onclick() {
    console.log("c_onclick");
    let switchTraNmf = localStorage.getItem("switchTraNmf");
    console.log("switchTraNmf", switchTraNmf);
   if(switchTraNmf==0){
       drawGrids();
   }
   else {
       drawNMFmapHourly();
   }
}

