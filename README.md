# DetHOAXicate - The Hoax Decompiler


## Compliance

Those are *standards* this application should tend to comply with

### schema.org

[schema.org/Article](https://schema.org/Article)  
[schema.org/BlogPosting](https://schema.org/BlogPosting)

### open graph

[open graph article](https://developers.facebook.com/docs/reference/opengraph/object-type/article/)

## Developpers

### Installing

You should first install eslint `^3.1.0` globally  
```
npm i -g eslint@^3.1.0
```

And install node dependencies with
```
npm i
```

<a name='running'></a>
### Running

```
npm start
```

### Testing

```
npm test
```

## API

### POST `api/parse`

You can play with the API with postman [when the app has launched locally](#running), see below button.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/bd735a8cff982ff16977)

### Request

#### Headers
**Content-type** : `application/json`  

#### Body (json)

| key | **type**, (standard)  | description |
| --- | --------- | ------- |
| url | **string, [URL](https://url.spec.whatwg.org//)** | the url referring to the article to parse |
| depth | **integer** | A depth of 0 will only return information about the article itself. A depth of 1 will return the article information plus all the referred articles, ...etc|


### Response
#### Headers
**Content-type** : `application/json`  

#### Body (json)

*The body is a single **ArticleRepresentation** object, see below*

<a name='article-representation-o'></a>
##### ArticleRepresentation object  

| key | type, (standard) | description |
| --- | ----- | ------------ |
| url | **string, [URL](https://url.spec.whatwg.org//)** | the url referring to the article |
| parseSuccess | **boolean** | wether or not the url could be parsed |
| sourcesCandidates | **[[ArticleRepresentation](#article-meta-info-o)] &#124; `null`** | an array of the referred, externals articles candidates. Note that depending on the `depth` request parameter, this field might or might not be `null`.  |
| metaInfo | **[ArticleMetaInfo](#article-description-o)** | a set of meta info about the article, see below |
| standardsCompliance | **[StandardsCompliance](#standards-compliance-o)** | information about the level of compliance with web standards, see below |
| socialLinks | **[string, [URL](https://url.spec.whatwg.org//)]** | An array of social media links embedded in this article|
| internalArticleCandidates | **[string, [URL](https://url.spec.whatwg.org//)]** | An array of probable articles URL referred inside the website |
<a name='article-meta-info-o'></a>
##### ArticleMetaInfo object  

- *This object contains information extracted from `<meta>` tags within the `<head>` of the html page.*  
- *All the above fields are optional, as their is no guaranty the media complies with certain standards.*
- *When a field is provided, it has been validated to comply with both standard and type listed in the table bellow.*
- *See the [STANDARD_META_MAPINGS](/STANDARD_META_MAPINGS.MD) annexe for more details about the mapping*

| key | **type**, (standard) | description |
| --- | ---------| ------------ |
| title | **string** | the title of the article |
| description | **string** | the description of the article |
| authors | [**string**] | the authors of the article |
| provider | **string** | | the provider of this information, falls back to meta 'property=og:site_name' or 'name=author' |
| image | **string** | the url that points to the main poster of the article |
| ogType | **string** | the open graph type, if available (article, blog) |
| section | **string** | the section of the website the article belongs to |
| publishedTime | **string, [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)** | A Date or DateTime representing when the article was published |
| modifiedTime | **string, [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)** | A Date or DateTime representing when the article was last modified |
| locale | **string, [RFC 5646 <sup>1</sup>](https://tools.ietf.org/html/rfc5646)** | the language this article is written in |
| tags | **string** | An array of keywords relevant to the article |

<a name='web-standards'></a>
<sup>**1**</sup> web standards expressed by order of selection (higher order means it will prevail over concurrent tags)

<a name='standards-compliance-o'></a>
##### StandardsCompliance object

*This object provides information about the level of compliance with different standards related to article publication*.  
*Among those standards, [Schema/Article](https://schema.org/Article) and [Open Graph](http://ogp.me/)*.  
*The level of compliance with standards can give some hints about the degree of trustability of the information provider, although it should never be a unique criterion*.

| key | **type**: description |
| --- | ----------------- |

*Not yet specified, falls back to an empty object `{}`*

#### Errors

*To be described*

## Miscellaneous useful tools list
 
https://github.com/mozilla/readability/  
https://www.readability.com/developers/api/parser#
https://readability.com/api/content/v1#articleRepresentation   
https://search.google.com/structured-data/testing-tool  
https://www.npmjs.com/package/schema-org 
https://developers.google.com/schemas/formats/json-ld