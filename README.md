# BookKit Management Tool

Set all pages in the provided book to the given state and trigger indexing of all pages in the book,

## Installation
```
npm install
```

## Usage
```
npm run setState -- -b [bookBaseUri] -p [pageCode] -s [state] -U [accessCode1] -P [accessCode2]
```
### Parameters
* URI to the book.
    * -b, --book ```bookUri```   
* Page code defining the top tree start position
    * - p, --page ```pageCode```   
* State to set.
    * -s, --state ```active```
* Username credentials - access code 1
    * -U, --username ```accessCode1```  
* Username credentials - access code 2         
    * -P, --password ```accessCode2```
* Usage guide
    * -h, --help             
