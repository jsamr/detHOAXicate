# STANDARD META INFO MAPPINGS

This document describes in detail how article meta info is retrieved.

## DOM META MAPPING

| `<meta>` `name` attribute value | MetaInfo field | `type`, standard | weight<sup>[1](#weight)</sup> |
| --------------------- | -------------- | ---------------- | ------ |
| `description` | `description`| `String` | 0 |
| `title` | `title`| `String` | 0 |
| `author` | `authors`| `String` | 0 |
| `publisher` | `provider`| `String` | 0 |

| `<html>` attribute | MetaInfo field | `type`, standard | weight<sup>[1](#weight)</sup> |
| --------------------- | -------------- | ------------- | ---- |
| `lang` | `locale` | `String`, [RFC 5646](https://tools.ietf.org/html/rfc5646)<sup>[2](#bcp47)</sup> | 0 |

## OPEN GRAPH MAPPING

| `<meta>` `property` attribute | MetaInfo field | `type`, standard | weight<sup>[1](#weight)</sup> |
| --------------------- | -------------- | ---------------- | --- |
| `og:site_name` | `provider` | `String` | 1 |
| `og:type` | `ogType` | `String`, [Open Graph Object type](http://ogp.me/#types) | 0 |
| `og:title` | `title` |  `String` | 2 |
| `og:locale` | `locale` | `String`, `language_TERRITORY` ([no standard provided by facebook](http://ogp.me/#optional)) | 0 |
| `og:image` | `image` | `String`, [URL](https://url.spec.whatwg.org/) | 0 |
| `og:description` | `description` | `String` | 1 |
| `article:author` | `authors` | [`String`] | 2 |
| `article:section` | `section` | `String` | 1 |
| `article:modified_time` | `modifiedTime` | `String`, [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) | 2 |
| `article:published_time` | `publishedTime` | `String`, [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) | 2 |
| `article:tag` | `tags` | [`String`] | 2 |

## SCHEMA.ORG MAPPING

| `<meta>` `itemprop` attribute | MetaInfo field | `type`, standard | weight<sup>[1](#weight)</sup> |
| ----------------- | -------------- | ---------------- | --- |
| `articleSection` | `section` | `String` | 0 |
| `dateModified`   | `modifiedTime` | `String`, [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) | 1 |
| `datePublished`| `publishedTime`| `String`, [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) | 1|
| `genre`| `genre` | `String` | 0 |
| `inLanguage` | `locale` | `String`, [RFC 5646](https://tools.ietf.org/html/rfc5646)<sup>[2](#bcp47)</sup> | 3 |
| `contentLocation` | `location` | `String` | 1 |
| `name` | `title` | `String` | 1 |
| `headline`| `title` | `String` | 1 |
| `description` | `description` | `String` | 1 |

## Notes
<a name='weight'></a>
<sup>1</sup> Weight is a criterion used to chose amongst two concurrent values. Higher weighted values will be chosen over lower weighter values. 
 
<a name='bcp47'></a>
<sup>2</sup> RFC 5646 by [BCP 47](http://www.rfc-editor.org/rfc/bcp/bcp47.txt) (Best Current Practice 47)