$('#mainPhotoUpload').change(function (event) {
    let reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = function () {
        fabric.Image.fromURL(reader.result,
            function (img) {
                img.set({
                    top:  canvas.height/2 - img.height*img.scaleY/2,
                    left: canvas.width/2 - img.width*img.scaleX/2,
                    ownType: 'mainFoto',
                });

                canvas.setBackgroundImage(img);
                canvas.renderAll();
                mainFoto = fabric.util.object.clone(img);
                openPage('.page', page += 1, true);
                $('#mainPhotoUpload').val('');
            }
        );
    };
});

let cropper;

$('#fileUpload').change(function (event) {

    let reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = function () {

        let cropImg = document.getElementById('imageCrop');
        cropImg.setAttribute('src', reader.result);

        $('#our-demo #imageCropModal').show();

        function start(){
            let button = document.getElementById('applyCrop');

                button.onclick = function () {
                    let croppedCanvas = cropper.getCroppedCanvas();

                    if (targetImage) {
                        function changeSrc(newSrc, imageObject) {
                            let width = imageObject.width;
                            let height = imageObject.height;
                            let scaleX = imageObject.scaleX;
                            let scaleY = imageObject.scaleY;

                            imageObject.setSrc(newSrc, function (image) {
                                image.set({
                                    dirty: true,
                                    scaleX: width * scaleX / image.width,
                                    scaleY: height * scaleY / image.height,
                                });
                                image.clipPath.scaleToWidth(image.width);
                                
                                image.setCoords(true);
                                canvas.renderAll();
                                targetImage = image;
                            });
                        }

                        changeSrc(croppedCanvas.toDataURL(), targetImage);
                    }else{
                        fabric.Image.fromURL(croppedCanvas.toDataURL(), function (img) {
                            if (img.width > canvas.width) {
                                img.scaleToWidth(canvas.width - 40);
                            }
    
                            img.set({
                                top:  canvas.height/2 - img.height*img.scaleY/2,
                                left: canvas.width/2 - img.width*img.scaleX/2,
                                hasControls: true,
                            });
    
                            canvas.add(img);
                            canvas.renderAll();
                            canvas.setActiveObject(img);
                        });
                    }
                };
        }
        
        if (targetImage) {
            cropper = new Cropper(cropImg, {
                aspectRatio: 1,
                // zoomOnWheel: false, // запрет scrolla
                viewMode: 2,
                
                ready: function () {
                    start();
                },
                // cropmove: function () {
                //     console.log('move');
                // },
            });
        }else{
            cropper = new Cropper(cropImg, {
                initialAspectRatio: 3/4,
                viewMode: 2,
                
                ready: function () {
                    start();
                },
            });
        }
    };
});


$('#imageCropModal').on('click', 'button[data-dismiss="modal"]', function(){
    cropper.destroy();
    $('#fileUpload').val('');
    $('#our-demo #imageCropModal').hide();
});

$('#imageBorderCircle').on('change', function () {
    let target = canvas.getActiveObject();

    const isImage = function (obj) {
        if (obj && obj.type === 'image') {
            return true;
        } else {
            return false;
        }
    };

    if (isImage(target)) {
        if ($('#imageBorderCircle').prop('checked')) {
            createCircleImage(target);
        }else{
            target.clipPath = null;
            canvas.renderAll();
        }
    }
});

function createCircleImage(target) {
    let side;

    if (target.width  <= target.height) {
        side = target.width;
    } else {
        side = target.height;
    }

    target.clipPath = new fabric.Circle({
        radius: side / 2,
        originX: 'center',
        originY: 'center',
    });

    canvas.renderAll();
}