        
 $(function() {
   
        var data = {},
            select = $("#selectFirst, #selectSecond"),
            input = $('#inputFirst, #inputSecond'),
            moneyLabel = $('.money-label'),
            userPINentered = '',
            userPIN = '',
            testPIN,
            prevSelected;


        $.getJSON("data.json", function(res) {
            data = res;

            $.each(data.currency, function(key, value) {
                select.append('<option value=' + key + '>' + key + '</option>');
            });
            userPIN = data.user.pin;

            testPIN = '<p style="color:red">testPIN: <span>'+ userPIN + '</span></p>';
        

            // initialize selected states

            $(select[0]).find('option').eq(0).attr('selected', true);
            $(select[1]).find('option').eq(2).attr('selected', true);

            //initialize UI state
            updateFields(1);

            // user events
            input.on('focus', function() {
                // $('.field-box-label').removeClass('label-active');
                $(this).parent().prev().find('.field-box-label').addClass('label-active');

            })
            .on('blur', function() {
                $('.field-box-label').removeClass('label-active');
            }).keyup(function() {
                var firstInput;
                // only accept numbers
                this.value = this.value.replace(/[^0-9\.]/g,'');

                if ($(this).attr('data-input') == 1)
                    firstInput = 1;
                else
                    firstInput = 0;
                updateFields(firstInput);
            });

         
            select.on('focus', function() {

                // Store the current value on focus and on change
                prevSelected = this.value;


            }).change(function() {
                var firstInput;
                // get selected option
                var optionSelected = $("option:selected", this);
                var valueSelected = this.value;
                var imgSrc = data.currency[valueSelected].img;


                // update flag in selected field
                select.filter($(this)).parent().next().find('.flag').attr("src", imgSrc);

                // check for the same values selecled in both lists
                if ($(select[0]).val() == valueSelected && $(select[1]).val() == valueSelected) {
           
                    // swap other list dropdown with prevbiously selected value
                    select.not($(this)).val(prevSelected);

                    // update other input flag
                    imgSrc = data.currency[prevSelected].img;
                    select.not($(this)).parent().next().find('.flag').attr("src", imgSrc);

                    // swap input values
                    var inputSwap = $(input[0]).val();
                    $(input[0]).val($(input[1]).val());
                    $(input[1]).val(inputSwap);

                    // remove focus in order to re-focus on 
                    select.blur();
                }

                // remove all other selected attribute for current list
                select.filter($(this)).find('option').removeAttr('selected');

                // determine whether first or second dropdown list
                if ($(this).attr('data-input') == 1)
                    firstInput = 1;
                else
                    firstInput = 0;


                // added selected attribute to selected option
                optionSelected.attr('selected', true);

                updateFields(firstInput);
            });



            function updateFields(firstInput) {

                var rate, amountFirst, amountSecond, base, to, fee;

                //swap inputs if the same selected

                if (firstInput) {
                    base = $(select[0]).val();
                    to = $(select[1]).val();
                    rate = data.currency[base].rate[to];
                    // GBP as base fee rate, check if 'to' rate is also GBP
                    fee = typeof data.currency['GBP'].rate[to] === "undefined" ? data.details.fee : data.currency['GBP'].rate[to] * data.details.fee;

                    $('#rate').find('span').html(rate);
                    amountFirst = $(input[0]).val();


                    amountSecond = ((rate * amountFirst) - fee ).toFixed(2);
               
                    $(input[1]).val(amountSecond);


                    formatCurrency(amountFirst, amountSecond, base, to);
               
                    
                } else {
                    base = $(select[1]).val();
                    to = $(select[0]).val();
                    rate = data.currency[base].rate[to];

                    fee = typeof data.currency['GBP'].rate[base] === "undefined" ? data.details.fee : data.currency['GBP'].rate[base] * data.details.fee;
                    $('#rate').find('span').html(rate);
                    // amount received minus fee
                    amountSecond = $(input[1]).val();
                    amountFirst = ((rate * amountSecond) - fee ).toFixed(2);
                    $(input[0]).val(amountFirst);

                    formatCurrency(amountFirst, amountSecond, to, base);

                }

            }


            // decimal point number formatted with comma's 
             function formatCurrency(amountFirst, amountSecond, base, to) {
                
                    var sym1 = data.currency[base].symbol;
                    var sym2 = data.currency[to].symbol;

                    var whole1 = amountFirst.split(".")[0];
                    var whole2 = amountSecond.split(".")[0];

                    whole1 = commaToThousand(whole1);
                    whole2 = commaToThousand(whole2);
                    
                    var dec1 = getDecimal(amountFirst);
                    var dec2 = getDecimal(amountSecond);
            
                    $(moneyLabel[0]).find('.whole').html(sym1 + whole1)
                    $(moneyLabel[0]).find('.decimal').html('.' + dec1);

                    $(moneyLabel[1]).find('.whole').html(sym2 + whole2)
                    $(moneyLabel[1]).find('.decimal').html('.' + dec2);

                    $('#panelAmountSent').html(sym1 + amountFirst);
                    $('#panelAmountReceived').html(sym2 + amountSecond);

            }

            // seperate thosands with commas
            function commaToThousand(str){
                return str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            }

            // get decimal portion to 2 characters
            function getDecimal(str){
                   var dec = str.split(".")[1];
                   return (typeof dec === "undefined" ? '00' : dec).substring(0,2);
            }

        });


            // test PIN from json data   
            $('.test').html(testPIN);

            //jQuery time
            var current_fs, next_fs, previous_fs; //fieldsets
            var left, opacity, scale; //fieldset properties which we will animate
            var animating; //flag to prevent quick multi-click glitches


            var currentDigit, currentDigitIsEmpty,
                digits = $(".digit");

            var preVal;

            digits.click(function() {

                currentDigit = $(this);
                preVal = currentDigit.val();
                currentDigitIsEmpty = currentDigit.val().length === 0;



                // if not empty remove value in field
                if (!currentDigitIsEmpty) {

                    // reinstate number when moved out of focus without key event
                    currentDigit.val('');
 
                }

            });


            digits.blur(function() {
                prevDigit = $(this);
                if (prevDigit.val().length === 0) {


                    prevDigit.val(preVal);
                }

            });

            digits.keyup(function(e) {
                e.preventDefault();
                currentDigit = $(this);

                currentDigit.val(currentDigit.val())

                if (this.value.length == this.maxLength) {
                    currentDigitnxt = currentDigit.next('.digit');
                    // less than 6 digits

                    if (currentDigit.index() < (digits.length - 1)) {
                        if (currentDigitnxt.val().length === 0)
                            currentDigitnxt.focus();
                    }
                }
            })


            $(".next").click(function() {
                if (animating) return false;
                animating = true;

                var nextButton = $(this);

                current_fs = $(this).parent();
                next_fs = $(this).parent().next();
                var modal = false;

                if (nextButton.attr('data') == 'modal') {
                    modal = 'modalInit';
                    var modalContent = $('.modalContent');

                    $.featherlight(modalContent, {
                        closeOnClick: false,
                        otherClose: '.back',
                        closeOnEsc: false,
                        closeIcon: null,
                        // targetAttr:    'modal'  
                        afterClose: function() {

                            // so modal will pop up after clicking back button
                            animating = false;
                        }

                    });
                }



                //hide the current fieldset with style
                var animate = current_fs.animate({
                    opacity: 0
                }, {

                    step: function(now, mx) {
                        //activate next step on progressbar using the index of next_fs
                        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

                        //$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
                        //show the next fieldset
                        next_fs.show();
                        //as the opacity of current_fs reduces to 0 - stored in "now"
                        //1. scale current_fs down to 80%
                        scale = 1 - (1 - now) * 0.1;
                        //2. bring next_fs from the right(50%)
                        left = (now * 50) + "%";
                        //3. increase opacity of next_fs to 1 as it moves in
                        opacity = 1 - now;
                        current_fs.css({
                            'transform': 'scale(' + scale + ')'
                        });
                        next_fs.css({
                            'left': left,
                            'opacity': opacity
                        });
                    },
                    queue: modal,
                    duration: 800,
                    complete: function() {
                        current_fs.hide();
                        animating = false;
                        // remove modal once verified
                        nextButton.removeAttr('data');
                    },
                    //this comes from the custom easing plugin
                    easing: 'easeInOutBack'
                });

                // $(".back").click(function(){
                //  animate.clearQueue("modalInit");
                //  });

                $(function() {

                    $(".verify").click(function() {
                        // get digits enter from verify pin form
                        var verified = false;
                        var x = $(this).parent().prev("form").serializeArray();
                        var currentModal = $.featherlight.current();

                        $.each(x, function(i, field) {
                            userPINentered += field.value;
                        });

                        verified = userPIN == userPINentered;


                        if (verified) {
                            $(".verify").append('<i class="material-icons right">done</i>');
                            setTimeout(function() {
                                animate.dequeue("modalInit");
                                currentModal.close();
                            }, 1200);

                        }

                        userPINentered = '';

                    });
                });




            });



            $(".previous").click(function() {
                if (animating) return false;
                animating = true;

                current_fs = $(this).parent();
                previous_fs = $(this).parent().prev();

                //de-activate current step on progressbar
                $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

                //show the previous fieldset
                previous_fs.show();
                //hide the current fieldset with style
                current_fs.animate({
                    opacity: 0
                }, {
                    step: function(now, mx) {
                        //as the opacity of current_fs reduces to 0 - stored in "now"
                        //1. scale previous_fs from 80% to 100%
                        scale = 0.8 + (1 - now) * 0.2;
                        //2. take current_fs to the right(50%) - from 0%
                        left = ((1 - now) * 50) + "%";
                        //3. increase opacity of previous_fs to 1 as it moves in
                        opacity = 1 - now;
                        current_fs.css({
                            'left': left
                        });
                        previous_fs.css({
                            'transform': 'scale(' + scale + ')',
                            'opacity': opacity
                        });
                    },
                    duration: 800,
                    complete: function() {
                        current_fs.hide();
                        animating = false;
                    },
                    //this comes from the custom easing plugin
                    easing: 'easeInOutBack'
                });
            });

});