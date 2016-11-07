// https://github.com/VeliovGroup/Meteor-Files/wiki/Google-Cloud-Storage-Integration

function getReadableStream(http, path, vRef){
  var array, end, partial, remoteReadStream, reqRange, responseType, start, take;

  if (http.request.headers.range) {
    partial = true;
    array = http.request.headers.range.split(/bytes=([0-9]*)-([0-9]*)/);
    start = parseInt(array[1]);
    end = parseInt(array[2]);
    if (isNaN(end)) {
      end = vRef.size - 1;
    }
    take = end - start;
  } else {
    start = 0;
    end = vRef.size - 1;
    take = vRef.size;
  }

  if (partial || (http.params.query.play && http.params.query.play === 'true')) {
    reqRange = {
      start: start,
      end: end
    };
    if (isNaN(start) && !isNaN(end)) {
      reqRange.start = end - take;
      reqRange.end = end;
    }
    if (!isNaN(start) && isNaN(end)) {
      reqRange.start = start;
      reqRange.end = start + take;
    }
    if ((start + take) >= vRef.size) {
      reqRange.end = vRef.size - 1;
    }
    if ((reqRange.start >= (vRef.size - 1) || reqRange.end > (vRef.size - 1))) {
      responseType = '416';
    } else {
      responseType = '206';
    }
  } else {
    responseType = '200';
  }

  if (responseType === "206") {
    remoteReadStream = bucket.file(path).createReadStream({
      start: reqRange.start,
      end: reqRange.end
    });
  } else if (responseType === "200") {
    remoteReadStream = bucket.file(path).createReadStream();
  }

  return remoteReadStream;
}

export {getReadableStream};
