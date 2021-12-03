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

const canvas = this.__canvas = new fabric.Canvas('c');
let ctx = canvas.getContext('2d');
canvas.set({
    preserveObjectStacking: true,
});

window.addEventListener('resize', resizeCanvas);

function resizeCanvas(){

}

function setImageAsBg() {
    // canvas.add(mainFoto);
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

canvas.on('mouse:up', function (opt) {
    let obj = opt.target;

    if (obj) {
        function text(obj){
            if (obj.type == 'textbox' || obj.type == 'i-text' || obj.type == 'text') {
                $('#textContent').show();
                $('button#text').click();
            }
        }

        if (obj.type==='group') {
            findInnerElems(obj, text);
        }else{
            text(obj);
        }
    }else{
        $('#textContent').hide();
        $('#newTextContent').val('');
    }
});