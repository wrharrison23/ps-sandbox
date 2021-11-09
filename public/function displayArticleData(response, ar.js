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

    var articleContent;
    if (selectedArticle.Summary) {
        if (selectedArticle.Best_Practices__c) {
            articleContent = [
                '<div class="_pendo-section-content-article_" id=" ' +
                    articleId +
                    '" article-id="' +
                    selectedArticle.Id +
                    '">',
                '<div class="_pendo-article-content-main_">',
                '<h2 class="pendo-article-content-title">' +
                    selectedArticle.Title +
                    '</h2>',
                '<div class="pendo-article-content-summary">' +
                    selectedArticle.Summary +
                    '</div>',
                '<div class="pendo-article-content-best-practices _pendo-invisible_">' +
                    '<h3>Best Practices</h3>' +
                    '<div>' +
                    selectedArticle.Best_Practices__c +
                    '</div>' +
                    '</div>',
                '<div class="presentation">' +
                    selectedArticle.Answer__c +
                    '</div>',
                '</div>',
                '</div>',
            ].join('\n');
        } else {
            articleContent = [
                '<div class="_pendo-section-content-article_" id=" ' +
                    articleId +
                    '" article-id="' +
                    selectedArticle.Id +
                    '">',
                '<div class="_pendo-article-content-main_">',
                '<h2 class="pendo-article-content-title">' +
                    selectedArticle.Title +
                    '</h2>',
                '<div class="pendo-article-content-summary">' +
                    selectedArticle.Summary +
                    '</div>',
                '<div class="presentation">' +
                    selectedArticle.Answer__c +
                    '</div>',
                '</div>',
                '</div>',
            ].join('\n');
        }
    } else {
        if (selectedArticle.Best_Practices__c) {
            articleContent = [
                '<div class="_pendo-section-content-article_" id=" ' +
                    articleId +
                    '" article-id="' +
                    selectedArticle.Id +
                    '">',
                '<div class="_pendo-article-content-main_">',
                '<h2 class="pendo-article-content-title">' +
                    selectedArticle.Title +
                    '</h2>',
                '<div class="pendo-article-content-best-practices _pendo-invisible_">' +
                    '<h3>Best Practices</h3>' +
                    '<div>' +
                    selectedArticle.Best_Practices__c +
                    '</div>' +
                    '</div>',
                '<div class="presentation">' +
                    selectedArticle.Answer__c +
                    '</div>',
                '</div>',
                '</div>',
            ].join('\n');
        } else {
            articleContent = [
                '<div class="_pendo-section-content-article_" id=" ' +
                    articleId +
                    '" article-id="' +
                    selectedArticle.Id +
                    '">',
                '<div class="_pendo-article-content-main_">',
                '<h2 class="pendo-article-content-title">' +
                    selectedArticle.Title +
                    '</h2>',
                '<div class="presentation">' +
                    selectedArticle.Answer__c +
                    '</div>',
                '</div>',
                '</div>',
            ].join('\n');
        }
    }
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
var selectedArticle = {};
var articleId = 1;

var articleContent = [
    '<div class="_pendo-section-content-article_" id=" ' +
        articleId +
        '" article-id="' +
        selectedArticle.Id +
        '">',
    '<div class="_pendo-article-content-main_">',
    ...(!selectedArticle.IsVisibleInCsp
        ? [
              '<div class = "pendo-article-content-pill">CoStar Internal Only</div>',
          ]
        : []),
    '<h2 class="pendo-article-content-title">' +
        selectedArticle.Title +
        '</h2>',
    ...(!pendo._.isNull(selectedArticle.Summary)
        ? [
              '<div class="pendo-article-content-summary">' +
                  selectedArticle.Summary +
                  '</div>',
          ]
        : []),
    ...(!pendo._.isNull(selectedArticle.Best_Practices__c)
        ? [
              '<div class="pendo-article-content-best-practices _pendo-invisible_">' +
                  '<h3>Best Practices</h3>' +
                  '<div>' +
                  selectedArticle.Best_Practices__c +
                  '</div>' +
                  '</div>',
          ]
        : []),
    '<div class="presentation">' + selectedArticle.Answer__c + '</div>',
    '</div>',
    '</div>',
].join('\n');
