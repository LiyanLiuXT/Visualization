document.addEventListener('DOMContentLoaded', function() {
    //sidenav
    const nav = document.querySelectorAll('.sidenav');
    var Nav = M.Sidenav.init(nav, {});

    //datePicker
    console.log("11");
    var date = document.querySelectorAll('.datepicker');
    var Date = M.Datepicker.init(date, {
        format:'yyyy/mm/dd',
        showClearBtn:true,
        i18n:{
            months:['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
            monthsShort:['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
            weekdays:['周日','周一','周二','周三','周四','周五','周六'],
            weekdaysShort:['周日','周一','周二','周三','周四','周五','周六'],
            weekdaysAbbrev:['日','一','二','三','四','五','六'],
            clear:'清除',
            done:'完成',
            cancel:'取消'
        },
        container:'body',
        // defaultDate:date1,
        // setDefaultDate:true
    });
    //timePicker
    var time = document.querySelectorAll('.timepicker');
    var Time = M.Timepicker.init(time, {
        container:'body',
        i18n:{
            clear:'清除',
            done:'完成',
            cancel:'取消'
        },
    });
});

