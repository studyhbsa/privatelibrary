/**
 * Created by work on 2017/5/22.
 */

function location_next(self) {
    console.log(self)
    var tr = document.getElementById('5').parentElement;
    tr.style.display = (tr.style.display) ? null : "none"
}

$(function(){
    var md5key = $('table[md5key]').attr('md5key')

    $('input[pair-key]').on('blur', function(e){
        var $self = $(this)
        if($self.attr('pair-value') != $self.val().trim()) {
            var obj = {
                key: $self.attr('pair-key'),
                value: $self.val().trim()
            }
/*            $.post('/update/outlines/'+md5key, obj, function (result) {
                $self.attr('pair-value', obj.value)
                updateok(obj)
            })*/
            $.ajax({
                type: 'POST',
                //crossDomain: true,
                url: '/update/outlines/'+md5key,
                data: obj,
                dataType: 'json',
                //xhrFields: {withCredentials: true},
                success: function (data, textStatus, jqXHR) {
                    $self.attr('pair-value', obj.value)
/*                  console.group('success');
                    updateok(obj)
                    console.groupEnd();*/
                },
                error: function (jqXHR, textStatus, errorText) {
                    alert('error')
                    console.group('error');
                    console.info(textStatus);  //error
                    console.info(errorText); //Not Found
                    console.dir(jqXHR.responseJSON); //response 信息
                    console.groupEnd();
                }
            })
        }
    })

/*    function updateok(obj){
        console.info(obj)
    }*/
})