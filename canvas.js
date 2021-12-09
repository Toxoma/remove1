let ajax_modal = $('#ajaxModal');

fabric = (function (f) {
    var dblClickSubscribers = [];
    var nativeCanvas = f.Canvas;
    f.Canvas = (function (domId, options) {
        var canvasDomElement = document.getElementById(domId);
        var c = new nativeCanvas(domId, options);
        c.dblclick = function (handler) {
            dblClickSubscribers.push(handler)
        };
        canvasDomElement.nextSibling.ondblclick = function (ev) {
            for (var i = 0; i < dblClickSubscribers.length; i++) {
                dblClickSubscribers[i]({
                    e: ev
                });
            }
        };
        return c;
    });
    return f;
}(fabric));

fabric.Object.prototype.borderColor = 'red';
fabric.Object.prototype.borderScaleFactor = 2;
fabric.Object.prototype.borderOpacityWhenMoving = 0.2;
fabric.Object.prototype.cornerColor = 'green';
fabric.Object.prototype.cornerSize = 30;
fabric.Object.prototype.transparentCorners = false;

const canvas = this.__canvas = new fabric.Canvas('c');
let ctx = canvas.getContext('2d');
canvas.set({
    preserveObjectStacking: true,
});

function setImageAsBg() {
    canvas.setBackgroundImage(mainFoto, canvas.renderAll.bind(canvas));
}

function loadMainPhotoFromUrl(url) {
    fabric.Image.fromURL(url,
        function (img) {
            img.set({
                erasable: false,
                id: 'mainFoto',
            });

            if ($('#scaleToWidth').is(':checked')) {
                img.scaleToWidth(450);
            }

            if ($('#scaleToHeight').is(':checked')) {
                img.scaleToHeight(600);
            }

            mainFoto = img;
            setImageAsBg();
        }
    );
}

function loadPhotoFromWb(id_project) {
    if (confirm('Внимание! При успешной загрузке фотографий все данные проекта будут очищены! Продолжить?')) {
        let progressModal = $('#progressModal');

        $.get('/project/download-photo/?project_id=' + id_project, function (json) {
            if (json.status == 'ok') {
                progressModal.modal('show');
                $('.project-image-list').html('');

                let total_photos = json.images.length;
                for (let i = 0; i <= total_photos; i++) {
                    if (json.images[i] == 'undefined') {
                        continue;
                    }

                    let num_photo = i + 1;
                    $.ajax('/project/check-download-progress/?project_id=' + id_project + '&image=' + json.images[i], {
                        async: false,
                        success: function (image) {
                            progressModal.find('.progress-bar').css('width', (num_photo * 100 / total_photos) + '%');
                            $('.project-image-list').prepend(image);

                            //!
                            // if (num_photo == total_photos) {
                            //     document.location.href = '/project/editor/?id=' + id_project;
                            // }
                        },
                        error: function (jqXHR, exception) {
                            findProblem(jqXHR, exception);
                        }
                    });
                }
            } else {
                ajax_modal.find('.modal-content').html(json.error);
                ajax_modal.modal('show');
            }
        });
    }
}

function setScale(value) {
    if (value == "0.5") {
        document.documentElement.style.cssText = "--width: 450px";
    } else if (value == '0.75') {
        document.documentElement.style.cssText = "--width: 675px";
    } else if (value == '1') {
        document.documentElement.style.cssText = "--width: 900px";
    }else if (value === 'smart'){
        document.documentElement.style.cssText = "min(calc(80vw - 2rem), 900px)";
    }
}

let targetImage = null;

canvas.on('mouse:up', function (opt) {
    let obj = opt.target;
    targetImage = null;
    
    $('#imageBorderCircle').prop('checked', false);
    $('#our-demo .redactor .image .image-border-circle').show();

    if (obj) {
        function text(obj){
            if (obj.type == 'textbox' || obj.type == 'i-text' || obj.type == 'text') {
                $('#textContent').show();
                $('button#text').click();
            }
        }

        function image(obj){
            if (obj.type == 'image') {
                targetImage = obj;

                $('button#image').click();
                $('#imageBorderCircle').prop('checked', (obj.clipPath && obj.clipPath.type === 'circle')?true:false);
            }
        }

        if (obj.type==='group') {
            $('#our-demo .redactor .image .image-border-circle').hide();

            findInnerElems(obj, text);
            findInnerElems(obj, image);
        }else{
            text(obj);
            image(obj);
        }

    }else{
        $('#textContent').hide();
        $('#newTextContent').val('');
    }
});