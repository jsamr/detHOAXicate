import { Readability } from 'readability'

class ReadabilityCustom extends Readability {
  /**
   * Runs readability.
   *
   * Workflow:
   *  1. Prep the document by removing script tags, css, etc.
   *  2. Build readability's DOM tree.
   *  3. Grab and return the article content from the current dom tree.
   *
   * @return object - the node corresponding to the found article, or null if none was found
   **/
  findArticleNode () {
    // Avoid parsing too large documents, as per configuration option
    if (this._maxElemsToParse > 0) {
      var numTags = this._doc.getElementsByTagName('*').length
      if (numTags > this._maxElemsToParse) {
        throw new Error('Aborting parsing document; ' + numTags + ' elements found')
      }
    }

    if (typeof this._doc.documentElement.firstElementChild === 'undefined') {
      this._getNextNode = this._getNextNodeNoElementProperties
    }
    // Remove script tags from the document.
    this._removeScripts(this._doc)

    // FIXME: Disabled multi-page article support for now as it
    // needs more work on infrastructure.

    // Make sure this document is added to the list of parsed pages first,
    // so we don't double up on the first page.
    // this._parsedPages[uri.spec.replace(/\/$/, '')] = true

    // Pull out any possible next page link first.
    // var nextPageLink = this._findNextPageLink(doc.body)

    this._prepDocument()

    var articleContent = this._grabArticle()
    if (!articleContent) return null
    else return articleContent
  // this._postProcessContent(articleContent)
  }
}

export default ReadabilityCustom
