import './vendor';

(function setDatePlaceholder() {
  var now = new Date();

  var dd = now.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = now.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  var yy = now.getFullYear();

  var dateNewFormat = dd + '.' + mm + '.' + yy;

  $('.input-date').attr('placeholder', dateNewFormat);
})();
(function initDatapicker() {
  $('.date-start').datetimepicker({
    format:'d.m.Y',
    minDate:0,
    onShow:function( ct ){
      this.setOptions({
        maxDate:jQuery('.date-end').val()?jQuery('.date-end').val():false
      })
    },
    timepicker:false
  });
  $('.date-end').datetimepicker({
    format:'d.m.Y',
    minDate:0,
    onShow:function( ct ){
      this.setOptions({
        minDate:jQuery('.date-start').val()?jQuery('.date-start').val():false
      })
    },
    timepicker:false
  });
  $.datetimepicker.setLocale('ru');
})();
(function addMaskInput() {
  $('.input-guests-count').mask("a#", {
    "#": {pattern: "^[0-9]+$"},
    translation: {
      'a': {
        pattern: "[1-9]",
      }
    }
  });
})();
