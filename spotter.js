var spotter = (function () {
  var body = document.body;

  var width = 176;
  var height = 109;
  var whRatio = width / height;
  var minSize = 100;

  var notFilenameRegex = /^.*[/]/;

  /**
   * Create a HTML element
   *
   * @param {string} tag - HTML tag
   * @param {?string} [id]
   * @param {?string} [cls]
   * @returns {Element}
   */
  function createEl(tag, id, cls) {
    var el = document.createElement(tag);

    if (id) {
      el.id = id;
    }

    if (cls) {
      el.className = cls;
    }

    return el;
  }

  /**
   * Shortcut function
   *
   * @param {string} id
   * @returns {Element}
   */
  function getById(id) {
    return document.getElementById(id);
  }

  /**
   * Builds a <style> element containing CSS used by the script generated HTML structure
   *
   * @returns {HTMLStyleElement}
   */
  function buildStyleEl() {
    var css = [
      '#spotterWrapper{',
        'background-color:rgba(255, 255, 255, 0.9);',
        'opacity:0;',
        'position:absolute;',
        'top:0;',
        'z-index:999999999;',
        'width: 100%;',
        'height: 100%;',
      '}',
      '#spotterContent{',
        'margin-top:35px;',
        'text-align:center;',
      '}',
      '#spotterClose{',
        'background-color:#8DCB0C;',
        'height:35px;',
        'position:fixed;',
        'width:100%;',
        'z-index:1000000001;',
      '}',
      '#spotterClose:hover{',
        'background-color:#7DA81F;',
      '}',
      '#spotterClose__p{',
        'color:white;',
        'cursor: pointer;',
        'font:bold 15px Helvetica,Arial;',
        'line-height:35px;',
        'text-align:center;',
        'text-decoration:none;',
      '}',
      '#spotterList{',
        'padding:30px;',
      '}',
      '.spotterList__li{',
        'background-color:#333;',
        'border:1px solid #DDD;',
        'display:inline-block;',
        'list-style:none;',
        'margin:0 20px 20px 0;',
        'padding:5px;',
      '}',
      '.spotterList__li:hover{',
        'background-color:#FFF;',
        'border:1px solid #BBB;',
      '}',
      '.spotterList__a--wide{',
        'display:table-cell;',
        'vertical-align:middle;',
      '}',
      '.spotterList__img{',
        'display:block;',
        'margin:0 auto;',
      '}',
      '.spotterList__a:active,.spotterList__a:focus{',
        'border:0;',
        'outline:#888 solid 2px;',
      '}',
      '.spotter__opaque{',
        'transition:opacity 0.1s;',
      '}',
      '#spotterMsg{',
        'display:block;',
        'font-size:14px;',
        'line-height:25px;',
        'margin:0 auto;',
        'padding-top:30px;',
        'width:600px;',
      '}'
    ];

    var style = createEl('style');
    style.innerHTML = css.join('');

    return style;
  }

  /**
   * @returns {number}
   */
  function getWindowHeight() {
    var html = document.documentElement;

    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
  }

  /**
   * Build a <div> that will wrap the HTML structure generated by the script
   *
   * @returns {HTMLDivElement}
   */
  function buildWrapperEl() {
    var closeDiv = createEl('div', 'spotterClose', 'spotter__opaque');
    closeDiv.onclick = close;

    var closeTxt = createEl('p', 'spotterClose__p');
    closeTxt.innerHTML = 'Close';

    closeDiv.appendChild(closeTxt);

    var wrapper = createEl('div', 'spotterWrapper', 'spotter__opaque');

    //wrapper.style.height = getWindowHeight() + 'px';

    wrapper.appendChild(closeDiv);

    wrapper.appendChild(
      createEl('div', 'spotterContent')
    );

    return wrapper;
  }

  /**
   * Close and remove the wrapper element
   */
  function close() {
    var wrapper = getById('spotterWrapper');

    wrapper.style.opacity = 0;

    setTimeout(function() {
      body.removeChild(wrapper);
    }, 1000);
  }

  /**
   * Build and attach an HTML structure overlaying the current page
   */
  function buildOverlay() {
    body.appendChild(buildStyleEl());

    var wrapper = buildWrapperEl();

    body.appendChild(wrapper);

    body.style.margin = 0;
    body.style.padding = 0;

    // show the wrapper
    wrapper.style.height = getWindowHeight() + 'px';
    wrapper.style.opacity = 1;

    // close on "ESC"
    window.onkeyup = function(e) {
      if (e.which == 27) {
        close();
      }
    };
  }

  /**
   * Check that an image's dimensions are bigger than the desired minimum size
   *
   * @param {HTMLImageElement} img
   * @returns {boolean}
   */
  function isImgBigEnough(img) {
    return img.naturalWidth >= minSize && img.naturalHeight >= minSize;
  }

  /**
   * @typedef {string} ImgSrc
   */

  /**
   * @typedef {object} ImgSize
   * @property {number} width
   * @property {number} height
   */

  /**
   * Store image's dimensions by their src attribute
   *
   * @param {object.<ImgSrc, ImgSize>} images
   * @param {HTMLImageElement} img
   * @returns {object.<ImgSrc, ImgSize>}
   */
  function getImgData(images, img) {
    images[img.src] = {
      width: img.naturalWidth,
      height: img.naturalHeight
    };

    return images;
  }

  /**
   * Attach an image to the overlay
   *
   * @param {HTMLUListElement} imgList
   * @param {object.<ImgSrc, ImgSize>}  imgData
   * @param {ImgSrc} imgSrc
   */
  function makeImgSpot(imgList, imgData, imgSrc) {
    var linkClass = 'spotterList__a';

    var imgWidth = imgData[imgSrc].width;
    var imgHeight = imgData[imgSrc].height;

    var isWide = imgWidth / imgHeight >= whRatio;

    var img = createEl('img', null, 'spotterList__img');

    img.src = imgSrc;

    if (isWide) {
      img.style.width = width + 'px';
      img.style.height = imgHeight * width / imgWidth + 'px';

      linkClass += ' spotterList__a--wide';
    } else {
      img.style.width = imgWidth * height / imgHeight + 'px';
      img.style.height = height+'px';
    }

    var a = createEl('a', null, linkClass);
    a.href = imgSrc;
    a.download = imgSrc.replace(notFilenameRegex, '');

    a.appendChild(img);

    var li = createEl('li', null, 'spotterList__li');

    li.appendChild(a);

    imgList.appendChild(li);
  }

  /**
   * Get the images on the current page and show them on the overlay
   */
  function getImgs() {
    // the reduce function removes duplicate images
    var imgData = Array.prototype.filter.call(
      document.getElementsByTagName('img'),
      isImgBigEnough
    ).reduce(getImgData, {});

    var srcs = Object.keys(imgData);

    var content = getById('spotterContent');

    if (!srcs.length) {
      var p = createEl('p', 'spotterMsg');
      p.innerHTML = 'We are sorry to tell you that the images on this page are too small.';

      content.appendChild(p);
    } else {
      var ul = createEl('ul', 'spotterList', ' spotter__opaque');

      srcs.forEach(makeImgSpot.bind(null, ul, imgData));

      content.appendChild(ul);
    }
  }

  return function init() {
    // skip if the overlay is already built
    if (getById('spotterWrapper')) {
      return;
    }

    // scroll to the top of the window so the found images are visible
    scrollTo(0, 0);
    buildOverlay();
    getImgs();
  };
})();

spotter();
