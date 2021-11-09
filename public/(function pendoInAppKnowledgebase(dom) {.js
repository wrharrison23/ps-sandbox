(function pendoInAppKnowledgebase(dom) {
    function expandable(suggestion) {
        if (
            suggestion.lastElementChild.classList.contains(
                '_pendo-kb-acc-collapsed'
            )
        ) {
            suggestion.classList.add('_kb-acc-active');
            suggestion.classList.remove('_kb-acc-collapsed');
            suggestion.lastElementChild.style.height = 'auto';
            suggestion.lastElementChild.classList.add('_pendo-kb-acc-active');
            suggestion.lastElementChild.classList.remove(
                '_pendo-kb-acc-collapsed'
            );
            suggestion.lastElementChild.style.display = 'block';
        } else {
            suggestion.classList.remove('_kb-acc-active');
            suggestion.classList.add('_kb-acc-collapsed');
            suggestion.lastElementChild.classList.remove(
                '_pendo-kb-acc-active'
            );
            suggestion.lastElementChild.classList.add(
                '_pendo-kb-acc-collapsed'
            );
            suggestion.lastElementChild.style.display = 'none';
        }
    }

    var getSuggestedArticles = pendo._.debounce(function (e) {
        // get users current url and check for suggestions

        contentLoading();
        dom(resultsElement).html('');
        switchResultsContext('suggested');
        show(topSearch);
        var url = pendo.getCurrentUrl();

        var suggestions = getSuggestionsPath(url).suggestions;
        var queryUrl = getSuggestionsPath(url).queryUrl;

        var cfg = {
            url: queryUrl,
            method: 'GET',
        };

        pendo
            .ajax(cfg)
            .then(function (response) {
                // if suggestions exist, return suggestions, else show message

                if (suggestions === false && pendo._.isEmpty(response.data)) {
                    contentLoaded(resultsElement);
                    return noSuggestionsTemplate();
                } else {
                    if (
                        !pendo._.isUndefined(response.data) &&
                        !pendo._.isEmpty(response.data)
                    ) {
                        var suggestedArticles = response.data;
                        makeSuggestions(suggestedArticles);
                        switchResultsContext('suggested');
                        contentLoaded(resultsElement);

                        pendo._.each(
                            pendo.dom('._pendo-suggestions-collapsible'),
                            function (suggestion) {
                                suggestion.previousSibling.removeEventListener(
                                    'click',
                                    function () {
                                        expandable(suggestion.parentElement);
                                    }
                                );
                                suggestion.classList.add(
                                    '_pendo-kb-acc-collapsed'
                                );
                                suggestion.style.display = 'none';
                                suggestion.previousSibling.addEventListener(
                                    'click',
                                    function () {
                                        expandable(suggestion.parentElement);
                                    }
                                );
                            }
                        );
                    } else {
                        // throw error
                        return errorState('suggestions');
                    }
                }
            })
            .catch(function (error) {
                contentLoaded(resultsElement);

                return errorState('suggestions');
            });
    }, 1000);

    var errorState = function (context) {
        dom(resultsElement).html('');
        switchResultsContext('error');
        show(topSearch);
        var errorHtml = [
            "<div class='_pendo-error-container_'>",
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="alert-triangle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12" y2="17"></line></svg>',
            "<div class='_pendo-section-content-body-error_'>",
            '<div>Could not get ' + context + '.</br>Please try again.</div>',
            '</div>',
            '</div>',
        ].join('\n');
        dom(resultsElement).append(errorHtml);
    };

    var getBearerToken = async function () {
        var token;
        var cfg = {
            url: 'https://crem-pendo-dvm.costar.com/auth',
            method: 'GET',
        };
        await pendo
            .ajax(cfg)
            .then(function (response) {
                pendo.sfdcKbBearerToken = response.data;
                token = response.data;
            })
            .catch(function (error) {
                console.log(error);
                contentLoaded(resultsElement);
                return errorState('images');
            });

        return token;
    };

    var getAllArticles = function () {
        var cfg = {
            url: 'https://crem-pendo-dvm.costar.com/kb?internal_user=0&limit=139',
            method: 'GET',
        };

        pendo
            .ajax(cfg)
            .then(function (response) {
                // if suggestions exist, return suggestions, else show message
                if (pendo._.isEmpty(response.data)) {
                    return errorState('results');
                } else {
                    if (
                        !pendo._.isUndefined(response.data) &&
                        !pendo._.isEmpty(response.data)
                    ) {
                        allArticles = response.data;
                    } else {
                        // throw error
                        return errorState('results');
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
                contentLoaded(resultsElement);
                return errorState('results');
            });
    };

    var launcherDiv = dom('#_pendo-kb_');
    var resultsElement = dom('._pendo-section-content-body-results_');
    var emptySearch = dom('._pendo-section-content-search-empty_');
    var searchInput = dom('#_pendo-launcher-kb-search-input_');
    var topSearch = dom('._pendo-section-content-body-top-searches_');
    var clearSearchIcon = dom('._pendo-launcher-clear-search-icon_');
    var articleDisplay = dom('._pendo-section-content-body-article_');
    var loadingContentElement = dom('._pendo-ext-search-controller-loading_');
    var invisibleClass = '_pendo-invisible_';

    //retrieve all articles as soon as the module loads, use that to power suggestedArticlesTemplate

    var knowledgeBaseURL = 'https://crem-pendo-dvm.costar.com/kb';
    var internalUserIdentification = pendo.getSerializedMetadata().visitor
        .INTERNAL_USER
        ? 1
        : 0;
    var internalUserParam = '?internal_user=' + internalUserIdentification;
    var articleLinkUrl = knowledgeBaseURL;
    var searchUrl = knowledgeBaseURL + internalUserParam + '&limit=20&search=';
    var articleUrl = knowledgeBaseURL + internalUserParam + '&limit=1&search=';
    var allArticles = [];

    var containerStyles =
        '._pendo-ext-zoom-container_{position:absolute;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=100);filter:alpha(opacity=100);opacity:1;z-index:300002}';
    var contentStyles =
        '._pendo-ext-zoom-content_{position:relative;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=1);filter:alpha(opacity=100);opacity:1;max-height:none;max-width:none;height:auto;}';
    var overlayStyles =
        '._pendo-ext-zoom-overlay_{background-color:#fff;position:fixed;top:0;bottom:0;left:0;right:0;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=0);filter:alpha(opacity=0);opacity:0;z-index:300001;cursor:progress;}._pendo-ext-zoom-overlay_._pendo-ext-zoom-overlay-active_{-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=85);filter:alpha(opacity=85);opacity:0.85;cursor:zoom-out;}';
    var styles = containerStyles + contentStyles + overlayStyles;
    var transitionDuration = 300;
    var margin = 80;
    var container = null;
    var overlay = null;
    var content = null;

    //start by populating the suggested articles list
    getSuggestedArticles();
    //get max articles from search endpoint, store in variable to limit fetch calls made
    //when filtering articles
    getAllArticles();
    getBearerToken();

    pendo
        .dom('body')
        .on('click', '.close-modal, .presentation a', function (e) {
            triggerZoomOut();
            dom('body').removeClass('modal-open');
        })
        .on('click', '.presentation a', function (e) {
            //Listener for links inside articles
            //Displays linked article in resource center instead of linking externally

            //Get articles URL name from the a tag

            var selectedLink = eventTarget(e).getAttribute('href');
            if (selectedLink.includes('article')) {
                e.preventDefault();
                var url = selectedLink.split('article/')[1];
                var selectedArticle = pendo._.where(allArticles, {
                    UrlName: url,
                })[0];

                //Fetch article if not found in allArticles
                if (pendo._.isUndefined(selectedArticle)) {
                    var query = url.split('-');
                    var shortenedQuery;
                    if (query.length > 4) {
                        var queryArray = [];
                        for (var i = 0; i < 4; i++) {
                            queryArray.push(query[i]);
                        }
                        shortenedQuery = queryArray.join(' ');
                        query = query.join('-');
                    } else query = query.join(' ');
                    return getLinkedArticle(query, shortenedQuery);
                } else displayLinkedArticle(selectedArticle);
            }
        })
        .on(
            'click',
            '._pendo-ext-zoom-overlay_, ._pendo-ext-zoom-container_',
            function (e) {
                var element = pendo.dom('._pendo-ext-zoom-content_');

                if (element[0].tagName.toLowerCase() === 'img') {
                    triggerZoomOut();
                }
            }
        )
        .on('click', '._pendo-has-special-response_', function (e) {
            if (e.target.parentElement.classList.contains('_kb-acc-active')) {
                var articleId = eventTarget(e).dataset.id;

                if (!pendo._.isUndefined(articleId)) {
                    var selectedArticle = pendo._.where(
                        pendo.costarArticleList,
                        {
                            Id: articleId,
                        }
                    )[0];

                    pendo.track('Preview Expanded', {
                        title: selectedArticle.Title,
                        url: selectedArticle.attributes.url,
                        hasSummaryText: !pendo._.isNull(
                            selectedArticle.Summary
                        ),
                    });
                }
            }
        });

    function injectStyles(id, styles) {
        if (document.getElementById(id)) return;
        // Older versions of IE do not like it when you try to create <style> tags
        // https://www.quirksmode.org/bugreports/archives/2006/01/IE_wont_allow_documentcreateElementstyle.html
        var stylesContainer = document.createElement('div');
        stylesContainer.innerHTML =
            '<p>pendo</p><style id="' +
            id +
            '" type="text/css">' +
            styles +
            '</style>';
        document
            .getElementsByTagName('head')[0]
            .appendChild(stylesContainer.childNodes[1]);
    }

    function setTransformStyles(element, transform) {
        dom(element).css({
            webkitTransform: transform,
            mozTransform: transform,
            msTransform: transform,
            oTransform: transform,
            transform: transform,
            cursor: 'zoom-out',
        });

        if (transform === '') {
            dom(element).css({
                '-ms-filter':
                    'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)',
                filter: 'alpha(opacity=0)',
                opacity: 0,
                cursor: 'default',
            });
        }
    }

    function addZoomListeners() {
        pendo.attachEvent(window, 'scroll', triggerZoomOut);
        pendo.attachEvent(window, 'resize', triggerZoomOut);
        // pendo.attachEvent(document, 'click', handleClick);
    }

    function removeZoomListeners() {
        // pendo.detachEvent(document, 'click', handleClick);
        pendo.detachEvent(window, 'scroll', triggerZoomOut);
        pendo.detachEvent(window, 'resize', triggerZoomOut);
    }

    function initExpand(selectedArticle) {
        var targetArticle = selectedArticle.cloneNode(true);

        injectStyles('_pendo-ext-zoom-styles_', styles);

        dom(targetArticle)
            .css({
                width: '800px',
                animationName: 'pendo-zoom',
                animationDuration: '0.3s',
                backgroundColor: '#f4f4f7',
                minHeight: '300px',
                padding: '40px 40px 40px',
                maxHeight: '600px',
                overflowY: 'auto',
                cursor: 'default',
                border: '1px #cccccc solid',
                transition: 'all ' + transitionDuration + 'ms',
            })
            .on('load', function (targetArticle) {
                triggerZoomIn(targetArticle);
            });
        dom('body').addClass('modal-open');
        //Add close button to article header when expanded
        var closeSpan = document.createElement('button');
        closeSpan.setAttribute('class', 'close-modal');
        closeSpan.innerHTML = '×';
        closeSpan.setAttribute(
            'style',
            'border-radius: 0px; position: absolute; right: 30px;z-index: 20;left: auto;top: 6px;float: none;vertical-align: baseline;color: rgb(154, 156, 165);padding: 0px;line-height: 1;background: none;border: 0px;font-size: 32px !important;font-weight: 100;font-family: Helvetica;margin: 0px;min-width: 0px;white-space: pre-wrap; cursor: pointer;'
        );

        targetArticle
            .querySelector('.pendo-article-content-title')
            .append(closeSpan);

        content = targetArticle;

        var offset = calculateOffset(targetArticle);
        //addZoomListeners();
        createZoomElements(offset, content);

        var images = dom('.presentation img');

        var divWidth = targetArticle.querySelector(
            '._pendo-article-content-main_'
        ).offsetWidth;

        //Adjust image size if bigger than the article container
        pendo._.each(
            pendo.dom('._pendo-section-content-article_ img'),
            function (image) {
                if (image.offsetWidth > divWidth) {
                    image.style.width = '100%';
                }
            }
        );

        dom(
            '._pendo-ext-zoom-content_ span, ._pendo-ext-zoom-content_ div, ._pendo-ext-zoom-content_ p, ._pendo-ext-zoom-content_ h2, ._pendo-ext-zoom-content_ ol, ._pendo-ext-zoom-content_ li'
        ).css({
            backgroundColor: '#f4f4f7',
        });
    }

    function initZoom(selectedImage) {
        injectStyles('_pendo-ext-zoom-styles_', styles);

        var targetElement = document.createElement('img');
        dom(targetElement)
            .addClass('_pendo-ext-zoom-content_')
            .css({
                cursor: 'progress',
                width: selectedImage.width + 'px',
                transition: 'all ' + transitionDuration + 'ms',
                top: '50%',
                left: '50%',
                right: '50%',
            })
            .on('load', function (selectedImage) {
                triggerZoomIn(selectedImage);
            })
            .attr('src', selectedImage.src);
        content = targetElement;

        // this is slightly different from the actual version
        var offset = calculateOffset(selectedImage);
        addZoomListeners();
        createZoomElements(offset, content);
    }

    function createZoomElements(offset, content) {
        if (content.classList.contains('_pendo-section-content-article_')) {
            container = dom('<div/>')
                .addClass('_pendo-ext-zoom-container_')
                .css({
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    transition: 'all ' + transitionDuration + 'ms',
                })
                .append(content)
                .appendTo(dom.getBody());

            overlay = dom('<div/>')
                .addClass('_pendo-ext-zoom-overlay_')
                .css({
                    transition: 'all ' + transitionDuration + 'ms',
                    opacity: '0.75',
                })
                .appendTo(dom.getBody());
        } else {
            container = dom('<div/>')
                .addClass('_pendo-ext-zoom-container_')
                .css({
                    cursor: 'progress',
                    top: offset.top + 'px',
                    left: offset.left + 'px',
                    transition: 'all ' + transitionDuration + 'ms',
                    maxHeight: '50%',
                })
                .append(content)
                .appendTo(dom.getBody());

            overlay = dom('<div/>')
                .addClass('_pendo-ext-zoom-overlay_')
                .css({
                    transition: 'all ' + transitionDuration + 'ms',
                })
                .appendTo(dom.getBody());
        }
    }

    function triggerZoomIn(targetEvent) {
        var target = targetEvent.path
            ? targetEvent.path[0]
            : targetEvent.target;
        var contentOffset = calculateOffset(target); // ExtensionAPI.Util.getOffsetPosition(content);
        var viewportX = window.innerWidth / 2;
        var viewportY = window.pageYOffset + window.innerHeight / 2;
        var contentCenterX = contentOffset.left + target.width / 2;
        var contentCenterY = contentOffset.top + target.height / 2;
        var translateX = Math.round(viewportX - contentCenterX);
        var translateY = Math.round(viewportY - contentCenterY);

        var contentTransform = 'scale(' + calculateScaleFactor(target) + ')';
        var containerTransform =
            'translate(' +
            translateX +
            'px, ' +
            translateY +
            'px) translateZ(0)';

        if (pendo._.isUndefined(content))
            var content = dom('._pendo-ext-zoom-content_');
        setTransformStyles(content, contentTransform);

        if (pendo._.isUndefined(container))
            var container = dom('._pendo-ext-zoom-container_');
        setTransformStyles(container, containerTransform);

        if (pendo._.isUndefined(overlay))
            var overlay = dom('._pendo-ext-zoom-overlay_');
        overlay.addClass('_pendo-ext-zoom-overlay-active_');
    }

    function triggerZoomOut() {
        removeZoomListeners();

        setTransformStyles(content, '');
        setTransformStyles(container, '');

        overlay.removeClass('_pendo-ext-zoom-overlay-active_').css({
            cursor: 'default',
        });

        setTimeout(function () {
            dispose();
        }, transitionDuration);
    }

    function dispose() {
        pendo.dom('._pendo-ext-zoom-overlay_').remove();
        pendo.dom('._pendo-ext-zoom-container_').remove();
    }

    function calculateScaleFactor(target) {
        var zoomScaleFactor = null;
        var naturalWidth = target.naturalWidth;
        var naturalHeight = target.naturalHeight;
        var maxScaleFactor = naturalWidth / target.width;
        var viewportHeight = window.innerHeight - margin;
        var viewportWidth = window.innerWidth - margin;
        var contentAspectRatio = naturalWidth / naturalHeight;
        var viewportAspectRatio = viewportWidth / viewportHeight;

        if (naturalWidth < viewportWidth && naturalHeight < viewportHeight) {
            zoomScaleFactor = maxScaleFactor;
        } else if (contentAspectRatio < viewportAspectRatio) {
            zoomScaleFactor = (viewportHeight / naturalHeight) * maxScaleFactor;
        } else {
            zoomScaleFactor = (viewportWidth / naturalWidth) * maxScaleFactor;
        }
        return zoomScaleFactor;
    }

    // test to make sure this works after scrolling
    function calculateOffset(target) {
        var rect = target.getBoundingClientRect();
        var calcTop = window.innerHeight / 2 - rect.height / 2;
        var calcLeft = window.innerWidth / 2 - rect.width / 2;
        return {
            top: calcTop,
            left: calcLeft,
        };
    }

    function expandImage(selectedImage) {
        initZoom(selectedImage);
    }
    function expandArticle(selectedArticle) {
        initExpand(selectedArticle);
    }

    launcherDiv
        .on('input', '._pendo-launcher-search-box_', function (e) {
            dom(articleDisplay).html('');
            if (
                e.which === 8 ||
                (searchInput[0].value.length > 0 && e.which !== 9)
            ) {
                delaySearch(e);
            } else if (searchInput[0].value.length == 0) {
                dom(articleDisplay).html('');
                switchResultsContext('suggested');
                show(topSearch);
                getSuggestedArticles();
            }
        })
        .on(
            'click',
            '._pendo-section-content-clear-search_, ._pendo-launcher-clear-search-icon_',
            function (e) {
                dom(articleDisplay).html('');
                resetSearch(e);
                dom(topSearch).removeClass(invisibleClass);
                dom(topSearch).html(headerTemplate('suggested'));
            }
        )
        .on('click', '._pendo-back-to-results_', function (e) {
            dom(articleDisplay).html('');
            hide(articleDisplay);
            show(topSearch);
            show(resultsElement);
        })
        .on(
            'click',
            '._pendo-no-special-response_, ._pendo-suggestions-learn-more a',
            function (e) {
                // Click Event Listener to display KB article details
                var articleId = eventTarget(e).dataset.id;

                if (!pendo._.isUndefined(articleId)) {
                    displayArticleData(allArticles, articleId);
                }
            }
        )
        .on(
            'click',
            '._pendo-section-content-article_ img.expandable',
            function (e) {
                var selectedImage = eventTarget(e);
                expandImage(selectedImage);
            }
        )
        .on('click', '._pendo-external-link_', function (e) {
            //Opens modal with article details
            var selectedArticle = dom('._pendo-section-content-article_')[0];
            expandArticle(selectedArticle);
        });

    function eventTarget(e) {
        return (e && e.target) || e.srcElement;
    }

    var delaySearch = pendo._.debounce(resetContainerAndSendSearch, 500, false);

    function resetContainerAndSendSearch(e) {
        dom(resultsElement).html('');
        dom(emptySearch).remove();
        show(resultsElement);
        if (searchInput[0].value.trim() === '') {
            // If no value, remove elements and show suggestions
            resetSearch(e);
        } else {
            // Remove suggestions and fetch articles with supplied input value
            hide(topSearch);
            getArticles(searchInput[0].value.trim(), e);
        }
    }

    // Wrapper to check prerequisites before sending any request
    function getArticles(inputValue, e) {
        // Remove any enter presses or invalid length values
        if (
            inputValue.length < 1 ||
            //e.keyCode === 16 ||
            // e.keyCode === 8 ||
            //e.keyCode === 32 ||
            e.keyCode === 9 //||
            //e.keyCode === 13
        ) {
            return false;
        } else {
            var query = unescape(inputValue);

            // Send query to method for request
            return getArticlesFromApi(query, e);
        }
    }

    function getLocation(url) {
        var match = url.match(
            /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
        );
        return (
            match && {
                href: url,
                protocol: match[1],
                host: match[2],
                hostname: match[3],
                port: match[4],
                pathname: match[5],
                search: match[6],
                hash: match[7],
            }
        );
    }

    function getSuggestionsPath(usersUrl) {
        var path = getLocation(usersUrl).pathname;
        var query = '""';
        var suggestions = false;

        if (path.length > 1) {
            suggestions = true;
            query = pendo._.each(path.split('/'), function (item) {
                return item;
            }).join('%20');
        }

        // Building the search request
        var queryUrl = searchUrl;

        return { suggestions: suggestions, queryUrl: queryUrl };
    }

    // Convenience to quickly show elements
    function show(element) {
        dom(element).removeClass(invisibleClass);
    }

    // Convenience to quickly hide elements
    function hide(element) {
        dom(element).addClass(invisibleClass);
    }

    function resetSearch(e) {
        searchInput[0].value = '';
        switchResultsContext('suggested');
        show(topSearch);
        dom(resultsElement).html('');
        hide(articleDisplay);
        dom(emptySearch).remove();
        show(resultsElement);
        getSuggestedArticles();
    }

    // Template to display when loading
    function contentLoading() {
        hide(topSearch);
        hide(clearSearchIcon);
        show('.es-progress-indicator');
        hide(resultsElement);
        hide(articleDisplay);
    }

    // Remove the loading content/elements
    function contentLoaded(element) {
        setTimeout(function () {
            hide('.es-progress-indicator');
            //hide(loadingContentElement);
            show(element);
            // show(articleDisplay);
            if (searchInput[0].value !== '') {
                show(clearSearchIcon);
            }
        }, 600);
    }

    function displayArticleData(response, articleId) {
        var selectedArticle = pendo._.where(allArticles, {
            Id: articleId,
        })[0];

        //Need to find cleaner solution here
        //Occasionally used when finding article that was linked from another article
        //Some articles aren't found in allArticles
        if (pendo._.isUndefined(selectedArticle)) {
            var article = pendo._.where(pendo.costarArticleList, {
                Id: articleId,
            })[0];
            if (!pendo._.isUndefined(article)) {
                selectedArticle = article;
            } else {
                selectedArticle = extLinkedArticle;
            }
        }

        searchInput[0].blur();
        hide(topSearch);
        hide(resultsElement);
        show(articleDisplay);
        dom(articleDisplay).append(articleHeaderTemplate(selectedArticle));

        var articleContent = [
            '<div class="_pendo-section-content-article_" id=" ' +
                articleId +
                '" article-id="' +
                selectedArticle.Id +
                '">',
            '<div class="_pendo-article-content-main_">',
            '<h2 class="pendo-article-content-title">' +
                selectedArticle.Title +
                '</h2>',
            '<div class="presentation">' + selectedArticle.Answer__c + '</div>',
            '</div>',
            '</div>',
        ].join('\n');
        articleDisplay.append(articleContent);
        articleDisplay.scrollTop = 0;
        contentLoaded(articleDisplay);

        pendo.track('Article Viewed', {
            title: selectedArticle.Title,
            url: selectedArticle.attributes.url,
            hasSummaryText: !pendo._.isNull(selectedArticle.Summary),
        });
        processImages();
        processLinks();
    }

    function checkImageProperties(image) {
        /**
         * Determines whether an img element has the right width properties
         * @param {Object} image an img element
         * @return {Boolean} true when the properties are on the image
         */
        var checkForImageWidth = setInterval(function () {
            pendo.log('Checking for image properties');
            if (image.width && image.naturalWidth) {
                pendo.log(
                    'image: ' + image.width + ' -- ' + image.naturalWidth
                );
                if (image.width < image.naturalWidth)
                    pendo.log('Adding expandable class to image');
                image.classList.add('expandable');
                clearInterval(checkForImageWidth);
            }
        }, 350);
    }

    function processImages() {
        /**
         * Determines whether an img element can receive the expandable class for zoom in functionality
         */
        pendo.log('processing images...');

        var images = dom('._pendo-section-content-article_ img');

        //Currently getting token each time article detail view contains images
        //Can find more efficient method to use same token until expiration
        getBearerToken().then((response) => {
            pendo._.each(images, function (image) {
                pullSfdcImages(image, response);
                checkImageProperties(image);
            });
        });
    }

    function pullSfdcImages(image, token) {
        articleId = pendo
            .dom('._pendo-section-content-article_')[0]
            .getAttribute('article-id');
        var queryString = image.src;
        var urlParams = new URLSearchParams(queryString);
        var imageRefId = urlParams.get('refid');

        var url =
            'https://costarmanager.my.salesforce.com/services/data/v51.0/sobjects/Knowledge__kav/' +
            articleId +
            '/richTextImageFields/Answer__c/' +
            imageRefId;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        xhr.setRequestHeader('Authorization', 'Bearer ' + token);

        xhr.responseType = 'blob';

        xhr.onload = response;

        xhr.send();

        function response(e) {
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(this.response);
            image.src = imageUrl;
        }
    }

    function processLinks() {
        /**
         * Determines whether an img element can receive the expandable class for zoom in functionality
         */
        pendo.log('processing links...');

        var links = dom('._pendo-section-content-article_ a');

        pendo._.each(links, function (link) {
            var linkHref = link.href;
            if (linkHref.indexOf('.jpg') > -1) {
                link.href = '';
            }
            if (linkHref.indexOf('#top') > -1) {
                link.remove();
            }
        });
    }

    var makeSuggestions = function (articleListObject) {
        //filters out any of the release notes from the suggested articles list
        var suggestionList = pendo._.filter(
            articleListObject,
            function (article) {
                return article.Title.toLowerCase().indexOf('version ') === -1;
            }
        );
        pendo.costarArticleList = suggestionList;
        suggestedArticlesTemplate(suggestionList);
    };

    var suggestedArticlesTemplate = function (data) {
        //If article has a summary then make expandable element
        pendo._.each(data, function (suggestion) {
            if (suggestion.Summary) {
                dom(resultsElement).append(
                    '<li class="_pendo-tt-suggestion_ _pendo-has-special-response_">' +
                        '<a class="_pendo-article-link_" data-id="' +
                        suggestion.Id +
                        '" target="_pendo-section-content-helpcenter-article-frame_">' +
                        suggestion.Title +
                        '</a>' +
                        '<div class="_pendo-suggestions-collapsible">' +
                        '<div>' +
                        suggestion.Summary +
                        '</div>' +
                        '<div class="_pendo-suggestions-learn-more">' +
                        '<a data-id="' +
                        suggestion.Id +
                        '"><button ' +
                        'data-id="' +
                        suggestion.Id +
                        '" class="_pendo-suggestion-learn-more-button">Learn more <img ' +
                        'data-id="' +
                        suggestion.Id +
                        '" src="https://pendo-static-6012908437241856.storage.googleapis.com/mIBOnIv9xuvsdvUsFC5qSLF89pE/guide-media-b58a7116-47c9-4507-9f6e-b22c5aaf566e"></button></a></div>' +
                        '</div>' +
                        '</li>'
                );
            } else {
                dom(resultsElement).append(
                    '<li class="_pendo-tt-suggestion_ _pendo-no-special-response_"><a class="_pendo-article-link_" data-id="' +
                        suggestion.Id +
                        '" target="_pendo-section-content-helpcenter-article-frame_">' +
                        suggestion.Title +
                        '</a></li>'
                );
            }
        });
    };

    var searchResultsTemplate = function (data, e) {
        switchResultsContext('search');
        show(topSearch);
        pendo._.each(data, function (suggestion) {
            if (suggestion.Summary) {
                dom(resultsElement).append(
                    '<li class="_pendo-tt-suggestion_ _pendo-has-special-response_">' +
                        '<a class="_pendo-article-link_" data-id="' +
                        suggestion.Id +
                        '" target="_pendo-section-content-helpcenter-article-frame_">' +
                        suggestion.Title +
                        '</a>' +
                        '<div class="_pendo-suggestions-collapsible">' +
                        '<div>' +
                        suggestion.Summary +
                        '</div>' +
                        '<div class="_pendo-suggestions-learn-more">' +
                        '<a data-id="' +
                        suggestion.Id +
                        '"><button ' +
                        'data-id="' +
                        suggestion.Id +
                        '" class="_pendo-suggestion-learn-more-button">Learn more <img ' +
                        'data-id="' +
                        suggestion.Id +
                        '" src="https://pendo-static-6012908437241856.storage.googleapis.com/mIBOnIv9xuvsdvUsFC5qSLF89pE/guide-media-b58a7116-47c9-4507-9f6e-b22c5aaf566e"></button></a></div>' +
                        '</div>' +
                        '</li>'
                );
            } else {
                dom(resultsElement).append(
                    '<li class="_pendo-tt-suggestion_ _pendo-no-special-response_"><a class="_pendo-article-link_" data-id="' +
                        suggestion.Id +
                        '" target="_pendo-section-content-helpcenter-article-frame_">' +
                        suggestion.Title +
                        '</a></li>'
                );
            }
        });
    };

    // Template to display when no results are found
    var notFoundTemplate = function (data) {
        dom(resultsElement).html('');
        switchResultsContext('search');
        show(topSearch);
        var notFound = [
            "<div class='_pendo-section-content-search-empty_'>",
            '<h4>No matches found for <strong>' + data + '</strong></h4>',
            '<p>Try adding a few more letters or check the spelling of your current entry</p>',
            '</div>',
        ].join('\n');
        dom(resultsElement).append(notFound);
    };

    // template to display when no suggestions are found
    var noSuggestionsTemplate = function () {
        dom(resultsElement).html('');
        var notFound = [
            "<div class='_pendo-section-content-suggestions-empty_'>",
            '<h4>For tips, tricks, and how tos, try searching for keywords above</h4>',
            '</div>',
        ].join('\n');
        dom(resultsElement).append(notFound);
    };

    var switchResultsContext = function (state = 'search') {
        var states = {
            suggested: suggested,
            search: search,
            error: error,
        };

        function suggested() {
            dom(topSearch).html(headerTemplate('suggested'));
            dom(resultsElement).attr('data-context', 'suggested');
        }

        function search() {
            dom(topSearch).html(headerTemplate('search'));
            dom(resultsElement).attr('data-context', 'search');
        }

        function error() {
            dom(topSearch).html(headerTemplate('error'));
            dom(resultsElement).attr('data-context', 'error');
        }

        if (!pendo._.isUndefined(state)) {
            return states[state]();
        }
    };

    var headerTemplate = function (state = 'search') {
        var states = {
            suggested: suggestedHeader,
            search: searchHeader,
            error: errorHeader,
        };

        function suggestedHeader() {
            return [
                '<div class="_pendo-section-content-top-searches-header_">',
                'SUGGESTED ARTICLES',
                '</div>',
            ].join('\n');
        }

        function searchHeader() {
            return [
                '<div class="_pendo-section-content-search-header_">',
                'Search Results',
                '<a href="javascript:void(0);" class="_pendo-section-content-clear-search_">Clear</a>',
                '</div>',
            ].join('\n');
        }

        function errorHeader() {
            return [
                '<div class="_pendo-section-content-search-header_">',
                '<a href="javascript:void(0);" class="_pendo-section-content-clear-search_">Clear</a>',
                '</div>',
            ].join('\n');
        }

        if (!pendo._.isUndefined(state)) {
            return states[state]();
        }
    };

    var articleHeaderTemplate = function (selectedArticle) {
        return [
            '<div class="_pendo-section-content-article-header_">',
            '<div class="_pendo-article-nav_">',
            '<button type="button" class="_pendo-back-to-results_">',
            '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="8 0 18 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="" style="display: inline-block;"><polyline points="15 18 9 12 15 6"></polyline></svg>',
            '<span>Back to Search Results</span>',
            '</button>',
            '</div>',
            '<div class="_pendo-section-content-article-breadcrumbs_">',
            '<h4 class="_pendo-article-breadcrumbs-title_">' +
                selectedArticle.Title +
                '</h4>',
            '<button class="_pendo-external-link_">',
            //'<a href="https://connect-costarmanager.force.com/TenantConnections/s/article/' +
            //TODO: Authentication
            //    selectedArticle.UrlName +
            //    '" target="_blank" data-side="bottom"  data-tooltip="Open article in new tab" title="Open article in new tab" tabindex="0">',
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">',
            '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
            '</a>',
            '</button>',
            '</div>',
            '</div>',
        ].join('\n');
    };

    var getArticlesFromApi = pendo._.debounce(function (query, e) {
        contentLoading();

        // Building the search request
        var cfg = {
            url: searchUrl + query,
            method: 'GET',
        };

        // Request the articles with the input provided
        pendo
            .ajax(cfg)
            .then(function (response) {
                // display results (or no result message)
                if (
                    !pendo._.isUndefined(response.data) &&
                    response.data.length
                ) {
                    var articleResults = response.data;
                    dom(resultsElement).html('');
                    dom(emptySearch).remove();
                    contentLoaded(resultsElement);
                    pendo.costarArticleList = articleResults;
                    return searchResultsTemplate(articleResults, e);
                } else {
                    dom(resultsElement).html('');
                    dom(emptySearch).remove();
                    contentLoaded(resultsElement);
                    return notFoundTemplate(query, e);
                }
            })
            .then(() => {
                pendo._.each(
                    pendo.dom('._pendo-suggestions-collapsible'),
                    function (suggestion) {
                        suggestion.previousSibling.removeEventListener(
                            'click',
                            function () {
                                expandable(suggestion.parentElement);
                            }
                        );
                        suggestion.classList.add('_pendo-kb-acc-collapsed');
                        suggestion.style.display = 'none';
                        suggestion.previousSibling.addEventListener(
                            'click',
                            function () {
                                expandable(suggestion.parentElement);
                            }
                        );
                    }
                );
            })
            .catch(function (error) {
                contentLoaded(resultsElement);
                return errorState('results');
            });
    }, 500);

    //**FIX THIS**
    function displayLinkedArticle(selectedArticle) {
        dom(articleDisplay).html('');
        hide(articleDisplay);
        show(topSearch);
        show(resultsElement);

        dom(resultsElement).html('');
        dom(emptySearch).remove();
        contentLoaded(resultsElement);

        pendo.track('Preview Expanded', {
            title: selectedArticle.Title,
            url: selectedArticle.attributes.url,
            hasSummaryText: !pendo._.isNull(selectedArticle.Summary),
        });
        return searchResultsTemplate([selectedArticle]);
    }

    var extLinkedArticle;
    //Used to find article linked inside another when it isn't found in allArticles
    var getLinkedArticle = function (query, shortenedQuery, e) {
        contentLoading();

        // Building the search request
        var cfg = {
            url: searchUrl + shortenedQuery,
            method: 'GET',
        };

        // Request the articles with the input provided
        pendo
            .ajax(cfg)
            .then(function (response) {
                if (pendo._.isEmpty(response.data)) {
                    contentLoaded(resultsElement);
                    return errorState('article');
                } else {
                    if (
                        !pendo._.isUndefined(response.data) &&
                        !pendo._.isEmpty(response.data)
                    ) {
                        extLinkedArticle = pendo._.where(response.data, {
                            UrlName: query,
                        })[0];

                        displayLinkedArticle(extLinkedArticle);
                    } else {
                        // throw error
                        return errorState('article');
                    }
                }
            })
            .catch(function (error) {
                contentLoaded(resultsElement);
                return errorState('article');
            });
    };
})(pendo.dom);
