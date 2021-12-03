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