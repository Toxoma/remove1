let mainFoto;

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


function setImageAsBg() {
    canvas.add(mainFoto);
    // canvas.setBackgroundImage(mainFoto, canvas.renderAll.bind(canvas));
}

function loadMainPhotoFromUrl(url){
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