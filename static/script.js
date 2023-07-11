var uniqueIds = [];

function handleFileUpload(videoNumber) {
  var fileInput = document.getElementById('fileInput' + videoNumber);
  
  fileInput.onchange = function () {
    var files = fileInput.files;

    var videoPlayer = document.getElementById('videoPlayer' + videoNumber);
    var videoThumbnail = document.getElementById('videoThumbnail' + videoNumber);

    videoPlayer.style.display = 'none';
    videoThumbnail.style.display = 'block';
    videoThumbnail.style.width = '100%'; 
    videoThumbnail.style.height = '100%'; 
    
    videoThumbnail.src = 'static/load.png';

    var formData = new FormData();
    for (var i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('videoNumber', videoNumber);

    fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        uniqueIds.push(data.unique_id); // Store the unique ID

        if (data.imagePath) {
          var imageURL = data.imagePath + '?' + new Date().getTime();
          videoThumbnail.src = imageURL; 
        } else {
          videoThumbnail.src = 'static/load.png';
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  fileInput.click();
}

function combine() {
  var loadedVideos = 0;
  var videosToLoad = 2; 

  for (var i = 1; i <= 3; i++) {
    var videoThumbnail = document.getElementById('videoThumbnail' + i);
    if (!videoThumbnail.src.includes('html')) {
      loadedVideos++;
    }
    console.log(loadedVideos);
  }

  if (loadedVideos >= videosToLoad) {
    var loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('active');

    fetch('http://localhost:8000/combine/' + uniqueIds.join(',')) // Send all unique IDs
      .then(response => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error('Unable to combine videos');
        }
      })
      .then(blob => {
        var downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'combined.mp4';

        downloadLink.click();
        loadingOverlay.classList.remove('active'); 
      })
      .catch(error => {
        console.error('Error:', error);
        loadingOverlay.classList.remove('active'); 
      });
  } else {
    console.log('At least 2 videos must be loaded');
  }
}

function chooseFile(videoNumber) {
  var fileInput = document.getElementById('fileInput' + videoNumber);
  fileInput.onchange = function () {
    handleFileUpload(videoNumber);
  };
  fileInput.click();
}

document.addEventListener("DOMContentLoaded", function() {
  var fileInputs = document.querySelectorAll("input[type='file']");
  fileInputs.forEach(function(fileInput) {
    fileInput.addEventListener('change', function() {
      var videoNumber = this.id.replace("fileInput", "");
      handleFileUpload(videoNumber);
    });
  });
});
