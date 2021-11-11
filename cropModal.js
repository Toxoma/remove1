let cropper;

function cropImageStart() {
    let reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = function () {
        cropImg.setAttribute('src', reader.result);

        new bootstrap.Modal(document.getElementById('cropModal'), {
            backdrop: 'static'
        }).show();
    };
}

$('#concatWidthHeight').on('click', function () {
    if ($(this).is(':checked')) {
        cropper.options.aspectRatio = 3 / 4;

        let {
            height
        } = cropper.getCropBoxData();

        cropper.setCropBoxData({
            height: +height + 1,
        });
    } else {
        cropper.options.aspectRatio = NaN;
    }
});

$('#zoomRange').on('input', (e) => {
    const value = e.target.value;

    if (value > 0) {
        e.target.classList.remove('wrong');
        cropper.zoomTo(value / 100);
    } else {
        e.target.classList.add('wrong');
    }
});

$('#cropModal').on('shown.bs.modal', function () {
    cropper = new Cropper(cropImg, {
        initialAspectRatio: 3 / 4,
        autoCropArea: 1,
        zoomOnWheel: false, //!запрет scrolla

        ready: function () {
            if ($('#concatWidthHeight').is(':checked')) {
                cropper.options.aspectRatio = 3 / 4;
            }

            const button = document.getElementById('button');

            button.onclick = function () {
                // Crop
                const croppedCanvas = cropper.getCroppedCanvas();

                $('#showCropModal').removeClass('d-none');

                loadMainPhotoFromUrl(croppedCanvas.toDataURL());
                $('#cropModal button[data-dismiss]').click();
                return;

                $.ajax('/project/save-main-photo/?id_project=' + id_project + '&id_image=' + id_image, {
                    type: 'post',
                    data: {
                        data: croppedCanvas.toDataURL()
                    },
                    beforeSend: function () {
                        $('.save-crop-image').prop('disabled', true);
                        $('.save-crop-image .spinner-border').removeClass('d-none');
                    },
                    success: function (link) {
                        loadMainPhotoFromUrl(link);
                        // updateModifications(true);
                        $('#cropModal button[data-dismiss]').click();
                    },
                    complete: function () {
                        $('.save-crop-image').prop('disabled', false);
                        $('.save-crop-image .spinner-border').addClass('d-none');
                    }
                });
            };

            setTimeout(() => {
                $('#zoomRange').val((cropper.image.width * 100 / cropper.imageData.naturalWidth).toFixed());
            }, 200);
        }
    });
}).on('hidden.bs.modal', function () {
    cropper.destroy();
    $('#mainPhotoUpload').val('');
});