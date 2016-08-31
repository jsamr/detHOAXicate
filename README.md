# DetHOAXicate - The Hoax Decompiler

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![CircleCI](https://circleci.com/gh/sveinburne/detHOAXicate/tree/master.svg?style=shield)](https://circleci.com/gh/sveinburne/detHOAXicate/tree/master)

## Compliance

Those are *standards* this application should tend to comply with

### schema.org

[schema.org/Article](https://schema.org/Article)  
[schema.org/BlogPosting](https://schema.org/BlogPosting)

### open graph

[open graph article](https://developers.facebook.com/docs/reference/opengraph/object-type/article/)

### dublin core

[dublin core DC meta tags](http://dublincore.org/documents/dcq-html/)

## Developers

### Installing

**Make sure you have npm ande node installed in the versions specified in the [package.json](/package.json) file, field "engineStrict".**  

First, start with those commands

```
git clone https://github.com/sveinburne/detHOAXicate.git
cd detHOAXicate
npm run init
```

**Note:** As the script `npm run init` aims to install babel-cli globally, you might run into trouble if your don't have right access.
Try `sudo npm run init` instead if errors pop up.

<a name='running'></a>
### Running

```
npm start
```

### Testing

```
npm test
```

### Linting

Code style compliance with JS Standard Code Style can be tested with
```
npm run eslint
```

## Contributing

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


### Guidelines

- The UI framework used is [cyclejs](http://cycle.js.org/).
- You *should* use [**the chrome extension**](https://chrome.google.com/webstore/detail/cyclejs/dfgplfmhhmdekalbpejekgfegkonjpfp?hl=en-US) for debugging purpose, and always have a graph of the app streams as a support to reason the app.

#### Streams
The project is configured to use [xstream](http://staltz.com/xstream/), very similar to RxJS but suits best for cyclejs.  

- Stream names must always end with a `$`.

#### Components

Here is a set of rules to follow when you are writing [Components](http://cycle.js.org/components.html).  
This guideline follows the [Model View Intent](http://cycle.js.org/model-view-intent.html) architecture with some little arrangements.  

##### Rules
- A Component must always follow the [Components](http://cycle.js.org/components.html) conventions.
- The main component function, i.e. the exported function must use up to 4 functions :
    - [optional] `intent` : `(DOM) => sources` This function represents the intentions of the user through interactions.
    - [optional] `transform` : `(sources)` => `sources` This function represents transformations applied to sources and intents to create new streams.
    - [mandatory for non static components] `model` : `(sources) => stream$` This function turns sources to a unique stream which elements will be the input of the `view` function.
    - [mandatory] `view` : `(data) => vnode` This function eats data (elements of the `state$` stream created with `model`) and outputs virtual dom elements.
- If the Component is Composed of other components :
    - It should be isolated, see bellow
    - It should be defined in a file named `index.js` inside a folder holding its name
    - Its vdom$ children should only be composed with the depending Components
    - Depending Components that are specific to this component
        - should be defined in the same folder
        - don't need to be isolated
    - Depending Components that are not specific to this component should be defined in the `generics` folder
- If the Component is not composed of other exclusive Components :
    - It should be defined in a file titled after its name, like `AComponent.js`
- Any reusable Component
    - should be defined in the `generics` folder
    - should be isolated


##### Typical definition
A typicall Component function will look like following: 

```javascript
function MyComponent (sources) {
  const intents = intent(sources.DOM)
  const transformedSources = transform({ ...intents, ...sources })
  const state$ = model(transformedSources)
  const vdom$ = state$.map(view)
  return {
    DOM: vdom$,
    isOpen$: intents.buttonState$
  }
}
```

##### Isolating a component

```javascript
@import isolate from '@cycle/isolate'

// ...

function MyComponent (sources) {
  // Component definition
  return {
    DOM: vdom$,
    myComponentSink$
  }
}

/**
* Component description, it is mandatory to provide sources and sinks fields
* @param sources
* @param sources.DOM - the DOM driver
* @return {{ DOM: stream, myComponentSink$: stream}}
*/
export default (sources) => isolate(Component)(sources)
```
Eventually, you can add a `scope` param to be forwarded as the second `isolate` param.  
[See the complete guide about isolation in the official doc](http://cycle.js.org/components.html#multiple-instances-of-the-same-component).


### Git
Before any commit, you MUST : 

- Run a `npm test` command that succeed. The test command also run eslint to validate code style (compliance with JS Standard Code Style, see above badge.)
- Describe the commit message in accordance with our `.gitmessage` template.
- **Never use `-m` option with `git commit`**, otherwise the template will be missed.

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

_The body is a single **ArticleRepresentation** object, see below_

<a name='article-representation-o'></a>
##### ArticleRepresentation object  

| key | type, (standard) | description |
| --- | ----- | ------------ |
| url | **string, [URL](https://url.spec.whatwg.org//)** | the url referring to the article |
| parseSuccess | **boolean** | wether or not the url could be parsed |
| sourcesCandidates | **[[ArticleRepresentation](#article-meta-info-o)] &#124; `null`** | an array of the referred, externals articles candidates. Note that depending on the `depth` request parameter, this field might or might not be `null`.  |
| metaInfo | **[ArticleMetaInfo](#article-description-o)** | a set of meta info about the article, see below |
| sanitizedArticleHtml |**string**, DOM formatted  | The sanitized, readability version of the article. **Only available for the root ArticleRepresentation element** |
| standardsCompliance | **[StandardsCompliance](#standards-compliance-o)** | information about the level of compliance with web standards, see below |
| socialLinks | **[string, [URL](https://url.spec.whatwg.org//)]** | An array of social media links embedded in this article|
| internalArticleCandidates | **[string, [URL](https://url.spec.whatwg.org//)]** | An array of probable articles URL referred inside the website |

<a name='article-meta-info-o'></a>
##### ArticleMetaInfo object  

- *This object contains information extracted from `<meta>` tags within the `<head>` of the html page.*  
- *All the above fields are optional, as their is no guaranty the media complies with certain standards.*
- *When a field is provided, it has been validated to comply with both standard and type listed in the table bellow.*
- *Read the [STANDARD_META_MAPPINGS](/STANDARD_META_MAPPINGS.MD) annexe for more details about the meta info extraction.*

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
All http errors have a 4XX, 5XX status code and a `Content-Type: text/plain` formatted body.

| status | description |
| ------ | ----------- |
| 500 |  Internal server error |
| 422 |  Wrong parameter |
| 406 |  Wrong request body format |

## Miscellaneous useful tools list
 
https://github.com/mozilla/readability/  
https://www.readability.com/developers/api/parser#
https://readability.com/api/content/v1#articleRepresentation   
https://search.google.com/structured-data/testing-tool  
https://www.npmjs.com/package/schema-org 
https://developers.google.com/schemas/formats/json-ld
